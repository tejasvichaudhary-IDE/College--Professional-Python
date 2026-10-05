import { brand } from "../data/branding.ts";
import { facilitatorChecks } from "../data/rubrics.ts";
import { boundaryPresets } from "../data/testCases.ts";
import type { LabState } from "../types/lab.ts";
import { getCriteria } from "./completion.ts";

export function buildEvidence(state: LabState): string {
  const criteria = getCriteria(state);
  const checklist = facilitatorChecks
    .map((item) => `- [${state.checklist[item.id] ? "x" : " "}] ${item.label}`)
    .join("\n");
  const history = state.testHistory.length
    ? state.testHistory
        .map(
          (item) =>
            `- ${item.at} · ${item.kindLabel} · input ${item.input} · expected ${item.expected} · actual ${item.actual} · ${item.status.toUpperCase()}`,
        )
        .join("\n")
    : "- No tests recorded yet.";
  const lines = [
    `# ${brand.organization}`,
    `## ${brand.moduleTitle}`,
    `### ${brand.labKind}: ${brand.labTitle}`,
    "",
    `Program: ${brand.program}`,
    `Audience: ${brand.audience}`,
    `Module scope: ${brand.moduleScope}`,
    "",
    "Execution note: results marked LAB SIMULATION were produced in this workspace, not by a local Python interpreter.",
    "",
    "## 1. Task statement",
    `Task: ${state.task || "Not recorded yet."}`,
    `Input: ${state.input || "Not recorded yet."}`,
    `Intended output: ${state.intendedOutput || "Not recorded yet."}`,
    `Assumption: ${state.assumption || "Not recorded yet."}`,
    "",
    "## 2. Inspection",
    `Environment: ${state.environmentStatus === "ready" ? ".venv · READY" : "Not initialized"}`,
    `Files opened: ${state.openedFiles.length ? state.openedFiles.join(", ") : "None"}`,
    `Data shape reviewed: ${state.dataShapeViewed ? "yes" : "no"}`,
    `Inspection note: ${state.inspectionNote || "Not recorded yet."}`,
    "",
    "## 3. Working code",
    "File: src/utility.py",
    "```python",
    state.savedCode || state.code || "",
    "```",
    `Explanation: ${state.codeExplanation || "Not recorded yet."}`,
    "",
    "### Simulation log",
    "```text",
    state.lastRunLog || "Not run yet.",
    "```",
    "",
    "## 4. Expected versus actual",
    "### Normal case",
    `Input: ${state.normalInput}`,
    `Expected: ${state.normalExpected || "Not recorded yet."}`,
    `Actual: ${state.normalActual || "Not run yet."}`,
    `Status: ${state.normalStatus === "idle" ? "NOT RUN" : state.normalStatus.toUpperCase()}`,
    state.normalNote ? `Note: ${state.normalNote}` : "",
    "",
    `### ${boundaryPresets[state.boundaryKind].label}`,
    `Input: ${state.boundaryInput}`,
    `Expected: ${state.boundaryExpected || "Not recorded yet."}`,
    `Actual: ${state.boundaryActual || "Not run yet."}`,
    `Status: ${state.boundaryStatus === "idle" ? "NOT RUN" : state.boundaryStatus.toUpperCase()}`,
    state.boundaryNote ? `Note: ${state.boundaryNote}` : "",
    "",
    "### Test history",
    history,
    "",
    "## 5. Decision note",
    `What I built or tested: ${state.builtSummary || "Not recorded yet."}`,
    `What I expected: ${state.expectedSummary || "Not recorded yet."}`,
    `What actually happened: ${state.actualSummary || "Not recorded yet."}`,
    `What I changed or learned: ${state.learnedSummary || "Not recorded yet."}`,
    `Evidence link or file: ${state.evidenceLink || "Not recorded yet."}`,
    `Local file name: ${state.evidenceFileName || "None selected"}`,
    `Responsible-use decision: ${state.responsibleUseDecision || "Not recorded yet."}`,
    `Safety confirmation: ${state.safetyAcknowledged ? "Confirmed" : "Not confirmed"}`,
    "",
    "### Evidence and interpretation",
    `Evidence: ${state.evidenceReflection || "Not recorded yet."}`,
    `Interpretation: ${state.interpretationReflection || "Not recorded yet."}`,
    "",
    "## Facilitator checklist",
    checklist,
    "",
    "## Exit check",
    `Type hint selected: ${state.exit.typeHintTarget || "Not answered"}`,
    ...Object.entries(state.exit.matches).map(([key, value]) => `Match ${key}: ${value || "Not answered"}`),
    `Unit test: ${state.exit.unitTestChoice || "Not answered"}`,
    `PEP 8: ${state.exit.pep8Choice || "Not answered"}`,
    `Exception path: ${state.exit.exceptionWhy || "Not answered"}`,
    `Exit check completed: ${state.exitCompleted ? "yes" : "no"}`,
    "",
    "## Completion",
    ...criteria.map((item) => `- [${item.met ? "x" : " "}] ${item.label}`),
    "",
    "## Lab handoff",
    brand.handoff,
    "",
    `Reference: ${brand.workbookTitle}`,
  ];
  return lines.filter((line) => line !== "").join("\n");
}

export function downloadEvidence(markdown: string): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "certily-m1-package-a-small-python-utility-evidence.md";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
