"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/features-utils";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeatureCardProps {
  feature: Doc<"features">;
  onEdit: (feature: Doc<"features">) => void;
  onDelete: (featureId: Id<"features">) => void;
}

export function FeatureCard({ feature, onEdit, onDelete }: FeatureCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms ease, opacity 200ms ease",
    opacity: isDragging ? 0.3 : 1,
    scale: isDragging ? "0.98" : "1",
  };

  const statusConfig = STATUS_CONFIG[feature.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0 hover:bg-accent/50 transition-all duration-200 ${isDragging ? "border-dashed border-muted-foreground/20 bg-muted/40" : ""}`}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{feature.name}</p>
        {feature.description && (
          <p className="truncate text-xs text-muted-foreground">
            {feature.description}
          </p>
        )}
      </div>

      <Badge variant="outline" className={statusConfig.className}>
        {statusConfig.label}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white shadow-lg border">
          <DropdownMenuItem onClick={() => onEdit(feature)} className="cursor-pointer">
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(feature._id)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Simplified version for DragOverlay
export function FeatureCardOverlay({ feature }: { feature: Doc<"features"> }) {
  const statusConfig = STATUS_CONFIG[feature.status];

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 shadow-xl ring-1 ring-black/5 rotate-[1.5deg] scale-[1.03] transition-transform">
      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{feature.name}</p>
      </div>
      <Badge variant="outline" className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    </div>
  );
}
