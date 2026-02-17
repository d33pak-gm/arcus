"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, FileText } from "lucide-react";

interface AddKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: Id<"apps">;
}

type Mode = "choose" | "manual" | "url";

export function AddKnowledgeDialog({
  open,
  onOpenChange,
  appId,
}: AddKnowledgeDialogProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createDoc = useMutation(api.knowledge.createKnowledgeDoc);

  const reset = () => {
    setMode("choose");
    setTitle("");
    setSourceUrl("");
    setSaving(false);
    setScraping(false);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleCreateManual = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createDoc({
        appId,
        title: title.trim(),
        content: "",
        sourceType: "manual",
      });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!sourceUrl.trim()) return;
    setError(null);
    setScraping(true);
    try {
      const res = await fetch("/api/firecrawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to scrape URL");
        return;
      }
      const docTitle = title.trim() || data.title || new URL(sourceUrl.trim()).hostname;
      await createDoc({
        appId,
        title: docTitle,
        content: data.markdown || "",
        sourceType: "url",
        sourceUrl: sourceUrl.trim(),
      });
      reset();
      onOpenChange(false);
    } catch {
      setError("Failed to scrape URL. Please check the URL and try again.");
    } finally {
      setScraping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Knowledge Document</DialogTitle>
          <DialogDescription>
            {mode === "choose"
              ? "How would you like to add knowledge?"
              : mode === "url"
                ? "Scrape content from a web page"
                : "Create a blank document to write in"}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" && (
          <div className="grid grid-cols-2 gap-3 py-2">
            <button
              onClick={() => setMode("manual")}
              className="flex flex-col items-center gap-2 rounded-lg border p-6 transition-colors hover:bg-accent/50"
            >
              <FileText className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">From Scratch</span>
              <span className="text-xs text-muted-foreground">
                Create a blank document
              </span>
            </button>
            <button
              onClick={() => setMode("url")}
              className="flex flex-col items-center gap-2 rounded-lg border p-6 transition-colors hover:bg-accent/50"
            >
              <Globe className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">From URL</span>
              <span className="text-xs text-muted-foreground">
                Scrape a web page
              </span>
            </button>
          </div>
        )}

        {mode === "manual" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. API Documentation, Competitor Analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateManual()}
                autoFocus
              />
            </div>
          </div>
        )}

        {mode === "url" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">URL to scrape</Label>
              <Input
                id="sourceUrl"
                placeholder="https://docs.example.com/api"
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleScrapeUrl()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urlTitle">Title (optional)</Label>
              <Input
                id="urlTitle"
                placeholder="Auto-detected from page if empty"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        {mode !== "choose" && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => (mode === "manual" || mode === "url" ? setMode("choose") : handleOpenChange(false))}
              disabled={saving || scraping}
            >
              Back
            </Button>
            {mode === "manual" && (
              <Button onClick={handleCreateManual} disabled={saving || !title.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            )}
            {mode === "url" && (
              <Button onClick={handleScrapeUrl} disabled={scraping || !sourceUrl.trim()}>
                {scraping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {scraping ? "Scraping..." : "Scrape & Save"}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
