"use client";

import { useRouter } from "next/navigation";
import { Doc } from "../../../convex/_generated/dataModel";
import { ChevronDown, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AppSwitcherProps {
  currentApp: Doc<"apps">;
  apps: Doc<"apps">[];
}

export function AppSwitcher({ currentApp, apps }: AppSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md bg-accent/60 px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
      >
        {currentApp.name}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-md border bg-white shadow-md">
          <div className="p-1">
            {apps.map((app) => (
              <button
                key={app._id}
                onClick={() => {
                  router.push(`/app/${app._id}/prd`);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent",
                  app._id === currentApp._id && "bg-accent font-medium"
                )}
              >
                {app.name}
              </button>
            ))}
          </div>
          <div className="border-t p-1">
            <button
              onClick={() => {
                router.push("/setup");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Create New App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
