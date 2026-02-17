import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPRD = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prds")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .first();
  },
});

export const updatePRD = mutation({
  args: {
    prdId: v.id("prds"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prdId, {
      content: args.content,
      lastSaved: Date.now(),
    });
  },
});
