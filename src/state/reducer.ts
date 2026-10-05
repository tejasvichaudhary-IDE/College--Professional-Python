import { feedback } from "../data/feedback.ts";
import { stageById } from "../data/stages.ts";
import { STARTER_CODE } from "../data/starterCode.ts";
import { boundaryPresets } from "../data/testCases.ts";
import { compareExpected } from "../lib/compare.ts";
import { canEnter, isLabComplete, practicalGaps } from "../lib/completion.ts";
import { gradeExit } from "../lib/gradeExit.ts";
import { analyzeCode, sampleLog, simulateCall } from "../lib/simulation.ts";
import {
  inspectionChecks,
  reviewHash,
  testsReady,
  validateBuild,
  validateInspection,
  validateReview,
  validateTask,
} from "../lib/validation.ts";
import type { BitState, BoundaryKind, LabState, StageId } from "../types/lab.ts";
import { initialState } from "./initialState.ts";

export type TextKey =
  | "task"
  | "input"
  | "intendedOutput"
  | "assumption"
  | "inspectionNote"
  | "code"
  | "codeExplanation"
  | "normalInput"
  | "normalExpected"
  | "boundaryInput"
  | "boundaryExpected"
  | "builtSummary"
  | "expectedSummary"
  | "actualSummary"
  | "learnedSummary"
  | "evidenceLink"
  | "responsibleUseDecision"
  | "evidenceReflection"
  | "interpretationReflection"
  | "exceptionWhy";

export type Action =
  | { type: "START"; at: number }
  | { type: "GOTO"; stage: StageId }
  | { type: "SET_TEXT"; key: TextKey; value: string }
  | { type: "SAVE_TASK"; go: boolean }
  | { type: "CREATE_VENV" }
  | { type: "RESET_VENV" }
  | { type: "OPEN_FILE"; fileId: string }
  | { type: "VIEW_SHAPE" }
  | { type: "SAVE_INSPECTION"; go: boolean }
  | { type: "RUN_CODE" }
  | { type: "RESET_CODE" }
  | { type: "SAVE_CODE"; go: boolean }
  | { type: "SET_BOUNDARY"; kind: BoundaryKind }
  | { type: "RUN_TEST"; kind: "normal" | "boundary"; id: string; at: string }
  | { type: "SAVE_REVIEW"; go: boolean }
  | { type: "SET_SAFETY"; value: boolean }
  | { type: "SET_FILE_NAME"; name: string }
  | { type: "TOGGLE_CHECK"; id: string }
  | { type: "SET_MATCH"; termId: string; definitionId: string }
  | { type: "SET_EXIT"; field: "typeHintTarget" | "unitTestChoice" | "pep8Choice"; value: string }
  | { type: "SUBMIT_EXIT" }
  | { type: "SET_BIT"; bitState: BitState; lineId?: string; override?: string | null }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_MENTOR" }
  | { type: "TOGGLE_EVIDENCE" }
  | { type: "COLLAPSE_PANELS_FOR_NARROW" }
  | { type: "MARK_PANELS_INITIALIZED" }
  | { type: "MARK_TIME_UP" }
  | { type: "REVIEW_LAB" }
  | { type: "RETURN_MODULE" }
  | { type: "BACK_TO_EVIDENCE" }
  | { type: "RESET" };

function clearError(errors: Record<string, string>, key: string): Record<string, string> {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}

function attention(state: LabState, errors: Record<string, string>, text: string): LabState {
  return {
    ...state,
    errors,
    notice: { tone: "attention", text },
    bitState: "warning",
    bitOverride: text,
  };
}

function lockMessage(stage: StageId, state: LabState): string {
  switch (stage) {
    case "inspect":
      return "Save the task statement before inspecting the starter.";
    case "build":
      return "Save the inspection note before building.";
    case "test":
      return "Save the utility before testing it.";
    case "review":
      if (!state.codeSaved) return "Save the utility before reviewing the evidence.";
      if ((state.normalCode && state.normalCode !== state.code) || (state.boundaryCode && state.boundaryCode !== state.code)) {
        return feedback.staleTests;
      }
      return feedback.needBothTests;
    case "exit":
      return "Save the decision note before the exit check.";
    default:
      return feedback.locked;
  }
}

