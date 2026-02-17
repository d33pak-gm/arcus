# Skribe Setup Guide

## Quick Start

### 1. Get Your Clerk API Keys

1. Go to [clerk.com](https://clerk.com) and sign up
2. Click **"+ Create Application"**
3. Name it "Skribe" (or whatever you like)
4. Choose your authentication methods (Email, Google, GitHub, etc.)
5. Click **Create Application**
6. You'll see your API keys - copy them!

### 2. Add Keys to .env.local

Open your `.env.local` file and add:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Copy from Clerk dashboard
CLERK_SECRET_KEY=sk_test_... # Copy from Clerk dashboard

# Clerk URLs (these are already correct)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/welcome
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/welcome
```

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Test Authentication

Open your browser and go to:
- **Landing Page**: http://localhost:3000
- **Sign Up**: http://localhost:3000/sign-up
- **Sign In**: http://localhost:3000/sign-in

You should see:
- ✅ A beautiful landing page with auth buttons
- ✅ Clerk's sign-up form
- ✅ Clerk's sign-in form

## What's Working Now

- ✅ Landing page with header and hero section
- ✅ Sign In / Sign Up pages with Clerk
- ✅ Protected routes (middleware)
- ✅ User authentication flow
- ✅ Responsive design with Tailwind
- ✅ Convex database integration

## AI Configuration

We use **OpenRouter API** with free-tier models for AI features:
- Feature extraction from PRDs
- Knowledge generation
- Tech stack analysis
- Feature ideas generation
- Context-aware chat assistant

Add your OpenRouter key to `.env.local`:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
```

Get a free API key at [openrouter.ai](https://openrouter.ai).

## Next Steps (After Testing)

Once authentication is working, we'll add:
- Welcome screen
- App creation wizard
- Main app interface

## Need Help?

If you see any errors:
1. Make sure your Clerk keys are correct in `.env.local`
2. Restart the dev server after adding keys (`npm run dev`)
3. Check that you're using the right keys (publishable key starts with `pk_`, secret key starts with `sk_`)
