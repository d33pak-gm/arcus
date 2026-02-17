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
import { Loader2 } from "lucide-react";

interface AddEditReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: Id<"apps">;
  release?: Doc<"releases"> | null;
  nextOrder: number;
}

export function AddEditReleaseDialog({
  open,
  onOpenChange,
  appId,
  release,
  nextOrder,
}: AddEditReleaseDialogProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const createRelease = useMutation(api.releases.createRelease);
  const updateRelease = useMutation(api.releases.updateRelease);

  const isEditing = !!release;

  useEffect(() => {
    if (open) {
      setName(release?.name || "");
    }
  }, [open, release]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEditing && release) {
        await updateRelease({ releaseId: release._id, name: name.trim() });
      } else {
        await createRelease({ appId, name: name.trim(), order: nextOrder });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Release" : "Add Release"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the release name."
              : "Create a new release to group features."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Label htmlFor="release-name" className="mb-1.5 block">
            Release Name
          </Label>
          <Input
            id="release-name"
            placeholder="e.g., MVP, v1.1, Beta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
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
