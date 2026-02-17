"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  BookOpen,
  DollarSign,
  Globe,
  Users,
  Loader2,
  Trash2,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import { AddKnowledgeDialog } from "@/components/knowledge/AddKnowledgeDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const QUICK_CREATE_TEMPLATES = [
  { type: "pricing", label: "Pricing Strategy", icon: DollarSign },
  { type: "market_validation", label: "Market Validation", icon: Globe },
  { type: "customer_persona", label: "Customer Persona", icon: Users },
];

const SOURCE_ICONS: Record<string, typeof FileText> = {
  url: ExternalLink,
  manual: FileText,
  template: Sparkles,
};

export default function KnowledgePage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as Id<"apps">;

  const app = useQuery(api.apps.getApp, { appId });
  const prd = useQuery(api.prds.getPRD, { appId });
  const docs = useQuery(api.knowledge.getKnowledgeDocs, { appId });
  const createDoc = useMutation(api.knowledge.createKnowledgeDoc);
  const deleteDoc = useMutation(api.knowledge.deleteKnowledgeDoc);

  const [addOpen, setAddOpen] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (app === undefined || prd === undefined || docs === undefined) {
    return (
      <div className="h-full overflow-auto">
        <div className="border-b px-6 py-6">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="p-6">
          <div className="mb-8">
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-1" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-20 mt-4" />
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

  const hasPrdContent =
    prd !== null && prd.content && prd.content.trim().length > 50;

  const handleQuickCreate = async (templateType: string) => {
    if (!prd?.content) return;
    setGenerating(templateType);
    try {
      const res = await fetch("/api/ai/generate-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdContent: prd.content, templateType }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const { title, content } = await res.json();
      await createDoc({
        appId,
        title,
        content,
        sourceType: "template",
        templateType: templateType as "pricing" | "market_validation" | "customer_persona",
      });
    } catch (error) {
      console.error("Failed to generate:", error);
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (docId: Id<"knowledge">) => {
    setDeleting(docId);
    try {
      await deleteDoc({ docId });
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenDoc = (docId: Id<"knowledge">) => {
    router.push(`/app/${appId}/knowledge/${docId}`);
  };

  return (
    <div className="h-full overflow-auto animate-fade-in">
      {/* Header */}
      <div className="border-b px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold">
              Knowledge Base
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Reference documents and research for your project
            </p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Create Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium">Quick Create with AI</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasPrdContent
              ? "Generate documents from your PRD using AI"
              : "Add content to your PRD first to enable AI generation"}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {QUICK_CREATE_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isGenerating = generating === template.type;
              return (
                <button
                  key={template.type}
                  disabled={!hasPrdContent || generating !== null}
                  onClick={() => handleQuickCreate(template.type)}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                  {isGenerating ? "Generating..." : template.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Documents Grid */}
        {docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => {
              const SourceIcon = SOURCE_ICONS[doc.sourceType] || FileText;
              const isDeleting = deleting === doc._id;
              return (
                <Card
                  key={doc._id}
                  className="group cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => handleOpenDoc(doc._id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <SourceIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <CardTitle className="line-clamp-1 text-base font-medium">
                          {doc.title}
                        </CardTitle>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc._id);
                        }}
                        disabled={isDeleting}
                        className="rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {doc.content
                        ? doc.content.replace(/[#*_`>\-]/g, "").slice(0, 150)
                        : "Empty document"}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground/60">
                      Updated{" "}
                      {formatDistanceToNow(doc.updatedAt, { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-muted p-3">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-heading font-medium">
                No knowledge documents yet
              </h3>
              <p className="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
                Add documents from URLs, create from scratch, or use AI to
                generate
              </p>
              <Button
                size="sm"
                className="mt-5"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Knowledge
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Dialog */}
      <AddKnowledgeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        appId={appId}
      />
    </div>
  );
}
