<p align="center">
  <img src="public/logos/arcus-logo-dark.svg" alt="Arcus Logo" width="200" />
</p>

<h3 align="center">AI-powered planning workspace for builders</h3>

<p align="center">
  Plan, organize, and build your apps with confidence — powered by AI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Convex-Backend-orange?logo=convex" alt="Convex" />
  <img src="https://img.shields.io/badge/Clerk-Auth-purple?logo=clerk" alt="Clerk" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss" alt="Tailwind CSS" />
</p>

---

## What is Arcus?

Arcus is a planning app for vibe coders and app builders. It helps you organize your app ideas, write PRDs, track features across releases, manage a knowledge base, and collaborate with an AI assistant that understands your entire project context.

## Features

### PRD Editor
Full markdown editor with live preview, auto-save (2s debounce), and one-click download as `.md`. Write your product requirements in one place.

### Tech Stack Manager
Track your stack across 6 categories (Builder, Frontend, Backend, Database, Auth, APIs). Let AI analyze your PRD and suggest the right technologies automatically.

### Knowledge Base
Store reference docs from URLs (auto-scraped), create from scratch, or generate with AI templates — Pricing Strategy, Market Validation, and Customer Persona. All documents are markdown-editable with auto-save.

### Feature Tracking
Two views for managing features:
- **Release View** — Group features into releases, drag-and-drop to reorder
- **Progress View** — Kanban board with 5 columns (Backlog → In Progress → Testing → Complete → Live)

AI can extract features directly from your PRD and organize them into suggested releases.

### AI Assistant
Context-aware chat panel that knows your PRD, tech stack, features, releases, and knowledge docs. Ask questions, get suggestions, and brainstorm — all without leaving the app.

### GitHub Import
Import a repo to prefill your app's name, tech stack, and PRD from the README. Get started faster with existing projects.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI, Lucide Icons |
| Auth | Clerk |
| Database | Convex |
| AI | OpenRouter API (free model tier) |
| Drag & Drop | @dnd-kit |
| Editor | @uiw/react-md-editor |
| Web Scraping | cheerio, @mozilla/readability, turndown |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Clerk](https://clerk.com) account
- A [Convex](https://convex.dev) account
- An [OpenRouter](https://openrouter.ai) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/d33pak-gm/arcus.git
cd arcus

# Install dependencies
npm install
```

### Environment Setup

Copy the example env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/welcome
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/welcome

# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Run

```bash
# Start the Convex backend (first time)
npx convex dev --once

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

> For detailed setup instructions, see [SETUP.md](SETUP.md).

## Project Structure

```
arcus/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── welcome/            # Post-auth welcome screen
│   │   ├── setup/              # App creation wizard
│   │   ├── app/[appId]/        # Main app (PRD, Stack, Knowledge, Features)
│   │   └── api/                # API routes (AI, GitHub, scraping)
│   ├── components/
│   │   ├── ui/                 # Base UI components (button, card, dialog, etc.)
│   │   ├── layout/             # TopBar, Sidebar, AIChatPanel, AppSwitcher
│   │   ├── features/           # Feature cards, release sections, kanban
│   │   ├── knowledge/          # Knowledge grid, dialogs
│   │   ├── prd/                # Markdown editor, auto-save indicator
│   │   └── setup/              # Setup wizard steps
│   ├── hooks/                  # useAutoSave, useKnowledgeAutoSave
│   ├── lib/                    # Utilities, constants, AI client
│   └── types/                  # TypeScript type definitions
├── convex/                     # Database schema, queries, mutations
├── public/                     # Static assets, logos, fonts
└── package.json
```

## Screenshots

<!-- TODO: Add screenshots of the app -->
<!-- Suggested screenshots: -->
<!-- 1. Landing page -->
<!-- 2. PRD Editor -->
<!-- 3. Feature tracking (Kanban view) -->
<!-- 4. AI Chat panel -->
<!-- 5. Knowledge base -->

## License

This project is licensed under the [MIT License](LICENSE).
