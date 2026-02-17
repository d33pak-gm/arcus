"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import type { Doc } from "../../../convex/_generated/dataModel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { FEATURE_STATUSES } from "@/lib/constants";
import { STATUS_CONFIG } from "@/lib/features-utils";
import type { FeatureStatus } from "@/types/feature";

interface AddEditFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: Id<"apps">;
  releases: Doc<"releases">[];
  feature?: Doc<"features"> | null;
  defaultReleaseId?: Id<"releases">;
  defaultStatus?: FeatureStatus;
  nextOrder: number;
}

export function AddEditFeatureDialog({
  open,
  onOpenChange,
  appId,
  releases,
  feature,
  defaultReleaseId,
  defaultStatus,
  nextOrder,
}: AddEditFeatureDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FeatureStatus>("backlog");
  const [releaseId, setReleaseId] = useState<string>("none");
  const [saving, setSaving] = useState(false);
  const createFeature = useMutation(api.features.createFeature);
  const updateFeature = useMutation(api.features.updateFeature);

  const isEditing = !!feature;

  useEffect(() => {
    if (open) {
      if (feature) {
        setName(feature.name);
        setDescription(feature.description);
        setStatus(feature.status);
        setReleaseId(feature.releaseId ?? "none");
      } else {
        setName("");
        setDescription("");
        setStatus(defaultStatus ?? "backlog");
        setReleaseId(defaultReleaseId ?? "none");
      }
    }
  }, [open, feature, defaultReleaseId, defaultStatus]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const selectedReleaseId =
        releaseId === "none" ? undefined : (releaseId as Id<"releases">);

      if (isEditing && feature) {
        await updateFeature({
          featureId: feature._id,
          name: name.trim(),
          description: description.trim(),
          status,
          releaseId: selectedReleaseId,
        });
      } else {
        await createFeature({
          appId,
          name: name.trim(),
          description: description.trim(),
          status,
          releaseId: selectedReleaseId,
          order: nextOrder,
        });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Feature" : "Add Feature"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this feature's details."
              : "Create a new feature for your app."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="feature-name" className="mb-1.5 block">
              Name
            </Label>
            <Input
              id="feature-name"
              placeholder="e.g., User Authentication"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="feature-desc" className="mb-1.5 block">
              Description
            </Label>
            <textarea
              id="feature-desc"
              placeholder="Brief description of the feature..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FeatureStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Release</Label>
              <Select value={releaseId} onValueChange={setReleaseId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {releases.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