function enter(state: LabState, stage: StageId): LabState {
  if (!canEnter(stage, state)) {
    const text = lockMessage(stage, state);
    return { ...state, notice: { tone: "attention", text }, bitState: "warning", bitOverride: text };
  }
  if (state.phase === "lab" && state.currentStage === stage) return { ...state, errors: {}, notice: null };
  const meta = stageById(stage);
  const bitState: BitState =
    stage === "review" || stage === "test" ? "reviewing" : stage === "inspect" ? "pointing" : "explaining";
  return {
    ...state,
    phase: "lab",
    currentStage: stage,
    bitState,
    bitLineId: meta.voiceId,
    bitOverride: null,
    voiceToken: state.voiceToken + 1,
    notice: null,
    errors: {},
  };
}

function taskStillSaved(state: LabState): boolean {
  if (!state.taskSnapshot) return false;
  return (
    state.task === state.taskSnapshot.task &&
    state.input === state.taskSnapshot.input &&
    state.intendedOutput === state.taskSnapshot.intendedOutput &&
    state.assumption === state.taskSnapshot.assumption
  );
}

function inspectionStillSaved(state: LabState): boolean {
  if (!state.savedInspectionNote) return false;
  const checks = inspectionChecks(state);
  return (
    state.inspectionNote === state.savedInspectionNote &&
    checks.venv &&
    checks.module &&
    checks.testFile &&
    checks.shape
  );
}

function reviewStillSaved(state: LabState): boolean {
  return Boolean(state.savedReviewHash) && reviewHash(state) === state.savedReviewHash;
}

function invalidateTests(): Pick<
  LabState,
  "normalActual" | "normalStatus" | "normalNote" | "normalCode" | "boundaryActual" | "boundaryStatus" | "boundaryNote" | "boundaryCode"
> {
  return {
    normalActual: "",
    normalStatus: "idle",
    normalNote: "",
    normalCode: "",
    boundaryActual: "",
    boundaryStatus: "idle",
    boundaryNote: "",
    boundaryCode: "",
  };
}

