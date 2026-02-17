"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { TechStackSelector } from "@/components/setup/TechStackSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StackEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: Id<"apps">;
  currentStack: Record<string, string[]>;
}

export function StackEditDialog({
  open,
  onOpenChange,
  appId,
  currentStack,
}: StackEditDialogProps) {
  const [techStack, setTechStack] = useState<Record<string, string[]>>(currentStack);
  const [saving, setSaving] = useState(false);
  const updateApp = useMutation(api.apps.updateApp);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTechStack({ ...currentStack });
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApp({
        appId,
        techStack: {
          builder: techStack.builder || [],
          frontend: techStack.frontend || [],
          backend: techStack.backend || [],
          database: techStack.database || [],
          authentication: techStack.authentication || [],
          apis: techStack.apis || [],
        },
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tech Stack</DialogTitle>
          <DialogDescription>
            Update the technologies and tools used in this project.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <TechStackSelector techStack={techStack} onChange={setTechStack} />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
