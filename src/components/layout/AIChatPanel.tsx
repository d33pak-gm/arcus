"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Send, Loader2, Trash2, Bot, User } from "lucide-react";

interface AIChatPanelProps {
  appId: Id<"apps">;
}

export function AIChatPanel({ appId }: AIChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useQuery(api.chat.getChatMessages, { appId });
  const sendMessage = useMutation(api.chat.sendMessage);
  const clearChat = useMutation(api.chat.clearChat);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    try {
      // Save user message to Convex
      await sendMessage({ appId, role: "user", content: trimmed });

      // Build history from existing messages for context
      const history = (messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call AI API
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          message: trimmed,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || "Failed to get AI response";
        setError(errMsg.includes("rate") ? "Rate limited — please wait a minute and try again." : errMsg);
        return;
      }

      // Save assistant response to Convex (only if non-empty)
      if (data.content?.trim()) {
        await sendMessage({ appId, role: "assistant", content: data.content });
      } else {
        setError("AI returned an empty response. Please try again.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    await clearChat({ appId });
    setError(null);
  };

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:scale-105 transition-all duration-200"
          aria-label="Open AI Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Panel */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-l bg-background transition-all duration-300 ease-in-out",
          open
            ? "fixed inset-0 z-50 w-full sm:static sm:z-auto sm:w-80"
            : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-heading font-medium">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            {messages && messages.length > 0 && (
              <button
                onClick={handleClear}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Empty state */}
          {(!messages || messages.length === 0) && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                How can I help?
              </p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                I know about your PRD, tech stack, features, and knowledge docs.
              </p>
              <div className="flex flex-col gap-1.5 w-full">
                {[
                  "What should I build first?",
                  "Suggest features for my app",
                  "Review my tech stack",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-xs text-left px-3 py-2 rounded-lg border hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm text-muted-foreground transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages?.map((msg) => (
            <div
              key={msg._id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent/60 text-foreground shadow-sm"
                )}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <div className="bg-accent/60 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 text-xs text-destructive animate-fade-in">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
