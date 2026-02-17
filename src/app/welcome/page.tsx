"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, GitBranch, Loader2 } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const userApps = useQuery(
    api.apps.getUserApps,
    user ? { ownerId: user.id } : "skip"
  );

  const [importOpen, setImportOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returning user with existing apps → redirect to last app
  useEffect(() => {
    if (isLoaded && userApps && userApps.length > 0) {
      const latestApp = [...userApps].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      router.replace(`/app/${latestApp._id}/prd`);
    }
  }, [isLoaded, userApps, router]);

  // Loading while checking for existing apps
  if (!isLoaded || userApps === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Returning user — show loader while redirecting
  if (userApps.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleImport = async () => {
    if (!repoUrl.trim()) return;
    setError(null);
    setImporting(true);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch repository");
        return;
      }
      // Pass repo data to setup page via query params
      const params = new URLSearchParams({
        name: data.name || "",
        description: data.description || "",
        readme: data.readme || "",
        languages: (data.languages || []).join(","),
        source: "github",
        repoUrl: repoUrl.trim(),
      });
      router.push(`/setup?${params.toString()}`);
    } catch {
      setError("Failed to fetch repository. Please check the URL.");
    } finally {
      setImporting(false);
    }
  };

  // New user with no apps → show welcome screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-xl px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-medium tracking-tight">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mt-3 text-muted-foreground">
            How would you like to get started?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Create New App */}
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
            onClick={() => router.push("/setup")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Create New App</CardTitle>
              <CardDescription>
                Start from scratch with a guided setup
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Import from GitHub */}
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
            onClick={() => setImportOpen(true)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <GitBranch className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Import from GitHub</CardTitle>
              <CardDescription>
                Import an existing project
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* GitHub Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import from GitHub</DialogTitle>
            <DialogDescription>
              Paste a public repository URL to import your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleImport()}
                autoFocus
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              We&apos;ll fetch the repo name, README, and languages to pre-fill your project setup.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing || !repoUrl.trim()}>
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {importing ? "Fetching..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
