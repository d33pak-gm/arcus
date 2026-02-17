# Skribe - Project Implementation Plan

## Project Overview
Skribe is a planning app for vibe coders and app builders to organize their app ideas, track features, manage knowledge, and collaborate with AI assistance.

**Tech Stack:**
- Next.js 14+ with TypeScript
- Tailwind CSS (Space Grotesk + Work Sans fonts)
- Clerk (Authentication)
- Convex (Database/Backend)
- Anthropic Claude API (AI features)
- Firecrawl API (Web scraping)
- @dnd-kit (Drag & Drop)
- @uiw/react-md-editor (Markdown editing)

---

## Phase 1: Project Foundation & Authentication ⏳

### 1.1 Initialize Project
- [ ] Run `create-next-app` with TypeScript, Tailwind, App Router
- [ ] Install core dependencies (Clerk, Convex, Radix UI, etc.)
- [ ] Install AI & utility packages (Anthropic SDK, date-fns, axios)
- [ ] Install drag-and-drop libraries (@dnd-kit)
- [ ] Install markdown editor (@uiw/react-md-editor)
- [ ] Initialize Convex with `npx convex dev --once`

### 1.2 Environment Setup
- [ ] Create .env.local file
- [ ] Add Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
- [ ] Add Convex deployment URL
- [ ] Add Anthropic API key
- [ ] Add Firecrawl API key
- [ ] Configure Clerk redirect URLs

### 1.3 Database Schema
- [ ] Create convex/schema.ts
- [ ] Define `apps` table (name, type, techStack, ownerId, timestamps)
- [ ] Define `prds` table (appId, content, lastSaved)
- [ ] Define `knowledge` table (appId, title, content, sourceType, sourceUrl, templateType, timestamps)
- [ ] Define `releases` table (appId, name, order, createdAt)
- [ ] Define `features` table (appId, name, description, status, releaseId, order, timestamps)
- [ ] Define `chatMessages` table (appId, role, content, timestamp)
- [ ] Define `userPreferences` table (userId, lastActiveAppId, preferences)
- [ ] Add proper indexes for queries

### 1.4 Base UI Components
- [ ] Create src/lib/utils.ts with cn() helper
- [ ] Create src/components/ui/button.tsx
- [ ] Create src/components/ui/input.tsx
- [ ] Create src/components/ui/card.tsx
- [ ] Create src/components/ui/dialog.tsx
- [ ] Create src/components/ui/dropdown-menu.tsx
- [ ] Create src/components/ui/tabs.tsx
- [ ] Create src/components/ui/select.tsx
- [ ] Create src/components/ui/label.tsx
- [ ] Create src/components/ui/badge.tsx

### 1.5 Styling & Fonts
- [ ] Update tailwind.config.ts with custom fonts
- [ ] Add CSS variables to globals.css
- [ ] Configure font families (Space Grotesk, Work Sans)
- [ ] Set up color scheme with CSS variables
- [ ] Configure border radius and shadow styles
- [ ] Download and add font files to public/fonts

### 1.6 Authentication Setup
- [ ] Create src/app/layout.tsx with ClerkProvider
- [ ] Add ConvexProvider to root layout
- [ ] Create middleware.ts for route protection
- [ ] Create src/app/page.tsx (landing page with Clerk auth)
- [ ] Configure public/protected routes
- [ ] Test authentication flow

### 1.7 Constants & Types
- [ ] Create src/lib/constants.ts with tech stack options
- [ ] Define TECH_OPTIONS object (Builder, Frontend, Backend, etc.)
- [ ] Create src/types/app.ts for app types
- [ ] Create src/types/feature.ts for feature types
- [ ] Create src/types/knowledge.ts for knowledge types

---

## Phase 2: Onboarding Flow ⏳

