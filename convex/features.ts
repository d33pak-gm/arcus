import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const featureStatus = v.union(
  v.literal("backlog"),
  v.literal("in_progress"),
  v.literal("testing"),
  v.literal("complete"),
  v.literal("live")
);

export const getFeatures = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("features")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .collect();
  },
});

export const createFeature = mutation({
  args: {
    appId: v.id("apps"),
    name: v.string(),
    description: v.string(),
    status: featureStatus,
    releaseId: v.optional(v.id("releases")),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("features", {
      appId: args.appId,
      name: args.name,
      description: args.description,
      status: args.status,
      releaseId: args.releaseId,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateFeature = mutation({
  args: {
    featureId: v.id("features"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(featureStatus),
    releaseId: v.optional(v.id("releases")),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { featureId, ...updates } = args;
    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.name !== undefined) filtered.name = updates.name;
    if (updates.description !== undefined) filtered.description = updates.description;
    if (updates.status !== undefined) filtered.status = updates.status;
    if (updates.releaseId !== undefined) filtered.releaseId = updates.releaseId;
    if (updates.order !== undefined) filtered.order = updates.order;
    await ctx.db.patch(featureId, filtered);
  },
});

export const deleteFeature = mutation({
  args: { featureId: v.id("features") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.featureId);
  },
});

export const reorderFeature = mutation({
  args: {
    featureId: v.id("features"),
    releaseId: v.optional(v.id("releases")),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.featureId, {
      releaseId: args.releaseId,
      order: args.order,
      updatedAt: Date.now(),
    });
  },
});

export const bulkCreateFeatures = mutation({
  args: {
    appId: v.id("apps"),
    releases: v.array(v.object({ name: v.string(), order: v.number() })),
    features: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        releaseIndex: v.number(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create releases and collect IDs
    const releaseIds: string[] = [];
    for (const release of args.releases) {
      const id = await ctx.db.insert("releases", {
        appId: args.appId,
        name: release.name,
        order: release.order,
        createdAt: now,
      });
      releaseIds.push(id);
    }

    // Create features linked to releases
    for (const feature of args.features) {
      await ctx.db.insert("features", {
        appId: args.appId,
        name: feature.name,
        description: feature.description,
        status: "backlog",
        releaseId: releaseIds[feature.releaseIndex] as any,
        order: feature.order,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
