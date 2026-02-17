import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useAutoSave(prdId: Id<"prds"> | undefined) {
  const updatePRD = useMutation(api.prds.updatePRD);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (content: string) => {
      if (!prdId) return;

      setSaveStatus("saving");
      try {
        await updatePRD({ prdId, content });
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        setSaveStatus("idle");
      }
    },
    [prdId, updatePRD]
  );

  const debouncedSave = useCallback(
    (content: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        save(content);
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
