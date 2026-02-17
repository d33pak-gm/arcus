"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "@/components/setup/StepIndicator";
import { TechStackSelector } from "@/components/setup/TechStackSelector";
import { APP_TYPES, type AppType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Globe, Smartphone, Monitor, ArrowLeft, ArrowRight, Loader2, GitBranch } from "lucide-react";

const STEP_LABELS = ["Name", "Type", "Tech Stack"];

const TYPE_ICONS: Record<AppType, React.ReactNode> = {
  Web: <Globe className="h-6 w-6" />,
  Mobile: <Smartphone className="h-6 w-6" />,
  Desktop: <Monitor className="h-6 w-6" />,
};

const TYPE_DESCRIPTIONS: Record<AppType, string> = {
  Web: "Web application or SaaS",
  Mobile: "iOS or Android app",
  Desktop: "Desktop application",
};

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const createApp = useMutation(api.apps.createApp);

  const isGitHubImport = searchParams.get("source") === "github";
  const importedName = searchParams.get("name") || "";
  const importedDescription = searchParams.get("description") || "";
  const importedReadme = searchParams.get("readme") || "";
  const importedLanguages = searchParams.get("languages")?.split(",").filter(Boolean) || [];
  const importedRepoUrl = searchParams.get("repoUrl") || "";

  const [step, setStep] = useState(1);
  const [appName, setAppName] = useState(importedName);
  const [appType, setAppType] = useState<AppType | null>(null);
  const [techStack, setTechStack] = useState<Record<string, string[]>>({});
  const [isCreating, setIsCreating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) nameInputRef.current?.focus();
  }, [step]);

  const canGoNext =
    (step === 1 && appName.trim().length > 0) ||
    (step === 2 && appType !== null) ||
    step === 3;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/welcome");
    }
  };

  const buildPrdFromGitHub = () => {
    if (!isGitHubImport || !importedReadme) return undefined;
    let prd = `# ${appName.trim()}\n\n`;
    if (importedDescription) {
      prd += `> ${importedDescription}\n\n`;
    }
    if (importedRepoUrl) {
      prd += `**Repository:** ${importedRepoUrl}\n\n`;
    }
    prd += `---\n\n## README\n\n${importedReadme}`;
    return prd;
  };

  const handleFinish = async () => {
    if (!user || !appType) return;

    setIsCreating(true);
    try {
      const appId = await createApp({
        name: appName.trim(),
        type: appType,
        techStack: {
          builder: techStack.builder || [],
          frontend: techStack.frontend || [],
          backend: techStack.backend || [],
          database: techStack.database || [],
          authentication: techStack.authentication || [],
          apis: techStack.apis || [],
        },
        ownerId: user.id,
        prdContent: buildPrdFromGitHub(),
      });

      router.push(`/app/${appId}/prd`);
    } catch (error) {
      console.error("Failed to create app:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-lg px-4">
        {/* GitHub Import Badge */}
        {isGitHubImport && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            Importing from GitHub
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator
            currentStep={step}
            totalSteps={3}
            labels={STEP_LABELS}
          />
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: App Name */}
            {step === 1 && (
              <div>
                <h2 className="mb-1 text-xl font-heading font-medium">
                  What&apos;s your app called?
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  {isGitHubImport
                    ? "We pre-filled this from your repository. Feel free to change it."
                    : "You can always change this later."}
                </p>
                <div>
                  <Label htmlFor="appName" className="mb-1.5 block">App Name</Label>
                  <Input
                    id="appName"
                    ref={nameInputRef}
                    placeholder="My Awesome App"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canGoNext) handleNext();
                    }}
                  />
                </div>
                {isGitHubImport && importedDescription && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium">Description:</span> {importedDescription}
                  </p>
                )}
                {isGitHubImport && importedLanguages.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">Languages:</span> {importedLanguages.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: App Type */}
            {step === 2 && (
              <div>
                <h2 className="mb-1 text-xl font-heading font-medium">
                  What type of app?
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  This helps us tailor recommendations.
                </p>
                <div className="grid gap-3">
                  {APP_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAppType(type)}
                      className={cn(
                        "flex items-center gap-4 rounded-lg border p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm",
                        appType === type
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          appType === type
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {TYPE_ICONS[type]}
                      </div>
                      <div>
                        <div className="font-medium">{type}</div>
                        <div className="text-sm text-muted-foreground">
                          {TYPE_DESCRIPTIONS[type]}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Tech Stack */}
            {step === 3 && (
              <div>
                <h2 className="mb-1 text-xl font-heading font-medium">
                  Choose your tech stack
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Select the technologies you plan to use. You can skip this and add them later.
                </p>
                <TechStackSelector
                  techStack={techStack}
                  onChange={setTechStack}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} disabled={!canGoNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleFinish}
                disabled={isCreating}
              >
                Skip & Finish
              </Button>
              <Button onClick={handleFinish} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
