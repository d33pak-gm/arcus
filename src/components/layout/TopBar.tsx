"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { AppSwitcher } from "./AppSwitcher";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { FileText, Layers, BookOpen, ListChecks } from "lucide-react";

interface TopBarProps {
  app: Doc<"apps">;
  apps: Doc<"apps">[];
  appId: Id<"apps">;
}

const NAV_ITEMS = [
  { label: "PRD", href: "prd", icon: FileText },
  { label: "Stack", href: "stack", icon: Layers },
  { label: "Knowledge", href: "knowledge", icon: BookOpen },
  { label: "Features", href: "features", icon: ListChecks },
];

export function TopBar({ app, apps, appId }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-2 sm:px-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <Image src="/logos/arcus-icon.svg" alt="Arcus" width={24} height={24} />
        <h2 className="text-lg font-heading font-medium hidden sm:block">arcus</h2>
      </div>

      {/* Center: Nav tabs */}
      <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const href = `/app/${appId}/${item.href}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200 shrink-0 sm:px-3 sm:gap-2",
                isActive
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right: App switcher + User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <AppSwitcher currentApp={app} apps={apps} />
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
