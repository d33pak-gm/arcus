"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { FileText, Layers, BookOpen, ListChecks } from "lucide-react";

interface SidebarProps {
  appId: Id<"apps">;
}

const NAV_ITEMS = [
  { label: "PRD", href: "prd", icon: FileText },
  { label: "Stack", href: "stack", icon: Layers },
  { label: "Knowledge", href: "knowledge", icon: BookOpen },
  { label: "Features", href: "features", icon: ListChecks },
];

export function Sidebar({ appId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r bg-background">
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const href = `/app/${appId}/${item.href}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
