export const TECH_OPTIONS = {
  builder: [
    "Lovable",
    "Bolt.new",
    "v0",
    "Replit",
    "Cursor",
    "Claude Code",
  ],
  frontend: [
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Svelte",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
  ],
  backend: [
    "Convex",
    "Supabase",
    "Firebase",
    "Node.js",
    "Python",
    "Go",
    "Django",
    "Express",
  ],
  database: [
    "Convex",
    "Supabase",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Redis",
    "Firebase Firestore",
  ],
  authentication: [
    "Clerk",
    "Supabase Auth",
    "Auth0",
    "Better Auth",
    "Work OS",
    "NextAuth",
    "Firebase Auth",
  ],
  apis: [
    "OpenAI",
    "Anthropic",
    "Cursor",
    "Google Gemini",
    "Stripe",
    "SendGrid",
    "Twilio",
    "Firecrawl",
  ],
} as const;

export type TechCategory = keyof typeof TECH_OPTIONS;

export const APP_TYPES = ["Web", "Mobile", "Desktop"] as const;
export type AppType = (typeof APP_TYPES)[number];

export const FEATURE_STATUSES = [
  "backlog",
  "in_progress",
  "testing",
  "complete",
  "live",
] as const;
export type FeatureStatus = (typeof FEATURE_STATUSES)[number];

export const KNOWLEDGE_TEMPLATES = [
  "pricing",
  "market_validation",
  "customer_persona",
] as const;
export type KnowledgeTemplate = (typeof KNOWLEDGE_TEMPLATES)[number];
