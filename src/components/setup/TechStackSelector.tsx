"use client";

import { useState, useRef, useEffect } from "react";
import { TECH_OPTIONS, type TechCategory } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface TechStackSelectorProps {
  techStack: Record<string, string[]>;
  onChange: (techStack: Record<string, string[]>) => void;
}

const CATEGORY_LABELS: Record<TechCategory, string> = {
  builder: "Builder / IDE",
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  authentication: "Authentication",
  apis: "APIs & Services",
};

export function TechStackSelector({ techStack, onChange }: TechStackSelectorProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {(Object.keys(TECH_OPTIONS) as TechCategory[]).map((category) => (
        <CategoryInput
          key={category}
          label={CATEGORY_LABELS[category]}
          options={[...TECH_OPTIONS[category]]}
          selected={techStack[category] || []}
          onSelect={(selected) => {
            onChange({ ...techStack, [category]: selected });
          }}
        />
      ))}
    </div>
  );
}

interface CategoryInputProps {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (selected: string[]) => void;
}

function CategoryInput({ label, options, selected, onSelect }: CategoryInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(opt)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addItem = (item: string) => {
    onSelect([...selected, item]);
    setQuery("");
    setOpen(false);
  };

  const removeItem = (item: string) => {
    onSelect(selected.filter((s) => s !== item));
  };

  return (
    <div ref={containerRef} className="relative">
      <Label className="mb-1.5 block">{label}</Label>
      <Input
        placeholder={`Search ${label.toLowerCase()}...`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {/* Absolute dropdown — stays inside DOM tree (works in dialogs) */}
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-40 overflow-auto rounded-md border bg-white shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                addItem(opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
