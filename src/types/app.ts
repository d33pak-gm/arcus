import { Id } from "../../convex/_generated/dataModel";

export type AppType = "Web" | "Mobile" | "Desktop";

export interface TechStack {
  builder?: string[];
  frontend?: string[];
  backend?: string[];
  database?: string[];
  authentication?: string[];
  apis?: string[];
}

export interface App {
  _id: Id<"apps">;
  _creationTime: number;
  name: string;
  type: AppType;
  techStack: TechStack;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}
