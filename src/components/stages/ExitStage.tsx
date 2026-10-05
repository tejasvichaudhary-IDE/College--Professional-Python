import { knowledgeCheck } from "../../data/knowledgeCheck.ts";
import { useLab } from "../../context/LabContext.tsx";
import { highlightPython } from "../../lib/highlight.ts";
import { Button, Notice, TextField } from "../ui/Controls.tsx";
import { StageFrame } from "./StageFrame.tsx";

export function ExitStage() {
  const { state, dispatch } = useLab();
  return (
    <StageFrame
      id="exit"
      actions={
        <>
          <Button variant="ghost" type="button" onClick={() => dispatch({ type: "GOTO", stage: "review" })}>
            Back
          </Button>
          <Button type="button" onClick={() => dispatch({ type: "SUBMIT_EXIT" })}>
            Submit exit check
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[#e4e3ee]">{knowledgeCheck.intro}</p>
      {state.notice && state.currentStage === "exit" ? <Notice tone={state.notice.tone}>{state.notice.text}</Notice> : null}

      <section className="panel p-4">
        <h2 className="text-base font-semibold text-white">{knowledgeCheck.code.prompt}</h2>
        <p className="mt-1 text-sm text-[#bbbcde]">{knowledgeCheck.code.note}</p>
        <pre
          className="wrap-code mt-3 rounded-xl bg-[#0B1021] p-4 font-mono text-sm leading-6"
          dangerouslySetInnerHTML={{ __html: highlightPython(knowledgeCheck.code.sample) }}
        />
        <fieldset className="mt-4 space-y-2">
          <legend className="text-sm font-semibold text-[#bbbcde]">Select one part</legend>
          {knowledgeCheck.code.choices.map((choice) => (
            <label key={choice.id} className="flex items-start gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm">
              <input
                type="radio"
                name="type-hint"
                className="mt-1 accent-[#57F0EE]"
                checked={state.exit.typeHintTarget === choice.id}
                onChange={() => dispatch({ type: "SET_EXIT", field: "typeHintTarget", value: choice.id })}
              />
              <span className="font-mono text-[#e4e3ee]">{choice.label}</span>
            </label>
          ))}
        </fieldset>
        {state.exitFeedback.typeHint ? <p className="mt-2 text-sm text-[#bbbcde]">{state.exitFeedback.typeHint}</p> : null}
      </section>

      <section className="panel p-4">
        <h2 className="text-base font-semibold text-white">{knowledgeCheck.matching.prompt}</h2>
        <div className="mt-3 grid gap-3">
          {knowledgeCheck.matching.terms.map((term) => (
            <label key={term.id} className="grid gap-1 text-sm md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
              <span className="font-semibold text-white">{term.label}</span>
              <select
                className="plain-input"
                value={state.exit.matches[term.id] ?? ""}
                aria-label={`Role of ${term.label}`}
                onChange={(event) => dispatch({ type: "SET_MATCH", termId: term.id, definitionId: event.target.value })}
              >
                <option value="">Select a role</option>
                {knowledgeCheck.matching.definitions.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {state.exitFeedback.matching ? <p className="mt-2 text-sm text-[#bbbcde]">{state.exitFeedback.matching}</p> : null}
      </section>

      {knowledgeCheck.mcq.map((question) => {
        const selected = question.id === "unitTestChoice" ? state.exit.unitTestChoice : state.exit.pep8Choice;
        return (
          <fieldset key={question.id} className="panel space-y-2 p-4">
            <legend className="px-1 text-base font-semibold text-white">{question.prompt}</legend>
            {question.options.map((option) => (
              <label key={option.id} className="flex items-start gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-[#e4e3ee]">
                <input
                  type="radio"
                  name={question.id}
                  className="mt-1 accent-[#57F0EE]"
                  checked={selected === option.id}
                  onChange={() => dispatch({ type: "SET_EXIT", field: question.id, value: option.id })}
                />
                <span>{option.label}</span>
              </label>
            ))}
            {state.exitFeedback[question.id] ? <p className="text-sm text-[#bbbcde]">{state.exitFeedback[question.id]}</p> : null}
          </fieldset>
        );
      })}

      <TextField
        id="exceptionWhy"
        label={knowledgeCheck.short.prompt}
        hint={knowledgeCheck.short.hint}
        rows={4}
        value={state.exit.exceptionWhy}
        error={state.exitFeedback.exceptionWhy && state.exit.exceptionWhy.trim().length < knowledgeCheck.short.minLength ? state.exitFeedback.exceptionWhy : undefined}
        onChange={(value) => dispatch({ type: "SET_TEXT", key: "exceptionWhy", value })}
      />
      {state.exitCompleted ? <Notice tone="ok">Exit check recorded.</Notice> : null}
    </StageFrame>
  );
}