export function reducer(state: LabState, action: Action): LabState {
  switch (action.type) {
    case "START":
      return enter({ ...state, startedAt: state.startedAt ?? action.at }, "define");
    case "GOTO":
      return enter(state, action.stage);
    case "SET_TEXT":
      return setText(state, action.key, action.value);
    case "SAVE_TASK": {
      const errors = validateTask(state);
      if (Object.keys(errors).length > 0) return attention(state, errors, Object.values(errors)[0] ?? feedback.needAttention);
      const saved: LabState = {
        ...state,
        errors: {},
        taskSaved: true,
        taskSnapshot: {
          task: state.task,
          input: state.input,
          intendedOutput: state.intendedOutput,
          assumption: state.assumption,
        },
        notice: { tone: "ok", text: feedback.taskSaved },
        bitState: "encouraging",
        bitLineId: "taskSaved",
        bitOverride: null,
      };
      if (action.go) return enter(saved, "inspect");
      return { ...saved, voiceToken: state.voiceToken + 1 };
    }
    case "CREATE_VENV": {
      const next: LabState = { ...state, environmentStatus: "ready", errors: clearError(state.errors, "environment") };
      return {
        ...next,
        inspectionSaved: inspectionStillSaved(next),
        bitState: "success",
        bitLineId: "venvReady",
        bitOverride: null,
        voiceToken: state.voiceToken + 1,
        notice: { tone: "ok", text: feedback.venvReady },
      };
    }
    case "RESET_VENV":
      return {
        ...state,
        environmentStatus: "not_initialized",
        inspectionSaved: false,
        bitState: "warning",
        bitOverride: feedback.environmentReset,
        notice: { tone: "attention", text: feedback.environmentReset },
      };
    case "OPEN_FILE":
      return {
        ...state,
        selectedFile: action.fileId,
        openedFiles: state.openedFiles.includes(action.fileId)
          ? state.openedFiles
          : [...state.openedFiles, action.fileId],
        bitState: "pointing",
        errors: clearError(state.errors, "files"),
      };
    case "VIEW_SHAPE":
      return {
        ...state,
        dataShapeViewed: true,
        bitState: "pointing",
        errors: clearError(state.errors, "shape"),
        inspectionSaved: inspectionStillSaved({ ...state, dataShapeViewed: true }),
      };
    case "SAVE_INSPECTION": {
      const errors = validateInspection(state);
      if (Object.keys(errors).length > 0) return attention(state, errors, Object.values(errors)[0] ?? feedback.needAttention);
      const saved: LabState = {
        ...state,
        errors: {},
        inspectionSaved: true,
        savedInspectionNote: state.inspectionNote,
        notice: { tone: "ok", text: feedback.inspectSaved },
        bitState: "encouraging",
        bitLineId: "inspectSaved",
        bitOverride: null,
      };
      if (action.go) return enter(saved, "build");
      return { ...saved, voiceToken: state.voiceToken + 1 };
    }
    case "RUN_CODE": {
      const analysis = analyzeCode(state.code);
      const ok = analysis.hasFunction && analysis.hasTypeHint && analysis.hasException;
      const text = ok
        ? "Simulation finished. Compare the sample call with what you predicted."
        : "The simulation ran. The utility still needs a typed function and an exception path.";
      return {
        ...state,
        ranCode: true,
        lastRunLog: sampleLog(state.code),
        codeSaved: state.code === state.savedCode && state.savedCode !== "",
        errors: clearError(state.errors, "run"),
        bitState: ok ? "success" : "warning",
        bitOverride: text,
        voiceToken: state.voiceToken + 1,
        notice: { tone: ok ? "ok" : "attention", text },
      };
    }
    case "RESET_CODE":
      return {
        ...state,
        code: STARTER_CODE,
        ranCode: false,
        codeSaved: false,
        lastRunLog: "",
        ...invalidateTests(),
        bitState: "explaining",
        bitOverride: feedback.resetCode,
        notice: { tone: "ok", text: feedback.resetCode },
        errors: clearError(state.errors, "code"),
      };
    case "SAVE_CODE": {
      const errors = validateBuild(state);
      if (Object.keys(errors).length > 0) return attention(state, errors, Object.values(errors)[0] ?? feedback.needAttention);
      const saved: LabState = {
        ...state,
        errors: {},
        codeSaved: true,
        savedCode: state.code,
        notice: { tone: "ok", text: feedback.codeSaved },
        bitState: "encouraging",
        bitLineId: "codeSaved",
        bitOverride: null,
      };
      if (action.go) return enter(saved, "test");
      return { ...saved, voiceToken: state.voiceToken + 1 };
    }
    case "SET_BOUNDARY": {
      if (action.kind === state.boundaryKind) return state;
      return {
        ...state,
        boundaryKind: action.kind,
        boundaryInput: boundaryPresets[action.kind].input,
        boundaryActual: "",
        boundaryStatus: "idle",
        boundaryNote: "",
        boundaryCode: "",
        bitState: "pointing",
        bitOverride: "Predict the result for this case before you run it.",
        notice: { tone: "ok", text: "The case input changed. Predict the result, then run the test again." },
      };
    }
    case "RUN_TEST":
      return runTest(state, action.kind, action.id, action.at);
    case "SAVE_REVIEW": {
      const errors = validateReview(state);
      if (Object.keys(errors).length > 0) return attention(state, errors, Object.values(errors)[0] ?? feedback.needAttention);
      const saved: LabState = {
        ...state,
        errors: {},
        reviewSaved: true,
        savedReviewHash: reviewHash(state),
        notice: { tone: "ok", text: feedback.evidenceGood },
        bitState: "success",
        bitLineId: "evidenceGood",
        bitOverride: null,
      };
      if (action.go) return enter(saved, "exit");
      return { ...saved, voiceToken: state.voiceToken + 1 };
    }
    case "SET_SAFETY": {
      const next = { ...state, safetyAcknowledged: action.value, errors: clearError(state.errors, "safety") };
      return { ...next, reviewSaved: reviewStillSaved(next) };
    }
    case "SET_FILE_NAME": {
      const next = {
        ...state,
        evidenceFileName: action.name,
        errors: clearError(state.errors, "evidenceLink"),
        notice: action.name ? { tone: "ok" as const, text: feedback.fileChosen } : state.notice,
      };
      return { ...next, reviewSaved: reviewStillSaved(next) };
    }
    case "TOGGLE_CHECK":
      return {
        ...state,
        checklist: { ...state.checklist, [action.id]: !state.checklist[action.id] },
      };
    case "SET_MATCH":
      return {
        ...state,
        exitCompleted: false,
        exit: { ...state.exit, matches: { ...state.exit.matches, [action.termId]: action.definitionId } },
        exitFeedback: clearError(state.exitFeedback, "matching"),
      };
    case "SET_EXIT":
      return {
        ...state,
        exitCompleted: false,
        exit: { ...state.exit, [action.field]: action.value },
        exitFeedback: clearError(state.exitFeedback, action.field === "typeHintTarget" ? "typeHint" : action.field),
      };
    case "SUBMIT_EXIT":
      return submitExit(state);
    case "SET_BIT":
      return {
        ...state,
        bitState: action.bitState,
        bitLineId: action.lineId ?? state.bitLineId,
        bitOverride: action.override === undefined ? state.bitOverride : action.override,
      };
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    case "TOGGLE_MENTOR":
      return { ...state, mentorCollapsed: !state.mentorCollapsed, panelsInitialized: true };
    case "TOGGLE_EVIDENCE":
      return { ...state, evidenceCollapsed: !state.evidenceCollapsed, panelsInitialized: true };
    case "COLLAPSE_PANELS_FOR_NARROW":
      if (state.panelsInitialized) return state;
      return { ...state, panelsInitialized: true, mentorCollapsed: true, evidenceCollapsed: true };
    case "MARK_PANELS_INITIALIZED":
      if (state.panelsInitialized) return state;
      return { ...state, panelsInitialized: true };
    case "MARK_TIME_UP":
      if (state.timeUp) return state;
      return {
        ...state,
        timeUp: true,
        bitState: "warning",
        bitLineId: "timeUp",
        bitOverride: null,
        voiceToken: state.voiceToken + 1,
      };
    case "REVIEW_LAB":
      return enter({ ...state, phase: "lab" }, "define");
    case "RETURN_MODULE":
      return { ...state, phase: "module" };
    case "BACK_TO_EVIDENCE":
      return { ...state, phase: "complete" };
    case "RESET":
      return initialState();
    default:
      return state;
  }
}

