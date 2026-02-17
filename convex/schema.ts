import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Apps table
  apps: defineTable({
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
    ownerId: v.string(), // Clerk user ID
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_created", ["createdAt"]),

  // PRDs table
  prds: defineTable({
    appId: v.id("apps"),
    content: v.string(), // Markdown content
    lastSaved: v.number(),
  })
    .index("by_app", ["appId"]),

  // Knowledge documents
  knowledge: defineTable({
    appId: v.id("apps"),
    title: v.string(),
    content: v.string(), // Markdown content
    sourceType: v.union(v.literal("url"), v.literal("manual"), v.literal("template")),
    sourceUrl: v.optional(v.string()),
    templateType: v.optional(v.union(
      v.literal("pricing"),
      v.literal("market_validation"),
      v.literal("customer_persona")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_created", ["appId", "createdAt"]),

  // Releases
  releases: defineTable({
    appId: v.id("apps"),
    name: v.string(),
    order: v.number(), // For sorting
    createdAt: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_app_order", ["appId", "order"]),

  // Features
  features: defineTable({
    appId: v.id("apps"),
    name: v.string(),
    description: v.string(), // Markdown
    status: v.union(
      v.literal("backlog"),
      v.literal("in_progress"),
      v.literal("testing"),
      v.literal("complete"),
      v.literal("live")
    ),
    releaseId: v.optional(v.id("releases")),
    order: v.number(), // For sorting within release or status column
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_release", ["releaseId"])
    .index("by_app_status", ["appId", "status"])
    .index("by_app_release", ["appId", "releaseId"]),

  // Chat messages
  chatMessages: defineTable({
    appId: v.id("apps"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_app_timestamp", ["appId", "timestamp"]),

  // User preferences
  userPreferences: defineTable({
    userId: v.string(), // Clerk user ID
    lastActiveAppId: v.optional(v.id("apps")),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      sidebarCollapsed: v.optional(v.boolean()),
    })),
  })
    .index("by_user", ["userId"]),
});
