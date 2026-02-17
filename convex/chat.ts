import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getChatMessages = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_app_timestamp", (q) => q.eq("appId", args.appId))
      .order("asc")
      .take(50);
    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    appId: v.id("apps"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      appId: args.appId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
    return messageId;
  },
});

export const clearChat = mutation({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
