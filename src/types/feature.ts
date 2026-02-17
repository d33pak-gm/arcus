import { Id } from "../../convex/_generated/dataModel";

export type FeatureStatus = "backlog" | "in_progress" | "testing" | "complete" | "live";

export interface Feature {
  _id: Id<"features">;
  _creationTime: number;
  appId: Id<"apps">;
  name: string;
  description: string;
  status: FeatureStatus;
  releaseId?: Id<"releases">;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Release {
  _id: Id<"releases">;
  _creationTime: number;
  appId: Id<"apps">;
  name: string;
  order: number;
  createdAt: number;
}
