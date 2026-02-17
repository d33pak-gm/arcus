import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useKnowledgeAutoSave(docId: Id<"knowledge"> | undefined) {
  const updateDoc = useMutation(api.knowledge.updateKnowledgeDoc);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (updates: { title?: string; content?: string }) => {
      if (!docId) return;

      setSaveStatus("saving");
      try {
        await updateDoc({ docId, ...updates });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("idle");
      }
    },
    [docId, updateDoc]
  );

  const debouncedSave = useCallback(
    (updates: { title?: string; content?: string }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        save(updates);
      }, 2000);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, saveStatus, lastSavedAt };
}
