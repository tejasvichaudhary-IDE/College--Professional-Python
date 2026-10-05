import { knowledgeCheck } from "../data/knowledgeCheck.ts";
import type { LabState } from "../types/lab.ts";

export function gradeExit(state: LabState): { ok: boolean; feedback: Record<string, string> } {
  const feedback: Record<string, string> = {};
  let ok = true;
  const choice = knowledgeCheck.code.choices.find((item) => item.id === state.exit.typeHintTarget);
  if (!choice) {
    ok = false;
    feedback.typeHint = "Select the part of the signature that is a type hint.";
  } else if (!choice.correct) {
    ok = false;
    feedback.typeHint = choice.feedback;
  } else {
    feedback.typeHint = choice.feedback;
  }

  const used = new Map<string, number>();
  for (const term of knowledgeCheck.matching.terms) {
    const selected = state.exit.matches[term.id] ?? "";
    if (selected) used.set(selected, (used.get(selected) ?? 0) + 1);
  }
  const duplicate = [...used.values()].some((count) => count > 1);
  const unmatched = knowledgeCheck.matching.terms.some((term) => state.exit.matches[term.id] !== term.id);
  if (unmatched || duplicate) {
    ok = false;
    feedback.matching = duplicate
      ? "Each role matches one idea. Two rows currently use the same definition."
      : "One or more roles do not match yet. Compare the term with the definition and try again.";
  } else {
    feedback.matching = "The six roles match this lab.";
  }

  for (const question of knowledgeCheck.mcq) {
    const selected = question.id === "unitTestChoice" ? state.exit.unitTestChoice : state.exit.pep8Choice;
    const option = question.options.find((item) => item.id === selected);
    if (!option || !option.correct) {
      ok = false;
      feedback[question.id] = option?.feedback ?? "Select the statement that matches the role.";
    } else {
      feedback[question.id] = option.feedback;
    }
  }

  if (state.exit.exceptionWhy.trim().length < knowledgeCheck.short.minLength) {
    ok = false;
    feedback.exceptionWhy = state.exit.exceptionWhy.trim()
      ? "Add a little more detail so a tutor can see your reasoning."
      : "Explain why the exception path is useful. A few clear sentences are enough.";
  } else {
    feedback.exceptionWhy = "Your explanation is recorded.";
  }

  return { ok, feedback };
}
