"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListChecks, Loader2, Plus, Sparkles, LayoutList, Columns3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { groupFeaturesByRelease } from "@/lib/features-utils";
import { ReleaseSection } from "@/components/features/ReleaseSection";
import { FeatureCardOverlay } from "@/components/features/FeatureCard";
import { AddEditReleaseDialog } from "@/components/features/AddEditReleaseDialog";
import { AddEditFeatureDialog } from "@/components/features/AddEditFeatureDialog";
import { ProgressView } from "@/components/features/ProgressView";
import type { FeatureStatus } from "@/types/feature";

export default function FeaturesPage() {
  const params = useParams();
  const appId = params.appId as Id<"apps">;

  const releases = useQuery(api.releases.getReleases, { appId });
  const features = useQuery(api.features.getFeatures, { appId });
  const prd = useQuery(api.prds.getPRD, { appId });

  const reorderFeature = useMutation(api.features.reorderFeature);
  const deleteFeature = useMutation(api.features.deleteFeature);
  const deleteRelease = useMutation(api.releases.deleteRelease);
  const bulkCreate = useMutation(api.features.bulkCreateFeatures);

  // View state
  const [viewMode, setViewMode] = useState<"release" | "progress">("release");

  // Dialog state
  const [addReleaseOpen, setAddReleaseOpen] = useState(false);
  const [editRelease, setEditRelease] = useState<Doc<"releases"> | null>(null);
  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [editFeature, setEditFeature] = useState<Doc<"features"> | null>(null);
  const [defaultReleaseId, setDefaultReleaseId] = useState<Id<"releases"> | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<FeatureStatus>("backlog");

  // DnD state (for Release View)
  const [activeId, setActiveId] = useState<string | null>(null);

  // AI extraction state
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.4" } },
    }),
    duration: 250,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const grouped = useMemo(() => {
    if (!features || !releases) return [];
    return groupFeaturesByRelease(features, releases);
  }, [features, releases]);

  const activeFeature = useMemo(() => {
    if (!activeId || !features) return null;
    return features.find((f) => f._id === activeId) ?? null;
  }, [activeId, features]);

  const isLoading = releases === undefined || features === undefined;
  const isEmpty = !isLoading && (features?.length === 0) && (releases?.length === 0);
  const hasPrdContent = prd && prd.content && prd.content.trim().length > 50;

  const nextReleaseOrder = releases ? Math.max(0, ...releases.map((r) => r.order)) + 1 : 0;
  const nextFeatureOrder = features ? Math.max(0, ...features.map((f) => f.order)) + 1 : 0;

  // --- DnD handlers (Release View) ---

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !features || !releases) return;

    const featureId = active.id as Id<"features">;
    const overId = over.id as string;

    // Determine target release
    let targetReleaseId: Id<"releases"> | undefined;
    let targetFeatures: Doc<"features">[];

    if (overId === "unassigned") {
      targetReleaseId = undefined;
      targetFeatures = features.filter((f) => !f.releaseId);
    } else if (releases.some((r) => r._id === overId)) {
      targetReleaseId = overId as Id<"releases">;
      targetFeatures = features.filter((f) => f.releaseId === targetReleaseId);
    } else {
      const overFeature = features.find((f) => f._id === overId);
      if (!overFeature) return;
      targetReleaseId = overFeature.releaseId;
      targetFeatures = features.filter(
        (f) => (f.releaseId ?? "none") === (targetReleaseId ?? "none")
      );
    }

    // Calculate new order using fractional positioning
    const sortedTarget = [...targetFeatures]
      .filter((f) => f._id !== featureId)
      .sort((a, b) => a.order - b.order);

    let newOrder: number;
    if (sortedTarget.length === 0) {
      newOrder = 1;
    } else if (overId === "unassigned" || releases.some((r) => r._id === overId)) {
      newOrder = sortedTarget[sortedTarget.length - 1].order + 1;
    } else {
      const overIndex = sortedTarget.findIndex((f) => f._id === overId);
      if (overIndex === 0) {
        newOrder = sortedTarget[0].order / 2;
      } else if (overIndex === -1) {
        newOrder = sortedTarget[sortedTarget.length - 1].order + 1;
      } else {
        newOrder = (sortedTarget[overIndex - 1].order + sortedTarget[overIndex].order) / 2;
      }
    }

    reorderFeature({ featureId, releaseId: targetReleaseId, order: newOrder });
  }

  // --- AI extraction ---

  async function handleExtractFromPRD() {
    if (!prd?.content) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/ai/extract-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdContent: prd.content }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Extraction failed");
      }
      const { releases: aiReleases } = await res.json();

      const releasesData = aiReleases.map((r: any, i: number) => ({
        name: r.name,
        order: nextReleaseOrder + i,
      }));

      const featuresData: { name: string; description: string; releaseIndex: number; order: number }[] = [];
      aiReleases.forEach((r: any, ri: number) => {
        r.features.forEach((f: any, fi: number) => {
          featuresData.push({
            name: f.name,
            description: f.description,
            releaseIndex: ri,
            order: fi + 1,
          });
        });
      });

      await bulkCreate({ appId, releases: releasesData, features: featuresData });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Extraction failed";
      setExtractError(
        msg.includes("429") || msg.includes("rate")
          ? "AI models are rate limited. Please wait a minute and try again."
          : msg
      );
    } finally {
      setExtracting(false);
    }
  }

  // --- Render ---

  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="border-b px-6 py-6">
          <div className="flex items-start justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-36 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-28" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "release" | "progress")} className="h-full flex flex-col animate-fade-in">
      <div className="h-full overflow-auto flex-1">
        {/* Header */}
        <div className="border-b px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-heading font-semibold">Features</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Plan and organize your app features
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <TabsList>
                <TabsTrigger value="release">
                  <LayoutList className="mr-1.5 h-4 w-4" />
                  Release
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <Columns3 className="mr-1.5 h-4 w-4" />
                  Progress
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractFromPRD}
                  disabled={!hasPrdContent || extracting}
                  title={!hasPrdContent ? "Add content to your PRD first" : "Extract features from PRD using AI"}
                >
                  {extracting ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1.5 h-4 w-4" />
                  )}
                  Extract from PRD
                </Button>
                {viewMode === "release" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddReleaseOpen(true)}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Release
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => {
                    setDefaultReleaseId(undefined);
                    setDefaultStatus("backlog");
                    setAddFeatureOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {extractError && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {extractError}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {isEmpty ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 rounded-full bg-muted p-3">
                  <ListChecks className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-heading font-medium">No features yet</h3>
                <p className="mt-1.5 text-center text-sm text-muted-foreground max-w-sm">
                  Add features manually or extract them from your PRD using AI.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExtractFromPRD}
                    disabled={!hasPrdContent || extracting}
                  >
                    {extracting ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1.5 h-4 w-4" />
                    )}
                    Extract from PRD
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDefaultReleaseId(undefined);
                      setDefaultStatus("backlog");
                      setAddFeatureOpen(true);
                    }}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="release" className="mt-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="space-y-4">
                    {grouped.map((group) => (
                      <ReleaseSection
                        key={group.release?._id ?? "unassigned"}
                        release={group.release}
                        features={group.features}
                        onEditRelease={(r) => setEditRelease(r)}
                        onDeleteRelease={(id) => deleteRelease({ releaseId: id })}
                        onEditFeature={(f) => setEditFeature(f)}
                        onDeleteFeature={(id) => deleteFeature({ featureId: id })}
                        onAddFeature={(releaseId) => {
                          setDefaultReleaseId(releaseId);
                          setDefaultStatus("backlog");
                          setAddFeatureOpen(true);
                        }}
                      />
                    ))}
                  </div>

                  <DragOverlay dropAnimation={dropAnimation}>
                    {activeFeature ? <FeatureCardOverlay feature={activeFeature} /> : null}
                  </DragOverlay>
                </DndContext>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <ProgressView
                  features={features ?? []}
                  onEditFeature={(f) => setEditFeature(f)}
                  onDeleteFeature={(id) => deleteFeature({ featureId: id })}
                  onAddFeature={(status) => {
                    setDefaultStatus(status);
                    setDefaultReleaseId(undefined);
                    setAddFeatureOpen(true);
                  }}
                />
              </TabsContent>
            </>
          )}
        </div>

        {/* Dialogs */}
        <AddEditReleaseDialog
          open={addReleaseOpen}
          onOpenChange={setAddReleaseOpen}
          appId={appId}
          nextOrder={nextReleaseOrder}
        />
        <AddEditReleaseDialog
          open={!!editRelease}
          onOpenChange={(o) => { if (!o) setEditRelease(null); }}
          appId={appId}
          release={editRelease}
          nextOrder={0}
        />
        <AddEditFeatureDialog
          open={addFeatureOpen}
          onOpenChange={setAddFeatureOpen}
          appId={appId}
          releases={releases ?? []}
          defaultReleaseId={defaultReleaseId}
          defaultStatus={defaultStatus}
          nextOrder={nextFeatureOrder}
        />
        <AddEditFeatureDialog
          open={!!editFeature}
          onOpenChange={(o) => { if (!o) setEditFeature(null); }}
          appId={appId}
          releases={releases ?? []}
          feature={editFeature}
          nextOrder={0}
        />
      </div>
    </Tabs>
  );
}
