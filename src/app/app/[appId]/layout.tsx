"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { TopBar } from "@/components/layout/TopBar";
import { AIChatPanel } from "@/components/layout/AIChatPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const appId = params.appId as Id<"apps">;

  const app = useQuery(api.apps.getApp, { appId });
  const userApps = useQuery(
    api.apps.getUserApps,
    user ? { ownerId: user.id } : "skip"
  );

  // Loading state — skeleton shell
  if (!isLoaded || app === undefined) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Skeleton top bar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <Skeleton className="h-6 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  // App not found or not owned by user
  if (app === null || (user && app.ownerId !== user.id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-heading font-medium">App not found</h1>
        <p className="text-muted-foreground">
          This app doesn&apos;t exist or you don&apos;t have access.
        </p>
        <button
          onClick={() => router.push("/welcome")}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Go back to welcome
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar app={app} apps={userApps || []} appId={appId} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <AIChatPanel appId={appId} />
      </div>
    </div>
  );
}
