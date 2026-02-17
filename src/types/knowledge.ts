import { Id } from "../../convex/_generated/dataModel";

export type KnowledgeSourceType = "url" | "manual" | "template";
export type KnowledgeTemplateType = "pricing" | "market_validation" | "customer_persona";

export interface Knowledge {
  _id: Id<"knowledge">;
  _creationTime: number;
  appId: Id<"apps">;
  title: string;
  content: string;
  sourceType: KnowledgeSourceType;
  sourceUrl?: string;
  templateType?: KnowledgeTemplateType;
  createdAt: number;
  updatedAt: number;
}
