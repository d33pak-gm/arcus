"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StackEditDialog } from "@/components/stack/StackEditDialog";

const CATEGORIES = [
  { key: "builder" as const, label: "Builder" },
  { key: "frontend" as const, label: "Frontend" },
  { key: "backend" as const, label: "Backend" },
  { key: "database" as const, label: "Database" },
  { key: "authentication" as const, label: "Authentication" },
  { key: "apis" as const, label: "APIs" },
];

export default function StackPage() {
  const params = useParams();
  const appId = params.appId as Id<"apps">;
  const app = useQuery(api.apps.getApp, { appId });
  const prd = useQuery(api.prds.getPRD, { appId });
  const updateApp = useMutation(api.apps.updateApp);
  const [editOpen, setEditOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  if (app === undefined) {
    return (
      <div className="h-full overflow-auto">
        <div className="border-b px-6 py-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6">
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (app === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">App not found.</p>
      </div>
    );
  }

  const techStack = app.techStack || {};
  const hasPrdContent = prd && prd.content && prd.content.trim().length > 50;

  const handleExtractFromPRD = async () => {
    if (!prd?.content) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/ai/extract-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdContent: prd.content }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("API error:", res.status, errBody);
        throw new Error(errBody.error || "Extraction failed");
      }
      const { stack } = await res.json();

      // Merge extracted stack with existing (add new, keep existing)
      const merged: Record<string, string[]> = {};
      for (const key of Object.keys(stack)) {
        const existing = (techStack as Record<string, string[]>)[key] || [];
        const extracted = stack[key] || [];
        const combined = [...new Set([...existing, ...extracted])];
        merged[key] = combined;
      }

      await updateApp({
        appId,
        techStack: {
          builder: merged.builder || [],
          frontend: merged.frontend || [],
          backend: merged.backend || [],
          database: merged.database || [],
          authentication: merged.authentication || [],
          apis: merged.apis || [],
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Extraction failed";
      setExtractError(msg.includes("429") || msg.includes("rate")
        ? "AI models are rate limited. Please wait a minute and try again."
        : msg);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="h-full overflow-auto animate-fade-in">
      {/* Header */}
      <div className="border-b px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold">Tech Stack</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Technologies and tools used in this project
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtractFromPRD}
              disabled={!hasPrdContent || extracting}
              title={!hasPrdContent ? "Add content to your PRD first" : "Extract tech stack from PRD using AI"}
            >
              {extracting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              Extract from PRD
            </Button>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {extractError && (
        <div className="mx-6 mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in">
          {extractError}
        </div>
      )}

      {/* Stack Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ key, label }) => {
            const techs = techStack[key] || [];
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {techs.length > 0 ? (
                      techs.map((tech) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        None selected
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Dialog */}
      <StackEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        appId={appId}
        currentStack={techStack as Record<string, string[]>}
      />
    </div>
  );
}
