"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Loader2, Check, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { commands, ICommand } from "@uiw/react-md-editor";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Custom compact heading commands (library defaults show "Heading 1" text which overflows)
const h1Command: ICommand = {
  ...commands.title1,
  icon: <span style={{ fontSize: 13, fontWeight: 700 }}>H<sub>1</sub></span>,
};

const h2Command: ICommand = {
  ...commands.title2,
  icon: <span style={{ fontSize: 13, fontWeight: 700 }}>H<sub>2</sub></span>,
};

const h3Command: ICommand = {
  ...commands.title3,
  icon: <span style={{ fontSize: 13, fontWeight: 700 }}>H<sub>3</sub></span>,
};

const undoCommand: ICommand = {
  name: "undo",
  keyCommand: "undo",
  buttonProps: { "aria-label": "Undo", title: "Undo" },
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  execute: () => {
    document.execCommand("undo");
  },
};

const redoCommand: ICommand = {
  name: "redo",
  keyCommand: "redo",
  buttonProps: { "aria-label": "Redo", title: "Redo" },
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  ),
  execute: () => {
    document.execCommand("redo");
  },
};

// Exact order: B, I, S, Code, H1, H2, H3, Bullet, Numbered, Quote, HR, Link, Undo, Redo
const toolbarCommands = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.code,
  h1Command,
  h2Command,
  h3Command,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.quote,
  commands.hr,
  commands.link,
  undoCommand,
  redoCommand,
];

export default function PRDPage() {
  const params = useParams();
  const appId = params.appId as Id<"apps">;

  const app = useQuery(api.apps.getApp, { appId });
  const prd = useQuery(api.prds.getPRD, { appId });

  const [content, setContent] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { debouncedSave, saveStatus, lastSavedAt } = useAutoSave(prd?._id);

  // Initialize content from DB once
  useEffect(() => {
    if (prd && !initialized) {
      setContent(prd.content);
      setInitialized(true);
    }
  }, [prd, initialized]);

  const handleChange = (value: string | undefined) => {
    const newContent = value ?? "";
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app?.name ?? "App"}-PRD.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (prd === undefined || app === undefined) {
    return (
      <div className="h-full overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-8 w-72" />
              <Skeleton className="mt-2 h-4 w-96" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="mt-6 rounded-lg border" style={{ borderColor: "hsl(30 10% 88%)" }}>
            <Skeleton className="h-11 w-full rounded-b-none" />
            <div className="p-7 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (prd === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No PRD found for this app.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold">
              Product Requirements Document
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Define your product vision, features, and requirements
            </p>
          </div>
          <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              Download .md
            </button>
          </div>
        </div>

        {/* Editor in card */}
        <div className="mt-6 overflow-hidden rounded-lg bg-white" style={{ border: "1px solid hsl(30 10% 88%)" }} data-color-mode="light">
          <MDEditor
            value={content}
            onChange={handleChange}
            preview="edit"
            visibleDragbar={false}
            commands={toolbarCommands}
            extraCommands={[]}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
}
