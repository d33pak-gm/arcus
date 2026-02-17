"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface ReleaseSectionProps {
  release: Doc<"releases"> | null;
  features: Doc<"features">[];
  onEditRelease?: (release: Doc<"releases">) => void;
  onDeleteRelease?: (releaseId: Id<"releases">) => void;
  onEditFeature: (feature: Doc<"features">) => void;
  onDeleteFeature: (featureId: Id<"features">) => void;
  onAddFeature: (releaseId?: Id<"releases">) => void;
}

export function ReleaseSection({
  release,
  features,
  onEditRelease,
  onDeleteRelease,
  onEditFeature,
  onDeleteFeature,
  onAddFeature,
}: ReleaseSectionProps) {
  const droppableId = release?._id ?? "unassigned";
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  const featureIds = features.map((f) => f._id);

  return (
    <div className="rounded-lg border bg-white">
      {/* Release header */}
      <div className="group flex items-center gap-2 border-b px-4 py-3">
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
        <h3 className="flex-1 text-sm font-heading font-semibold">
          {release ? release.name : "Unassigned"}
        </h3>
        <span className="text-xs text-muted-foreground">
          {features.length} {features.length === 1 ? "feature" : "features"}
        </span>

        {release && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEditRelease?.(release)}
              className="rounded p-1 hover:bg-accent"
              title="Edit release"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => onDeleteRelease?.(release._id)}
              className="rounded p-1 hover:bg-accent"
              title="Delete release"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        <button
          onClick={() => onAddFeature(release?._id)}
          className="rounded p-1 hover:bg-accent"
          title="Add feature"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Features list */}
      <div
        ref={setNodeRef}
        className={`min-h-[40px] transition-colors ${isOver ? "bg-accent/30" : ""}`}
      >
        <SortableContext items={featureIds} strategy={verticalListSortingStrategy}>
          {features.length > 0 ? (
            features.map((feature) => (
              <FeatureCard
                key={feature._id}
                feature={feature}
                onEdit={onEditFeature}
                onDelete={onDeleteFeature}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              No features yet — drag here or click + to add
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