### 2.1 Welcome Screen
- [ ] Create src/app/welcome/page.tsx
- [ ] Add "Create New App" button
- [ ] Add "Import from GitHub" button (with "Coming Soon" label)
- [ ] Style with minimal clean design
- [ ] Add navigation to /setup on "Create New App"

### 2.2 Setup Wizard
- [ ] Create src/app/setup/page.tsx
- [ ] Create src/components/setup/SetupWizard.tsx
- [ ] Implement step indicator component
- [ ] Create Step 1: App name input
- [ ] Create Step 2: App type selection (Web/Mobile/Desktop)
- [ ] Create Step 3: Tech stack selection
- [ ] Add autocomplete dropdowns for each category
- [ ] Add badge display for selected techs
- [ ] Add "Skip" option for tech stack
- [ ] Add progress navigation (Next, Back, Finish)

### 2.3 Convex App Functions
- [ ] Create convex/apps.ts
- [ ] Implement `createApp` mutation
- [ ] Implement `getUserApps` query
- [ ] Implement `getApp` query
- [ ] Implement `updateApp` mutation
- [ ] Add initial PRD creation in createApp
- [ ] Test app creation flow

### 2.4 Integration
- [ ] Connect setup wizard to Convex
- [ ] Handle form validation
- [ ] Redirect to /app/[appId]/prd after completion
- [ ] Test complete onboarding flow

---

## Phase 3: Main App Shell ⏳

### 3.1 App Layout
- [ ] Create src/app/app/[appId]/layout.tsx
- [ ] Add app context provider
- [ ] Verify user owns the app
- [ ] Handle loading states
- [ ] Handle error states (app not found)

### 3.2 Top Bar
- [ ] Create src/components/layout/TopBar.tsx
- [ ] Add app switcher dropdown
- [ ] Add user profile button (Clerk UserButton)
- [ ] Style with proper spacing

### 3.3 App Switcher
- [ ] Create src/components/layout/AppSwitcher.tsx
- [ ] Query user's apps from Convex
- [ ] Display dropdown with app list
- [ ] Add "Create New App" option
- [ ] Handle app switching navigation
- [ ] Show current app name

### 3.4 Sidebar
- [ ] Create src/components/layout/Sidebar.tsx
- [ ] Add navigation links (PRD, Stack, Knowledge, Features)
- [ ] Add active state styling
- [ ] Add icons using lucide-react
- [ ] Make responsive (collapsible on mobile)

### 3.5 Tab Navigation
- [ ] Create src/components/layout/TabNavigation.tsx
- [ ] Add tabs for 4 screens
- [ ] Handle active tab state
- [ ] Style with rounded borders

### 3.6 AI Chat Panel (Stub)
- [ ] Create src/components/layout/AIChatPanel.tsx (basic structure)
- [ ] Add collapse/expand button
- [ ] Add placeholder content
- [ ] Position on left side (full height)
- [ ] Will be fully implemented in Phase 9

### 3.7 Screen Placeholders
- [ ] Create src/app/app/[appId]/prd/page.tsx (placeholder)
- [ ] Create src/app/app/[appId]/stack/page.tsx (placeholder)
- [ ] Create src/app/app/[appId]/knowledge/page.tsx (placeholder)
- [ ] Create src/app/app/[appId]/features/page.tsx (placeholder)
- [ ] Test navigation between all screens

---

## Phase 4: PRD Screen ⏳

### 4.1 PRD Data Layer
- [ ] Create convex/prds.ts
- [ ] Implement `getPRD` query
- [ ] Implement `updatePRD` mutation
- [ ] Handle auto-save logic
- [ ] Add lastSaved timestamp

### 4.2 Markdown Editor
- [ ] Create src/components/prd/MarkdownEditor.tsx
- [ ] Integrate @uiw/react-md-editor
- [ ] Add markdown preview mode
- [ ] Style editor to match design
- [ ] Make editor full-height

