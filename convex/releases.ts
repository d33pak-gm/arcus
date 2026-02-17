import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getReleases = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("releases")
      .withIndex("by_app_order", (q) => q.eq("appId", args.appId))
      .collect();
  },
});

export const createRelease = mutation({
  args: {
    appId: v.id("apps"),
    name: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("releases", {
      appId: args.appId,
      name: args.name,
      order: args.order,
      createdAt: Date.now(),
    });
  },
});

export const updateRelease = mutation({
  args: {
    releaseId: v.id("releases"),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { releaseId, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    if (updates.name !== undefined) filtered.name = updates.name;
    if (updates.order !== undefined) filtered.order = updates.order;
    await ctx.db.patch(releaseId, filtered);
  },
});

export const deleteRelease = mutation({
  args: { releaseId: v.id("releases") },
  handler: async (ctx, args) => {
    // Unassign all features from this release
    const features = await ctx.db
      .query("features")
      .withIndex("by_release", (q) => q.eq("releaseId", args.releaseId))
      .collect();
    for (const feature of features) {
      await ctx.db.patch(feature._id, { releaseId: undefined, updatedAt: Date.now() });
    }
    await ctx.db.delete(args.releaseId);
  },
});
