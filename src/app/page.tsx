import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { FileText, Layers, BookOpen, ListChecks, MessageSquare, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "PRD Editor",
    description: "Write and manage your product requirements with a powerful markdown editor and auto-save.",
  },
  {
    icon: Layers,
    title: "Tech Stack",
    description: "Track your technology choices across 6 categories. AI can extract them from your PRD.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Store research, scrape web pages, and generate docs like pricing strategies with AI.",
  },
  {
    icon: ListChecks,
    title: "Feature Tracking",
    description: "Organize features by release with drag-and-drop. Switch to Kanban view to track progress.",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Context-aware AI chat that knows your PRD, stack, features, and knowledge docs.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Extract features from your PRD, generate knowledge documents, and get smart suggestions.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/logos/arcus-icon.svg" alt="Arcus" width={28} height={28} />
            <h2 className="text-xl font-heading font-semibold tracking-tight">arcus</h2>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/welcome">
                <Button size="sm">Go to App</Button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex items-center justify-center py-24 sm:py-32">
          <div className="container px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-5xl font-heading font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Plan & Build Your Apps
                <br />
                <span className="text-muted-foreground">with Confidence</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Arcus is your AI planning workspace for vibe coders and app builders.
                Organize ideas, track features, manage knowledge, and collaborate
                with AI — all in one place.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button size="lg" className="px-8">Get Started Free</Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/welcome">
                    <Button size="lg" className="px-8">Go to Your Apps</Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-heading font-semibold tracking-tight">
                Everything you need to plan your app
              </h2>
              <p className="mt-3 text-muted-foreground">
                From initial idea to feature tracking, Arcus keeps everything organized.
              </p>
            </div>
            <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-background p-6 transition-all duration-200 hover:shadow-md hover:border-primary/20"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-heading font-semibold tracking-tight">
              Ready to start planning?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your first project in under a minute.
            </p>
            <div className="mt-8">
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="px-8">Get Started Free</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/welcome">
                  <Button size="lg" className="px-8">Go to Your Apps</Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Built for vibe coders, by vibe coders.
        </div>
      </footer>
    </div>
  );
}
