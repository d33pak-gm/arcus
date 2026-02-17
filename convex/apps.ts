import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createApp = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("Web"), v.literal("Mobile"), v.literal("Desktop")),
    techStack: v.object({
      builder: v.optional(v.array(v.string())),
      frontend: v.optional(v.array(v.string())),
      backend: v.optional(v.array(v.string())),
      database: v.optional(v.array(v.string())),
      authentication: v.optional(v.array(v.string())),
      apis: v.optional(v.array(v.string())),
    }),
    ownerId: v.string(),
    prdContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create the app
    const appId = await ctx.db.insert("apps", {
      name: args.name,
      type: args.type,
      techStack: args.techStack,
      ownerId: args.ownerId,
      createdAt: now,
      updatedAt: now,
    });

    // Create an initial PRD for the app
    const defaultPrd = `Start writing your PRD...\n\n## Overview\nWhat problem does this product solve?\n\n## Goals\nWhat are the key objectives?\n\n## Features\nWhat features will the product have?\n\n## User Stories\nWho are the users and what do they need?\n\n## Success Metrics\nHow will success be measured?\n`;
    await ctx.db.insert("prds", {
      appId,
      content: args.prdContent || defaultPrd,
      lastSaved: now,
    });

    return appId;
  },
});

export const getUserApps = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apps")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const getApp = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

export const updateApp = mutation({
  args: {
    appId: v.id("apps"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("Web"), v.literal("Mobile"), v.literal("Desktop"))),
    techStack: v.optional(v.object({
      builder: v.optional(v.array(v.string())),
      frontend: v.optional(v.array(v.string())),
      backend: v.optional(v.array(v.string())),
      database: v.optional(v.array(v.string())),
      authentication: v.optional(v.array(v.string())),
      apis: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const { appId, ...updates } = args;
    await ctx.db.patch(appId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