### 4.3 Auto-Save
- [ ] Create src/hooks/useAutoSave.ts
- [ ] Implement 2-second debounce
- [ ] Add saving state tracking
- [ ] Handle errors gracefully

### 4.4 Auto-Save Indicator
- [ ] Create src/components/prd/AutoSaveIndicator.tsx
- [ ] Show "Saving..." during save
- [ ] Show "Saved at HH:MM" when complete
- [ ] Use date-fns for time formatting

### 4.5 Download Feature
- [ ] Create src/components/prd/DownloadButton.tsx
- [ ] Generate markdown file download
- [ ] Use app name in filename
- [ ] Add download icon

### 4.6 PRD Page Integration
- [ ] Update src/app/app/[appId]/prd/page.tsx
- [ ] Fetch PRD from Convex
- [ ] Connect editor to auto-save
- [ ] Add download button to toolbar
- [ ] Test complete PRD flow

---

## Phase 5: Stack Screen ⏳

### 5.1 Stack Display
- [ ] Create src/components/stack/StackDisplay.tsx
- [ ] Display 6 tech categories in grid
- [ ] Show selected techs as badges
- [ ] Add edit capability per category
- [ ] Handle empty state

### 5.2 AI Extraction Setup
- [ ] Create src/lib/ai/prompts.ts
- [ ] Define stack extraction prompt
- [ ] Create convex/ai/extractStack.ts
- [ ] Set up Anthropic client in Convex action
- [ ] Parse JSON response from Claude
- [ ] Update app record with extracted stack

### 5.3 Extract Button
- [ ] Create src/components/stack/ExtractFromPRDButton.tsx
- [ ] Show loading state during extraction
- [ ] Call Convex action
- [ ] Display success/error messages
- [ ] Refresh stack display after extraction

### 5.4 Stack Page Integration
- [ ] Update src/app/app/[appId]/stack/page.tsx
- [ ] Fetch app data from Convex
- [ ] Display current tech stack
- [ ] Add extract from PRD button
- [ ] Test AI extraction flow

---

## Phase 6: Knowledge Screen ⏳

### 6.1 Knowledge Data Layer
- [ ] Create convex/knowledge.ts
- [ ] Implement `getKnowledgeDocs` query
- [ ] Implement `createKnowledge` mutation
- [ ] Implement `updateKnowledge` mutation
- [ ] Implement `deleteKnowledge` mutation
- [ ] Implement `generateFromTemplate` action

### 6.2 Knowledge Grid
- [ ] Create src/components/knowledge/KnowledgeGrid.tsx
- [ ] Create src/components/knowledge/KnowledgeCard.tsx
- [ ] Display knowledge docs in responsive grid
- [ ] Add click to view/edit
- [ ] Add delete option

### 6.3 Quick Create Templates
- [ ] Create src/components/knowledge/QuickCreateSection.tsx
- [ ] Add "Pricing Strategy" button
- [ ] Add "Market Validation" button
- [ ] Add "Customer Persona" button
- [ ] Define template prompts in prompts.ts
- [ ] Call Claude API to generate content
- [ ] Create knowledge doc with generated content

### 6.4 Add Knowledge Dialog
- [ ] Create src/components/knowledge/AddKnowledgeDialog.tsx
- [ ] Add "From URL" option
- [ ] Add "Create from Scratch" option
- [ ] Create URL input form
- [ ] Handle navigation to editor

### 6.5 Firecrawl Integration
- [ ] Create src/app/api/firecrawl/route.ts
- [ ] Accept URL from client
- [ ] Call Firecrawl API server-side
- [ ] Return scraped markdown content
- [ ] Handle errors and rate limits

### 6.6 Knowledge Editor
- [ ] Create src/app/app/[appId]/knowledge/[knowledgeId]/page.tsx
- [ ] Reuse markdown editor component
- [ ] Implement auto-save for knowledge docs
- [ ] Add back navigation button
- [ ] Show document title

