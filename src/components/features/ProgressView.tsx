"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import type { Doc } from "../../../convex/_generated/dataModel";
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
import { FEATURE_STATUSES } from "@/lib/constants";
import { groupFeaturesByStatus } from "@/lib/features-utils";
import { FeatureCardOverlay } from "./FeatureCard";
import { StatusColumn } from "./StatusColumn";
import type { FeatureStatus } from "@/types/feature";

interface ProgressViewProps {
  features: Doc<"features">[];
  onEditFeature: (feature: Doc<"features">) => void;
  onDeleteFeature: (featureId: Id<"features">) => void;
  onAddFeature: (defaultStatus: FeatureStatus) => void;
}

export function ProgressView({
  features,
  onEditFeature,
  onDeleteFeature,
  onAddFeature,
}: ProgressViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateFeature = useMutation(api.features.updateFeature);

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

  const grouped = useMemo(() => groupFeaturesByStatus(features), [features]);

  const activeFeature = useMemo(() => {
    if (!activeId) return null;
    return features.find((f) => f._id === activeId) ?? null;
  }, [activeId, features]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const featureId = active.id as Id<"features">;
    const overId = over.id as string;

    // Determine target status
    let targetStatus: FeatureStatus;
    let targetFeatures: Doc<"features">[];

    if (FEATURE_STATUSES.includes(overId as FeatureStatus)) {
      // Dropped on a column container
      targetStatus = overId as FeatureStatus;
      targetFeatures = features.filter((f) => f.status === targetStatus);
    } else {
      // Dropped on another feature card
      const overFeature = features.find((f) => f._id === overId);
      if (!overFeature) return;
      targetStatus = overFeature.status;
      targetFeatures = features.filter((f) => f.status === targetStatus);
    }

    // Calculate new order using fractional positioning
    const sortedTarget = [...targetFeatures]
      .filter((f) => f._id !== featureId)
      .sort((a, b) => a.order - b.order);

    let newOrder: number;
    if (sortedTarget.length === 0) {
      newOrder = 1;
    } else if (FEATURE_STATUSES.includes(overId as FeatureStatus)) {
      // Dropped on column itself — append to end
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

    updateFeature({ featureId, status: targetStatus, order: newOrder });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {FEATURE_STATUSES.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            features={grouped[status] ?? []}
            onEditFeature={onEditFeature}
            onDeleteFeature={onDeleteFeature}
            onAddFeature={() => onAddFeature(status)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeFeature ? <FeatureCardOverlay feature={activeFeature} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
