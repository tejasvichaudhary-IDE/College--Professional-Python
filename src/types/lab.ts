export type Phase = "intro" | "lab" | "module" | "complete";

export type StageId = "define" | "inspect" | "build" | "test" | "review" | "exit";

export type BitState =
  | "idle"
  | "explaining"
  | "pointing"
  | "thinking"
  | "success"
  | "encouraging"
  | "warning"
  | "reviewing";

export type EnvironmentStatus = "not_initialized" | "ready";

export type TestStatus = "idle" | "pass" | "review";

export type BoundaryKind = "error" | "boundary" | "alternative" | "review";

export type NoticeTone = "ok" | "attention";

export interface Notice {
  tone: NoticeTone;
  text: string;
}

export interface TestRecord {
  id: string;
  kindLabel: string;
  input: string;
  expected: string;
  actual: string;
  status: "pass" | "review";
  at: string;
}

export interface TaskSnapshot {
  task: string;
  input: string;
  intendedOutput: string;
  assumption: string;
}

export interface ExitState {
  typeHintTarget: string;
  matches: Record<string, string>;
  unitTestChoice: string;
  pep8Choice: string;
  exceptionWhy: string;
}

export interface LabState {
  phase: Phase;
  currentStage: StageId;
  startedAt: number | null;
  timeUp: boolean;
  voiceToken: number;
  muted: boolean;
  mentorCollapsed: boolean;
  evidenceCollapsed: boolean;
  panelsInitialized: boolean;
  bitState: BitState;
  bitLineId: string;
  bitOverride: string | null;
  notice: Notice | null;
  errors: Record<string, string>;

  task: string;
  input: string;
  intendedOutput: string;
  assumption: string;
  taskSnapshot: TaskSnapshot | null;
  taskSaved: boolean;

  environmentStatus: EnvironmentStatus;
  openedFiles: string[];
  selectedFile: string | null;
  dataShapeViewed: boolean;
  inspectionNote: string;
  savedInspectionNote: string;
  inspectionSaved: boolean;

  code: string;
  savedCode: string;
  codeExplanation: string;
  codeSaved: boolean;
  ranCode: boolean;
  lastRunLog: string;

  normalInput: string;
  normalExpected: string;
  normalActual: string;
  normalStatus: TestStatus;
  normalNote: string;
  normalCode: string;

  boundaryKind: BoundaryKind;
  boundaryInput: string;
  boundaryExpected: string;
  boundaryActual: string;
  boundaryStatus: TestStatus;
  boundaryNote: string;
  boundaryCode: string;

  testHistory: TestRecord[];

  builtSummary: string;
  expectedSummary: string;
  actualSummary: string;
  learnedSummary: string;
  evidenceLink: string;
  evidenceFileName: string;
  responsibleUseDecision: string;
  safetyAcknowledged: boolean;
  evidenceReflection: string;
  interpretationReflection: string;
  reviewSaved: boolean;
  savedReviewHash: string;
  checklist: Record<string, boolean>;

  exit: ExitState;
  exitFeedback: Record<string, string>;
  exitCompleted: boolean;
}
