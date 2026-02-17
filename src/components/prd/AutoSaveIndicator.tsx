"use client";

import { format } from "date-fns";
import { Check, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved";
  lastSavedAt: Date | null;
}

export function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === "saved" && lastSavedAt) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3 w-3" />
        <span>Saved at {format(lastSavedAt, "h:mm a")}</span>
      </div>
    );
  }

  return null;
}
