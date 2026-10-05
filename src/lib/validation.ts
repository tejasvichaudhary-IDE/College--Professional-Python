import { feedback } from "../data/feedback.ts";
import type { LabState } from "../types/lab.ts";
import { analyzeCode } from "./simulation.ts";

export function validateTask(state: LabState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (state.task.trim().length < 15) errors.task = state.task.trim() ? feedback.tooShort : feedback.taskMissing;
  if (state.input.trim().length < 3) errors.input = feedback.inputMissing;
  if (state.intendedOutput.trim().length < 3) errors.intendedOutput = feedback.outputMissing;
  if (state.assumption.trim().length < 12) {
    errors.assumption = state.assumption.trim() ? feedback.tooShort : feedback.assumptionMissing;
  }
  return errors;
}

export function inspectionChecks(state: LabState) {
  return {
    venv: state.environmentStatus === "ready",
    module: state.openedFiles.includes("utility"),
    testFile: state.openedFiles.includes("test"),
    shape: state.dataShapeViewed,
    note: state.inspectionNote.trim().length >= 20,
  };
}

export function validateInspection(state: LabState): Record<string, string> {
  const checks = inspectionChecks(state);
  const errors: Record<string, string> = {};
  if (!checks.venv) errors.environment = feedback.venvMissing;
  if (!checks.module || !checks.testFile) errors.files = feedback.filesMissing;
  if (!checks.shape) errors.shape = feedback.shapeMissing;
  if (!checks.note) errors.inspectionNote = state.inspectionNote.trim() ? feedback.tooShort : feedback.noteMissing;
  return errors;
}

export function validateBuild(state: LabState): Record<string, string> {
  const analysis = analyzeCode(state.code);
  const errors: Record<string, string> = {};
  if (!analysis.hasFunction) errors.code = feedback.needFunction;
  else if (!analysis.hasTypeHint) errors.code = feedback.needTypeHint;
  else if (!analysis.hasException) errors.code = feedback.needException;
  if (state.codeExplanation.trim().length < 20) {
    errors.codeExplanation = state.codeExplanation.trim() ? feedback.tooShort : feedback.needExplanation;
  }
  if (!state.ranCode) errors.run = feedback.needRun;
  return errors;
}

export function validateReview(state: LabState): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = [
    ["builtSummary", state.builtSummary],
    ["expectedSummary", state.expectedSummary],
    ["actualSummary", state.actualSummary],
    ["learnedSummary", state.learnedSummary],
    ["responsibleUseDecision", state.responsibleUseDecision],
    ["evidenceReflection", state.evidenceReflection],
    ["interpretationReflection", state.interpretationReflection],
  ] as const;
  for (const [key, value] of fields) {
    if (value.trim().length < 12) errors[key] = value.trim() ? feedback.tooShort : feedback.reviewMissing;
  }
  if (state.evidenceLink.trim().length < 3 && !state.evidenceFileName) errors.evidenceLink = feedback.reviewMissing;
  if (!state.safetyAcknowledged) errors.safety = feedback.needSafety;
  return errors;
}

export function reviewHash(state: LabState): string {
  return JSON.stringify({
    builtSummary: state.builtSummary,
    expectedSummary: state.expectedSummary,
    actualSummary: state.actualSummary,
    learnedSummary: state.learnedSummary,
    evidenceLink: state.evidenceLink,
    evidenceFileName: state.evidenceFileName,
    responsibleUseDecision: state.responsibleUseDecision,
    safetyAcknowledged: state.safetyAcknowledged,
    evidenceReflection: state.evidenceReflection,
    interpretationReflection: state.interpretationReflection,
  });
}

export function testsReady(state: LabState): boolean {
  const normal =
    state.normalCode === state.code &&
    state.normalStatus !== "idle" &&
    state.normalExpected.trim().length > 0 &&
    state.normalActual.trim().length > 0;
  const boundary =
    state.boundaryCode === state.code &&
    state.boundaryStatus !== "idle" &&
    state.boundaryExpected.trim().length > 0 &&
    state.boundaryActual.trim().length > 0;
  return normal && boundary;
}
