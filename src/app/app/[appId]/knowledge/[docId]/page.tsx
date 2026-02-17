"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useKnowledgeAutoSave } from "@/hooks/useKnowledgeAutoSave";
import { Loader2, Check, ArrowLeft, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { commands, ICommand } from "@uiw/react-md-editor";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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
];

export default function KnowledgeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as Id<"apps">;
  const docId = params.docId as Id<"knowledge">;

  const doc = useQuery(api.knowledge.getKnowledgeDoc, { docId });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { debouncedSave, saveStatus } = useKnowledgeAutoSave(doc?._id);

  useEffect(() => {
    if (doc && !initialized) {
      setTitle(doc.title);
      setContent(doc.content);
      setInitialized(true);
    }
  }, [doc, initialized]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleContentChange = (value: string | undefined) => {
    const newContent = value ?? "";
    setContent(newContent);
    debouncedSave({ content: newContent });
  };

  if (doc === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (doc === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/app/${appId}/knowledge`)}
              className="rounded p-1 transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-transparent text-2xl font-heading font-semibold outline-none placeholder:text-muted-foreground/50"
                placeholder="Document title..."
              />
              {doc.sourceUrl && (
                <a
                  href={doc.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  {doc.sourceUrl}
                </a>
              )}
            </div>
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
          </div>
        </div>

        {/* Editor */}
        <div
          className="mt-6 overflow-hidden rounded-lg bg-white"
          style={{ border: "1px solid hsl(30 10% 88%)" }}
          data-color-mode="light"
        >
          <MDEditor
            value={content}
            onChange={handleContentChange}
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