### 6.7 Knowledge Page Integration
- [ ] Update src/app/app/[appId]/knowledge/page.tsx
- [ ] Add quick create section at top
- [ ] Add knowledge grid below
- [ ] Add "Add Knowledge" button
- [ ] Test all knowledge flows

---

## Phase 7: Features Screen - Release View ⏳

### 7.1 Releases Data Layer
- [ ] Create convex/releases.ts
- [ ] Implement `getReleases` query
- [ ] Implement `createRelease` mutation
- [ ] Implement `updateRelease` mutation
- [ ] Implement `deleteRelease` mutation

### 7.2 Features Data Layer
- [ ] Create convex/features.ts
- [ ] Implement `getFeaturesByRelease` query
- [ ] Implement `getFeaturesByStatus` query
- [ ] Implement `createFeature` mutation
- [ ] Implement `updateFeature` mutation
- [ ] Implement `deleteFeature` mutation
- [ ] Implement `moveFeatureToRelease` mutation

### 7.3 AI Feature Extraction
- [ ] Create convex/ai/extractFeatures.ts
- [ ] Define feature extraction prompt
- [ ] Read PRD content
- [ ] Call Claude API
- [ ] Parse features with suggested releases
- [ ] Create releases if needed
- [ ] Create feature records
- [ ] Return created features

### 7.4 Release View UI
- [ ] Create src/components/features/ReleaseView.tsx
- [ ] Display releases in vertical list
- [ ] Group features under each release
- [ ] Add "Create Release" button
- [ ] Add "Extract from PRD" button
- [ ] Handle empty state

### 7.5 Draggable Features
- [ ] Create src/components/features/DraggableFeature.tsx
- [ ] Implement @dnd-kit draggable
- [ ] Create src/components/features/FeatureCard.tsx
- [ ] Add drag handle
- [ ] Show feature name and description preview
- [ ] Add edit/delete options

### 7.6 Drag & Drop Logic
- [ ] Set up DndContext in ReleaseView
- [ ] Add sortable contexts for each release
- [ ] Implement onDragEnd handler
- [ ] Update feature's releaseId in Convex
- [ ] Add optimistic updates

---

## Phase 8: Features Screen - Progress View ⏳

### 8.1 Progress View UI
- [ ] Create src/components/features/ProgressView.tsx
- [ ] Create 5 column layout (Backlog, In Progress, Testing, Complete, Live)
- [ ] Create src/components/features/KanbanColumn.tsx
- [ ] Style columns with distinct headers
- [ ] Handle column scrolling

### 8.2 Kanban Drag & Drop
- [ ] Set up DndContext for Kanban
- [ ] Make columns droppable
- [ ] Make feature cards draggable
- [ ] Implement onDragEnd to update status
- [ ] Add visual feedback during drag
- [ ] Update feature status in Convex

### 8.3 Feature Creation Dialog
- [ ] Create src/components/features/CreateFeatureDialog.tsx
- [ ] Add "Feature Ideas" option
- [ ] Add "Create from Scratch" option
- [ ] Create manual form (name, description, status, release)
- [ ] Handle form submission

### 8.4 AI Feature Ideas
- [ ] Create convex/ai/generateFeatureIdeas.ts
- [ ] Define feature ideas prompt
- [ ] Include PRD and existing features as context
- [ ] Call Claude API
- [ ] Return 5 feature suggestions
- [ ] Display in multi-select format
- [ ] Create selected features

### 8.5 View Toggle
- [ ] Create src/components/features/ViewToggle.tsx
- [ ] Toggle between Release and Progress views
- [ ] Persist view preference
- [ ] Style toggle button

### 8.6 Features Page Integration
- [ ] Update src/app/app/[appId]/features/page.tsx
- [ ] Add view toggle at top
- [ ] Conditionally render Release or Progress view
- [ ] Fetch features from Convex
- [ ] Test switching between views
- [ ] Test drag and drop in both views

