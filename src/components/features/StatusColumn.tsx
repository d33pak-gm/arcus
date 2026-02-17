"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { STATUS_CONFIG } from "@/lib/features-utils";
import type { FeatureStatus } from "@/types/feature";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface StatusColumnProps {
  status: FeatureStatus;
  features: Doc<"features">[];
  onEditFeature: (feature: Doc<"features">) => void;
  onDeleteFeature: (featureId: Id<"features">) => void;
  onAddFeature: () => void;
}

export function StatusColumn({
  status,
  features,
  onEditFeature,
  onDeleteFeature,
  onAddFeature,
}: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const featureIds = features.map((f) => f._id);
  const config = STATUS_CONFIG[status];

  // Extract the bg color class for the dot indicator
  const dotBgClass = config.className.split(" ")[0];

  return (
    <div className={`flex w-72 min-w-[18rem] flex-col rounded-lg border bg-white transition-all duration-200 ${isOver ? "border-primary/40 shadow-md" : ""}`}>
      {/* Column header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className={`h-2.5 w-2.5 rounded-full ${dotBgClass}`} />
        <h3 className="flex-1 text-sm font-heading font-semibold">
          {config.label}
        </h3>
        <span className="text-xs text-muted-foreground">{features.length}</span>
        <button
          onClick={onAddFeature}
          className="rounded p-1 hover:bg-accent"
          title={`Add feature to ${config.label}`}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Card list */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[80px] overflow-y-auto transition-colors duration-200 ${isOver ? "bg-accent/40" : ""}`}
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
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              Drag here or click +
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
