import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getKnowledgeDocs = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledge")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();
  },
});

export const getKnowledgeDoc = query({
  args: { docId: v.id("knowledge") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.docId);
  },
});

export const createKnowledgeDoc = mutation({
  args: {
    appId: v.id("apps"),
    title: v.string(),
    content: v.string(),
    sourceType: v.union(v.literal("url"), v.literal("manual"), v.literal("template")),
    sourceUrl: v.optional(v.string()),
    templateType: v.optional(
      v.union(
        v.literal("pricing"),
        v.literal("market_validation"),
        v.literal("customer_persona")
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("knowledge", {
      appId: args.appId,
      title: args.title,
      content: args.content,
      sourceType: args.sourceType,
      sourceUrl: args.sourceUrl,
      templateType: args.templateType,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateKnowledgeDoc = mutation({
  args: {
    docId: v.id("knowledge"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { docId, ...updates } = args;
    await ctx.db.patch(docId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteKnowledgeDoc = mutation({
  args: { docId: v.id("knowledge") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.docId);
  },
});
