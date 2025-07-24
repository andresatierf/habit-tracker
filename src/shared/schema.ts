import { ViewMode } from "./types";

export const MetadataTypes = ["text", "number", "boolean", "date", "enum"];

export const ViewModes = {
  DAY: "day",
  MONTH: "month",
  HEATMAP: "heatmap",
  LIST: "list",
  TABLE: "table",
} as const satisfies Record<string, ViewMode>;
