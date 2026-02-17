import type { FeatureStatus } from "@/types/feature";
import type { Doc } from "../../convex/_generated/dataModel";
import { FEATURE_STATUSES } from "@/lib/constants";

export const STATUS_CONFIG: Record<FeatureStatus, { label: string; className: string }> = {
  backlog: { label: "Backlog", className: "bg-gray-100 text-gray-700 border-gray-200" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
  testing: { label: "Testing", className: "bg-amber-100 text-amber-700 border-amber-200" },
  complete: { label: "Complete", className: "bg-green-100 text-green-700 border-green-200" },
  live: { label: "Live", className: "bg-purple-100 text-purple-700 border-purple-200" },
};

export interface FeatureGroup {
  release: Doc<"releases"> | null;
  features: Doc<"features">[];
}

export function groupFeaturesByRelease(
  features: Doc<"features">[],
  releases: Doc<"releases">[]
): FeatureGroup[] {
  const groups: FeatureGroup[] = [];

  // Sort releases by order
  const sortedReleases = [...releases].sort((a, b) => a.order - b.order);

  for (const release of sortedReleases) {
    const releaseFeatures = features
      .filter((f) => f.releaseId === release._id)
      .sort((a, b) => a.order - b.order);
    groups.push({ release, features: releaseFeatures });
  }

  // Unassigned features (no releaseId)
  const unassigned = features
    .filter((f) => !f.releaseId)
    .sort((a, b) => a.order - b.order);
  if (unassigned.length > 0 || releases.length === 0) {
    groups.push({ release: null, features: unassigned });
  }

  return groups;
}

export type StatusGroup = Record<FeatureStatus, Doc<"features">[]>;

export function groupFeaturesByStatus(features: Doc<"features">[]): StatusGroup {
  const groups: StatusGroup = {
    backlog: [],
    in_progress: [],
    testing: [],
    complete: [],
    live: [],
  };

  for (const feature of features) {
    groups[feature.status].push(feature);
  }

  for (const status of FEATURE_STATUSES) {
    groups[status].sort((a, b) => a.order - b.order);
  }

  return groups;
}
