import type { LabState } from "../types/lab.ts";
import { initialState, STORAGE_KEY } from "./initialState.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizeState(raw: unknown): LabState {
  const base = initialState();
  if (!isRecord(raw)) return base;
  const exit = isRecord(raw.exit) ? raw.exit : {};
  const checklist = isRecord(raw.checklist) ? raw.checklist : {};
  const phases = new Set(["intro", "lab", "module", "complete"]);
  const stages = new Set(["define", "inspect", "build", "test", "review", "exit"]);
  const phase = phases.has(String(raw.phase)) ? (raw.phase as LabState["phase"]) : base.phase;
  const currentStage = stages.has(String(raw.currentStage))
    ? (raw.currentStage as LabState["currentStage"])
    : base.currentStage;
  return {
    ...base,
    ...(raw as Partial<LabState>),
    phase,
    currentStage,
    openedFiles: Array.isArray(raw.openedFiles) ? raw.openedFiles.filter((item) => typeof item === "string") : [],
    testHistory: Array.isArray(raw.testHistory) ? (raw.testHistory as LabState["testHistory"]) : [],
    errors: isRecord(raw.errors) ? (raw.errors as Record<string, string>) : {},
    checklist: { ...base.checklist, ...(checklist as Record<string, boolean>) },
    exit: {
      ...base.exit,
      ...(exit as Partial<LabState["exit"]>),
      matches: isRecord(exit.matches) ? (exit.matches as Record<string, string>) : {},
    },
    exitFeedback: isRecord(raw.exitFeedback) ? (raw.exitFeedback as Record<string, string>) : {},
    code: typeof raw.code === "string" ? raw.code : base.code,
    taskSnapshot: isRecord(raw.taskSnapshot) ? (raw.taskSnapshot as unknown as LabState["taskSnapshot"]) : null,
  };
}

export function loadState(): LabState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return sanitizeState(JSON.parse(raw) as unknown);
  } catch {
    return initialState();
  }
}

export function saveState(state: LabState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The lab remains usable if the browser refuses storage.
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
