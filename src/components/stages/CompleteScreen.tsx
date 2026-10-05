import { useEffect, useState } from "react";
import { brand } from "../../data/branding.ts";
import { feedback } from "../../data/feedback.ts";
import { useLab } from "../../context/LabContext.tsx";
import { finalChecks, isLabComplete } from "../../lib/completion.ts";
import { buildEvidence, downloadEvidence } from "../../lib/evidence.ts";
import { BitAvatar } from "../bit/BitAvatar.tsx";
import { Header } from "../layout/Header.tsx";
import { Button, Notice } from "../ui/Controls.tsx";

export function CompleteScreen() {
  const { state, dispatch } = useLab();
  const checks = finalChecks(state);
  const ready = isLabComplete(state);
  const [note, setNote] = useState("");

  useEffect(() => {
    document.title = `Lab complete · ${brand.labTitle}`;
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header showTimer={false} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8">
        <div className="check-pop flex items-center gap-4">
          <BitAvatar state="success" size="md" />
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#57F0EE]">CERTILY AI ACADEMY</p>
            <h1 className="text-3xl font-semibold text-white">Lab Complete</h1>
            <p className="mt-1 text-[#bbbcde]">Your Python utility has been documented and reviewed.</p>
          </div>
        </div>
        <section className="panel p-5" aria-label="Lab evidence">
          <h2 className="text-lg font-semibold text-white">Lab evidence</h2>
          <ul className="mt-4 space-y-2">
            {checks.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm text-[#e4e3ee]">
                <span aria-hidden="true" className={item.met ? "text-[#57F0EE]" : "text-[#f0d78a]"}>
                  {item.met ? "✓" : "○"}
                </span>
                {item.label}
                <span className="sr-only">{item.met ? "recorded" : "missing"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-semibold text-white">{ready ? "Evidence package ready" : "Evidence is still incomplete."}</p>
        </section>
        <section className="panel p-5">
          <h2 className="text-base font-semibold text-white">Lab handoff</h2>
          <p className="mt-2 text-sm leading-6 text-[#bbbcde]">{brand.handoff}</p>
          <p className="mt-2 text-sm text-[#8890a6]">{brand.workbookTitle}</p>
        </section>
        {note ? <Notice tone="ok">{note}</Notice> : null}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              downloadEvidence(buildEvidence(state));
              setNote(feedback.downloaded);
            }}
          >
            Download evidence
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "REVIEW_LAB" })}>
            Review lab
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "RETURN_MODULE" })}>
            Return to module
          </Button>
        </div>
      </main>
    </div>
  );
}
