import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { chatCompletion } from "@/lib/ai/openrouter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { appId, message, history } = await req.json();

    if (!appId || !message?.trim()) {
      return NextResponse.json(
        { error: "appId and message are required" },
        { status: 400 }
      );
    }

    const typedAppId = appId as Id<"apps">;

    // Gather context from Convex in parallel
    const [app, prd, knowledgeDocs, features, releases] = await Promise.all([
      convex.query(api.apps.getApp, { appId: typedAppId }),
      convex.query(api.prds.getPRD, { appId: typedAppId }),
      convex.query(api.knowledge.getKnowledgeDocs, { appId: typedAppId }),
      convex.query(api.features.getFeatures, { appId: typedAppId }),
      convex.query(api.releases.getReleases, { appId: typedAppId }),
    ]);

    // Build context sections
    const contextParts: string[] = [];

    if (app) {
      contextParts.push(`## App Info\n- Name: ${app.name}\n- Type: ${app.type}`);
      const stack = app.techStack;
      const stackItems = Object.entries(stack)
        .filter(([, v]) => v && v.length > 0)
        .map(([k, v]) => `  - ${k}: ${v!.join(", ")}`)
        .join("\n");
      if (stackItems) {
        contextParts.push(`## Tech Stack\n${stackItems}`);
      }
    }

    if (prd?.content && prd.content.length > 50) {
      const truncatedPrd = prd.content.length > 3000
        ? prd.content.substring(0, 3000) + "\n\n... (truncated)"
        : prd.content;
      contextParts.push(`## PRD (Product Requirements Document)\n${truncatedPrd}`);
    }

    if (knowledgeDocs && knowledgeDocs.length > 0) {
      const knowledgeSummary = knowledgeDocs
        .slice(0, 5)
        .map((doc) => {
          const preview = doc.content.substring(0, 300);
          return `- **${doc.title}**: ${preview}${doc.content.length > 300 ? "..." : ""}`;
        })
        .join("\n");
      contextParts.push(`## Knowledge Documents\n${knowledgeSummary}`);
    }

    if (releases && releases.length > 0) {
      const releaseList = releases.map((r) => `- ${r.name}`).join("\n");
      contextParts.push(`## Releases\n${releaseList}`);
    }

    if (features && features.length > 0) {
      const featureList = features
        .slice(0, 20)
        .map((f) => `- ${f.name} [${f.status}]${f.description ? `: ${f.description.substring(0, 100)}` : ""}`)
        .join("\n");
      contextParts.push(`## Features (${features.length} total)\n${featureList}`);
    }

    const contextBlock = contextParts.length > 0
      ? `\n\nHere is the context about the app:\n\n${contextParts.join("\n\n")}`
      : "";

    const systemPrompt = `You are Arcus AI, a helpful assistant for app planning and development. You're helping with the app "${app?.name || "Unknown"}".${contextBlock}

Guidelines:
- Be concise and practical in your responses
- Reference the app's PRD, features, tech stack, and knowledge when relevant
- Help with planning, feature ideas, technical decisions, and problem-solving
- Format responses with markdown when helpful (headers, lists, code blocks)
- If asked about something not in the context, say so honestly`;

    // Build messages array with history
    const chatHistory: ChatMessage[] = Array.isArray(history)
      ? history.slice(-10)
      : [];

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...chatHistory.map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const content = await chatCompletion({
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    if (!content?.trim()) {
      return NextResponse.json({
        content: "I wasn't able to generate a response. Please try again.",
      });
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Chat error:", errMsg, error);
    return NextResponse.json(
      { error: `Failed to get AI response: ${errMsg}` },
      { status: 500 }
    );
  }
}
