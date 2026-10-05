import { completionLabels, finalEvidence } from "../data/rubrics.ts";
import type { LabState, StageId } from "../types/lab.ts";
import { analyzeCode } from "./simulation.ts";
import { testsReady } from "./validation.ts";

export interface Criterion {
  id: string;
  label: string;
  stage: StageId;
  met: boolean;
}

function savedAnalysis(state: LabState) {
  return analyzeCode(state.codeSaved ? state.savedCode : "");
}

export function getCriteria(state: LabState): Criterion[] {
  const analysis = savedAnalysis(state);
  const normal =
    state.normalCode === state.savedCode &&
    state.codeSaved &&
    state.normalStatus !== "idle" &&
    state.normalExpected.trim().length > 0 &&
    state.normalActual.trim().length > 0;
  const boundary =
    state.boundaryCode === state.savedCode &&
    state.codeSaved &&
    state.boundaryStatus !== "idle" &&
    state.boundaryExpected.trim().length > 0 &&
    state.boundaryActual.trim().length > 0;
  const met: Record<string, boolean> = {
    task: state.taskSaved && state.task.trim().length > 0,
    input: state.taskSaved && state.input.trim().length > 0,
    output: state.taskSaved && state.intendedOutput.trim().length > 0,
    assumption: state.taskSaved && state.assumption.trim().length > 0,
    inspected: state.inspectionSaved,
    implemented:
      state.codeSaved &&
      analysis.hasFunction &&
      state.ranCode &&
      state.code === state.savedCode &&
      state.codeExplanation.trim().length >= 20,
    typed: state.codeSaved && analysis.hasTypeHint,
    exception: state.codeSaved && analysis.hasException,
    normal,
    boundary,
    comparison: normal && boundary,
    result: state.reviewSaved && state.actualSummary.trim().length >= 12,
    limitation: state.reviewSaved && state.learnedSummary.trim().length >= 12,
    decision: state.reviewSaved && state.safetyAcknowledged && state.responsibleUseDecision.trim().length >= 12,
    evidence: state.reviewSaved && (state.evidenceLink.trim().length >= 3 || Boolean(state.evidenceFileName)),
    exit: state.exitCompleted,
  };
  return completionLabels.map((item) => ({
    id: item.id,
    label: item.label,
    stage: item.stage,
    met: Boolean(met[item.id]),
  }));
}

export function isLabComplete(state: LabState): boolean {
  return getCriteria(state).every((item) => item.met);
}

export function stageComplete(stage: StageId, state: LabState): boolean {
  switch (stage) {
    case "define":
      return state.taskSaved;
    case "inspect":
      return state.inspectionSaved;
    case "build":
      return state.codeSaved && state.code === state.savedCode;
    case "test":
      return state.codeSaved && testsReady(state);
    case "review":
      return state.reviewSaved;
    case "exit":
      return state.exitCompleted;
    default:
      return false;
  }
}

export function canEnter(stage: StageId, state: LabState): boolean {
  switch (stage) {
    case "define":
      return true;
    case "inspect":
      return state.taskSaved;
    case "build":
      return state.inspectionSaved;
    case "test":
      return state.codeSaved;
    case "review":
      return state.codeSaved && testsReady(state);
    case "exit":
      return state.reviewSaved;
    default:
      return false;
  }
}

export function finalChecks(state: LabState): { id: string; label: string; met: boolean }[] {
  const criteria = getCriteria(state);
  const byId = Object.fromEntries(criteria.map((item) => [item.id, item.met]));
  return finalEvidence.map((item) => ({
    id: item.id,
    label: item.label,
    met: item.id === "exception" ? Boolean(byId.exception && byId.boundary) : Boolean(byId[item.id]),
  }));
}

export function practicalGaps(state: LabState): string[] {
  return getCriteria(state)
    .filter((item) => item.id !== "exit" && !item.met)
    .map((item) => item.label);
}
