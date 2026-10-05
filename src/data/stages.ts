import type { StageId } from "../types/lab.ts";
import type { VoiceLineId } from "./voiceLines.ts";

export interface StageMeta {
  id: StageId;
  index: number | null;
  nav: string;
  title: string;
  time: string;
  voiceId: VoiceLineId;
  summary: string;
}

export const labStages: StageMeta[] = [
  {
    id: "define",
    index: 1,
    nav: "Task",
    title: "1. Define the Task",
    time: "0–2 min",
    voiceId: "define",
    summary:
      "State the question or task, the input, the intended output, and one assumption. Evidence: a one-sentence task statement.",
  },
  {
    id: "inspect",
    index: 2,
    nav: "Inspect",
    title: "2. Inspect the Starter",
    time: "2–5 min",
    voiceId: "inspect",
    summary:
      "Open the starter artifact and inspect the inputs, environment, and data shape. Evidence: an inspection note.",
  },
  {
    id: "build",
    index: 3,
    nav: "Build",
    title: "3. Build the Utility",
    time: "5–9 min",
    voiceId: "build",
    summary:
      "Implement the main operation from the module. Evidence: working code in the editor, treated here as the repository change.",
  },
  {
    id: "test",
    index: 4,
    nav: "Test",
    title: "4. Test It",
    time: "9–12 min",
    voiceId: "test",
    summary:
      "Test a normal case and one boundary, error, alternative, or review case. Evidence: expected versus actual result.",
  },
  {
    id: "review",
    index: 5,
    nav: "Review",
    title: "5. Review & Responsible Use",
    time: "12–15 min",
    voiceId: "review",
    summary:
      "Record the result, a limitation, and a responsible-use decision. Evidence: a decision note and an evidence link or file.",
  },
];

export const exitStage: StageMeta = {
  id: "exit",
  index: null,
  nav: "Exit check",
  title: "Exit check",
  time: "After the lab",
  voiceId: "exit",
  summary:
    "Explain the role of an environment, module, type hint, exception handler, unit test, and PEP 8 style rule.",
};

export const stageOrder: StageId[] = ["define", "inspect", "build", "test", "review", "exit"];

export function stageById(id: StageId): StageMeta {
  return labStages.find((stage) => stage.id === id) ?? exitStage;
}