function setText(state: LabState, key: TextKey, value: string): LabState {
  if (key === "exceptionWhy") {
    return {
      ...state,
      exitCompleted: false,
      exit: { ...state.exit, exceptionWhy: value },
      exitFeedback: clearError(state.exitFeedback, "exceptionWhy"),
    };
  }
  if (key === "code") {
    if (value === state.code) return state;
    return {
      ...state,
      code: value,
      ranCode: false,
      codeSaved: false,
      lastRunLog: state.lastRunLog,
      ...invalidateTests(),
      errors: clearError(state.errors, "code"),
    };
  }
  const next: LabState = { ...state, [key]: value, errors: clearError(state.errors, key), notice: null };
  if (key === "task" || key === "input" || key === "intendedOutput" || key === "assumption") {
    return { ...next, taskSaved: taskStillSaved(next) };
  }
  if (key === "inspectionNote") return { ...next, inspectionSaved: inspectionStillSaved(next) };
  if (key === "normalInput" || key === "normalExpected") {
    return { ...next, normalActual: "", normalStatus: "idle", normalNote: "", normalCode: "" };
  }
  if (key === "boundaryInput" || key === "boundaryExpected") {
    return { ...next, boundaryActual: "", boundaryStatus: "idle", boundaryNote: "", boundaryCode: "" };
  }
  if (
    key === "builtSummary" ||
    key === "expectedSummary" ||
    key === "actualSummary" ||
    key === "learnedSummary" ||
    key === "evidenceLink" ||
    key === "responsibleUseDecision" ||
    key === "evidenceReflection" ||
    key === "interpretationReflection"
  ) {
    return { ...next, reviewSaved: reviewStillSaved(next) };
  }
  return next;
}

