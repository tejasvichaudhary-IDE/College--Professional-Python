import { useState } from "react";
import { brand } from "../../data/branding.ts";
import { useLab } from "../../context/LabContext.tsx";
import { getCriteria } from "../../lib/completion.ts";
import { buildEvidence, downloadEvidence } from "../../lib/evidence.ts";
import { feedback } from "../../data/feedback.ts";
import { Button, Notice } from "../ui/Controls.tsx";

export function EvidencePanel() {
  const { state, dispatch } = useLab();
  const criteria = getCriteria(state);
  const [copyNote, setCopyNote] = useState("");
  const [manual, setManual] = useState("");

  async function copyEvidence() {
    const markdown = buildEvidence(state);
    try {
      await navigator.clipboard.writeText(markdown);
      setManual("");
      setCopyNote(feedback.copied);
    } catch {
      setManual(markdown);
      setCopyNote(feedback.copyFailed);
    }
  }

  function submit() {
    const firstGap = criteria.find((item) => !item.met);
    if (!state.reviewSaved) {
      dispatch({ type: "GOTO", stage: "review" });
      return;
    }
    if (!state.exitCompleted) {
      dispatch({ type: "GOTO", stage: "exit" });
      return;
    }
    if (firstGap) {
      dispatch({ type: "GOTO", stage: firstGap.stage });
      return;
    }
    dispatch({ type: "BACK_TO_EVIDENCE" });
  }

  return (
    <section className="panel mx-3 mb-3 p-4" aria-label="Evidence">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#57F0EE]">EVIDENCE</p>
          <h2 className="text-base font-semibold text-white">Lab record</h2>
        </div>
        <Button variant="ghost" type="button" onClick={() => dispatch({ type: "TOGGLE_EVIDENCE" })} aria-label="Collapse evidence panel">
          Hide
        </Button>
      </div>
      <p className="mt-2 text-sm text-[#bbbcde]">{brand.storageNote}</p>
      <ul className="mt-3 space-y-1">
        {criteria.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left text-sm hover:bg-white/5"
              onClick={() => dispatch({ type: "GOTO", stage: item.stage })}
            >
              <span aria-hidden="true" className={item.met ? "text-[#57F0EE]" : "text-[#8890a6]"}>
                {item.met ? "✓" : "○"}
              </span>
              <span className={item.met ? "text-white" : "text-[#bbbcde]"}>
                {item.label}
                <span className="sr-only">{item.met ? ", recorded" : ", still needed"}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-2">
        <Button type="button" onClick={() => void copyEvidence()}>
          Copy evidence
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            downloadEvidence(buildEvidence(state));
            setCopyNote(feedback.downloaded);
          }}
        >
          Download evidence
        </Button>
        <Button variant="secondary" type="button" onClick={submit}>
          Submit lab
        </Button>
      </div>
      {copyNote ? (
        <div className="mt-3">
          <Notice tone="ok">{copyNote}</Notice>
        </div>
      ) : null}
      {manual ? (
        <textarea className="plain-input mt-3 min-h-28 font-mono text-xs" readOnly value={manual} aria-label="Evidence text to copy manually" />
      ) : null}
    </section>
  );
}
