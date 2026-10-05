import type { BoundaryKind } from "../types/lab.ts";

export interface TestPreset {
  id: BoundaryKind | "normal";
  label: string;
  input: string;
  hint: string;
}

export const normalCase: TestPreset = {
  id: "normal",
  label: "Normal case",
  input: "[10, 20, 30]",
  hint: "Three known values. Predict the result before you run.",
};

export const boundaryPresets: Record<BoundaryKind, TestPreset> = {
  error: {
    id: "error",
    label: "Error case",
    input: "[]",
    hint: "Empty input. Predict the exception, or the result if the guard is absent.",
  },
  boundary: {
    id: "boundary",
    label: "Boundary case",
    input: "[5]",
    hint: "A single value. Predict what the mean of one number should be.",
  },
  alternative: {
    id: "alternative",
    label: "Alternative case",
    input: "[2, 4, 6, 8]",
    hint: "A different known list. Predict the result before you run.",
  },
  review: {
    id: "review",
    label: "Review case",
    input: "[10, 20]",
    hint: "A short list you can check by hand. Predict, then compare.",
  },
};

export const boundaryOptions: { id: BoundaryKind; label: string }[] = [
  { id: "error", label: "Error case — empty list" },
  { id: "boundary", label: "Boundary case — one value" },
  { id: "alternative", label: "Alternative case — different numbers" },
  { id: "review", label: "Review case — confirm a known result" },
];
