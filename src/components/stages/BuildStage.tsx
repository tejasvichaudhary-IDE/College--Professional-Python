import { useState } from "react";
import { STARTER_CODE, starterGuidance } from "../../data/starterCode.ts";
import { brand } from "../../data/branding.ts";
import { useLab } from "../../context/LabContext.tsx";
import { analyzeCode } from "../../lib/simulation.ts";
import { Button, Modal, Notice, TextField } from "../ui/Controls.tsx";
import { CodeEditor } from "../editor/CodeEditor.tsx";
import { StageFrame } from "./StageFrame.tsx";

export function BuildStage() {
  const { state, dispatch } = useLab();
  const [confirmReset, setConfirmReset] = useState(false);
  const analysis = analyzeCode(state.code);
  const notes = state.code.trim() === STARTER_CODE.trim()
    ? [...analysis.notes, "The editor still matches the starter pattern. That is allowed if your explanation and tests show how you are using it."]
    : analysis.notes;

  return (
    <StageFrame
      id="build"
      actions={
        <>
          <Button variant="ghost" type="button" onClick={() => dispatch({ type: "GOTO", stage: "inspect" })}>
            Back
          </Button>
          <Button type="button" onClick={() => dispatch({ type: "SAVE_CODE", go: false })}>
            Save code
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "SAVE_CODE", go: true })}>
            Save and continue
          </Button>
        </>
      }
    >
      <section className="panel p-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#57F0EE]">{starterGuidance.eyebrow}</p>
        <p className="mt-2 text-base font-semibold text-white">{starterGuidance.caveat}</p>
        <p className="mt-2 text-sm leading-6 text-[#bbbcde]">{starterGuidance.detail}</p>
      </section>
      {state.notice && state.currentStage === "build" ? <Notice tone={state.notice.tone}>{state.notice.text}</Notice> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-[#57F0EE]">{starterGuidance.fileName}</p>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#57F0EE]">{brand.simulationLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => dispatch({ type: "RUN_CODE" })}>
            Run code
          </Button>
          <Button variant="secondary" type="button" onClick={() => setConfirmReset(true)}>
            Reset starter
          </Button>
        </div>
      </div>
      <CodeEditor value={state.code} onChange={(value) => dispatch({ type: "SET_TEXT", key: "code", value })} />
      {state.errors.code ? (
        <p role="alert" className="text-sm text-[#f0d78a]">
          {state.errors.code}
        </p>
      ) : null}
      {state.errors.run ? (
        <p role="alert" className="text-sm text-[#f0d78a]">
          {state.errors.run}
        </p>
      ) : null}
      <ul className="grid gap-2 md:grid-cols-2" aria-label="Code guidance">
        {notes.map((note) => (
          <li key={note} className="rounded-xl border border-white/10 bg-[#14172E] px-3 py-2 text-sm text-[#e4e3ee]">
            {note}
          </li>
        ))}
      </ul>
      <TextField
        id="codeExplanation"
        label="What does this pattern do?"
        hint="In one or two sentences, explain the typed function and the exception path."
        rows={3}
        value={state.codeExplanation}
        error={state.errors.codeExplanation}
        onChange={(value) => dispatch({ type: "SET_TEXT", key: "codeExplanation", value })}
      />
      {state.lastRunLog ? (
        <section className="panel p-4" aria-label="Simulation output">
          <h2 className="text-sm font-semibold tracking-[0.14em] text-[#57F0EE]">RUN OUTPUT</h2>
          <pre className="wrap-code mt-3 font-mono text-sm leading-6 text-[#e4e3ee]">{state.lastRunLog}</pre>
        </section>
      ) : null}
      <p className="text-sm text-[#8890a6]">{brand.simulationDisclaimer}</p>
      <Modal open={confirmReset} title="Restore starter guidance?" onClose={() => setConfirmReset(false)}>
        <p className="text-sm leading-6">This replaces the editor contents with the starter pattern. Saved evidence will need to be run and saved again.</p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={() => {
              dispatch({ type: "RESET_CODE" });
              setConfirmReset(false);
            }}
          >
            Restore starter
          </Button>
          <Button variant="secondary" type="button" onClick={() => setConfirmReset(false)}>
            Keep my code
          </Button>
        </div>
      </Modal>
    </StageFrame>
  );
}
