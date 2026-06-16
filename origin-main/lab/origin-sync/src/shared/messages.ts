export type LogLevel = "info" | "success" | "warn" | "error";

export type FoundationId = "color" | "typography" | "spacing" | "radius" | "asset";

export type SyncStatus =
  | "not_synced"
  | "in_sync"
  | "out_of_sync"
  | "synced_with_warnings";

export interface DiffEntry {
  tokenPath: string;
  status: "new" | "changed" | "renamed" | "orphaned" | "in_sync";
  oldName?: string;
  newName?: string;
  oldValue?: string;
  newValue?: string;
}

export interface FoundationStatus {
  foundation: FoundationId;
  status: SyncStatus;
  summary: string;
  entries: DiffEntry[];
  variableCount: number;
  styleCount: number;
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  details?: string[];
}

// Plugin → UI messages
export type PluginToUIMessage =
  | { type: "STATUS"; foundations: FoundationStatus[] }
  | { type: "SYNC_STARTED"; foundation: FoundationId }
  | { type: "SYNC_PROGRESS"; foundation: FoundationId; current: number; total: number; phase: string }
  | { type: "SYNC_COMPLETE"; foundation: FoundationId; created: number; updated: number; renamed: number; orphaned: number }
  | { type: "VALIDATION_RESULT"; foundation: FoundationId; result: ValidationResult }
  | { type: "LOG"; entry: { level: LogLevel; message: string; detail?: string } }
  | { type: "ERROR"; message: string };

// UI → Plugin messages
export type UIToPluginMessage =
  | { type: "GET_STATUS" }
  | { type: "SYNC"; foundation: FoundationId }
  | { type: "SYNC_ALL" }
  | { type: "VALIDATE"; foundation: FoundationId }
  | { type: "CANCEL" };