---

## Phase 9: AI Chat Panel ⏳

### 9.1 Chat Data Layer
- [ ] Create convex/chat.ts
- [ ] Implement `getChatMessages` query
- [ ] Implement `sendMessage` action
- [ ] Call Claude API with context
- [ ] Save user and assistant messages
- [ ] Handle streaming (optional)

### 9.2 Context Gathering
- [ ] Query current app's PRD
- [ ] Query tech stack
- [ ] Query knowledge docs
- [ ] Format context for Claude API
- [ ] Include conversation history

### 9.3 Chat UI
- [ ] Update src/components/layout/AIChatPanel.tsx
- [ ] Create message list component
- [ ] Style user vs assistant messages
- [ ] Add input form at bottom
- [ ] Add send button
- [ ] Add loading indicator

### 9.4 Chat Hook
- [ ] Create src/hooks/useChatPanel.ts
- [ ] Manage open/closed state
- [ ] Handle message sending
- [ ] Handle optimistic message updates
- [ ] Scroll to bottom on new message

### 9.5 Integration
- [ ] Connect chat panel to Convex
- [ ] Test message sending
- [ ] Test AI responses
- [ ] Test context awareness
- [ ] Test collapse/expand functionality

---

## Phase 10: Polish & Production ⏳

### 10.1 Loading States
- [ ] Create src/components/common/LoadingSpinner.tsx
- [ ] Add loading skeletons for all data fetches
- [ ] Add loading states for AI operations
- [ ] Ensure smooth transitions

### 10.2 Error Handling
- [ ] Create src/components/common/ErrorBoundary.tsx
- [ ] Add error states for all data fetches
- [ ] Add error states for AI failures
- [ ] Add retry logic where appropriate
- [ ] Display user-friendly error messages

### 10.3 Empty States
- [ ] Create src/components/common/EmptyState.tsx
- [ ] Add empty state for apps list
- [ ] Add empty state for knowledge grid
- [ ] Add empty state for features
- [ ] Add helpful CTAs in empty states

### 10.4 Animations & Transitions
- [ ] Add smooth page transitions
- [ ] Add hover effects on interactive elements
- [ ] Add drag animations
- [ ] Add loading animations
- [ ] Ensure 60fps performance

### 10.5 Responsive Design
- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Adjust layout for small screens
- [ ] Make sidebar collapsible on mobile
- [ ] Test touch interactions

### 10.6 Performance Optimization
- [ ] Review and optimize Convex queries
- [ ] Add pagination where needed
- [ ] Implement lazy loading for heavy components
- [ ] Optimize bundle size
- [ ] Add React.memo where beneficial

### 10.7 Testing
- [ ] Test complete user journey
- [ ] Test all AI integrations
- [ ] Test drag and drop on different browsers
- [ ] Test auto-save functionality
- [ ] Test error scenarios
- [ ] Test with multiple apps

### 10.8 Deployment
- [ ] Set up Vercel project
- [ ] Configure production environment variables
- [ ] Set up Convex production deployment
- [ ] Deploy to production
- [ ] Test production build
- [ ] Monitor for errors

---

## Progress Tracking

**Current Phase:** Not Started
**Completed Phases:** 0/10
**Overall Progress:** 0%

### Session Notes
- Session 1 (Date): [Add notes here]
- Session 2 (Date): [Add notes here]
- Session 3 (Date): [Add notes here]

### Known Issues
- [Track issues here as they arise]

### Next Session Plan
- [Plan what to tackle next session]

---

## Resources & Links
- Clerk Documentation: https://clerk.com/docs
- Convex Documentation: https://docs.convex.dev
- Anthropic API Documentation: https://docs.anthropic.com
- Firecrawl API Documentation: https://docs.firecrawl.dev
- @dnd-kit Documentation: https://docs.dndkit.com
- Tailwind CSS: https://tailwindcss.com/docs