function runTest(state: LabState, kind: "normal" | "boundary", id: string, at: string): LabState {
  const input = kind === "normal" ? state.normalInput : state.boundaryInput;
  const expected = kind === "normal" ? state.normalExpected : state.boundaryExpected;
  if (!expected.trim()) {
    const key = kind === "normal" ? "normalExpected" : "boundaryExpected";
    return attention(state, { ...state.errors, [key]: feedback.needExpected }, feedback.needExpected);
  }
  const result = simulateCall(state.code, input);
  const status = compareExpected(expected, result.actual);
  const kindLabel = kind === "normal" ? "Normal case" : boundaryPresets[state.boundaryKind].label;
  const next: LabState = {
    ...state,
    errors: clearError(clearError(state.errors, "normalExpected"), "boundaryExpected"),
    testHistory: [
      ...state.testHistory,
      { id, kindLabel, input, expected, actual: result.actual, status, at },
    ].slice(-20),
  };
  const tested =
    kind === "normal"
      ? {
          ...next,
          normalActual: result.actual,
          normalStatus: status,
          normalNote: result.detail,
          normalCode: state.code,
        }
      : {
          ...next,
          boundaryActual: result.actual,
          boundaryStatus: status,
          boundaryNote: result.detail,
          boundaryCode: state.code,
        };
  const both = testsReady(tested);
  let text = status === "pass" ? "Expected and actual agree." : feedback.resultsDiffer;
  let line = status === "pass" ? "normalPass" : "resultsDiffer";
  if (status === "pass" && kind === "normal" && !both) {
    text = feedback.normalPass;
    line = "normalPass";
  }
  if (both) {
    text = feedback.testsRecorded;
    line = "testsRecorded";
  }
  return {
    ...tested,
    notice: { tone: status === "pass" ? "ok" : "attention", text },
    bitState: status === "pass" ? "success" : "warning",
    bitLineId: line,
    bitOverride: null,
    voiceToken: state.voiceToken + 1,
  };
}

function submitExit(state: LabState): LabState {
  const graded = gradeExit(state);
  if (!graded.ok) {
    return {
      ...state,
      exitCompleted: false,
      exitFeedback: graded.feedback,
      bitState: "warning",
      bitOverride: feedback.exitAgain,
      notice: { tone: "attention", text: feedback.exitAgain },
    };
  }
  const withExit: LabState = { ...state, exitCompleted: true, exitFeedback: graded.feedback };
  if (!isLabComplete(withExit)) {
    const gaps = practicalGaps(withExit);
    const text = `${feedback.exitPractical} Still needed: ${gaps.join("; ")}.`;
    return {
      ...withExit,
      bitState: "warning",
      bitOverride: text,
      notice: { tone: "attention", text },
    };
  }
  return {
    ...withExit,
    phase: "complete",
    bitState: "success",
    bitLineId: "complete",
    bitOverride: null,
    voiceToken: state.voiceToken + 1,
    notice: null,
  };
}
