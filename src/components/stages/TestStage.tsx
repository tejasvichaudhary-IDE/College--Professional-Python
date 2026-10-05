import { useState } from "react";
import { boundaryOptions, boundaryPresets, normalCase } from "../../data/testCases.ts";
import { brand } from "../../data/branding.ts";
import { useLab } from "../../context/LabContext.tsx";
import type { BoundaryKind } from "../../types/lab.ts";
import { Button, LineField, Notice, StatusBadge } from "../ui/Controls.tsx";
import { StageFrame } from "./StageFrame.tsx";

export function TestStage() {
  const { state, dispatch } = useLab();
  const [showWhy, setShowWhy] = useState(false);
  const stale = Boolean(state.normalCode && state.normalCode !== state.code) || Boolean(state.boundaryCode && state.boundaryCode !== state.code);
  const preset = boundaryPresets[state.boundaryKind];

  function run(kind: "normal" | "boundary") {
    const id = globalThis.crypto?.randomUUID?.() ?? `test-${Date.now()}`;
    const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    dispatch({ type: "RUN_TEST", kind, id, at });
  }

  return (
    <StageFrame
      id="test"
      actions={
        <>
          <Button variant="ghost" type="button" onClick={() => dispatch({ type: "GOTO", stage: "build" })}>
            Back
          </Button>
          <Button type="button" onClick={() => dispatch({ type: "GOTO", stage: "review" })}>
            Continue to review
          </Button>
        </>
      }
    >
      <p className="text-xs font-semibold tracking-[0.14em] text-[#57F0EE]">{brand.simulationLabel}</p>
      <p className="text-sm text-[#bbbcde]">{brand.simulationDisclaimer}</p>
      {state.notice && state.currentStage === "test" ? <Notice tone={state.notice.tone}>{state.notice.text}</Notice> : null}
      {stale ? <Notice tone="attention">The editor changed after these results. Run both tests again so the actual results match the current code.</Notice> : null}

      <section className="panel p-4" aria-label="Normal case">
        <h2 className="text-lg font-semibold text-white">{normalCase.label}</h2>
        <p className="mt-1 text-sm text-[#bbbcde]">{normalCase.hint}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <LineField
            label="Input"
            value={state.normalInput}
            onChange={(event) => dispatch({ type: "SET_TEXT", key: "normalInput", value: event.target.value })}
          />
          <LineField
            label="Expected"
            hint="Predict before you run."
            value={state.normalExpected}
            error={state.errors.normalExpected}
            onChange={(event) => dispatch({ type: "SET_TEXT", key: "normalExpected", value: event.target.value })}
          />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={() => run("normal")}>
            Run test
          </Button>
        </div>
        <Comparison expected={state.normalExpected} actual={state.normalActual} status={state.normalStatus} />
      </section>

      <section className="panel p-4" aria-label="Boundary, error, alternative, or review case">
        <h2 className="text-lg font-semibold text-white">Boundary / error / alternative case</h2>
        <label className="field mt-3">
          <span>Case</span>
          <select
            value={state.boundaryKind}
            aria-label="Boundary, error, alternative, or review case"
            onChange={(event) => dispatch({ type: "SET_BOUNDARY", kind: event.target.value as BoundaryKind })}
          >
            {boundaryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-sm text-[#bbbcde]">{preset.hint}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <LineField
            label="Input"
            value={state.boundaryInput}
            onChange={(event) => dispatch({ type: "SET_TEXT", key: "boundaryInput", value: event.target.value })}
          />
          <LineField
            label="Expected"
            hint="Predict the value or the exception name."
            value={state.boundaryExpected}
            error={state.errors.boundaryExpected}
            onChange={(event) => dispatch({ type: "SET_TEXT", key: "boundaryExpected", value: event.target.value })}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => run("boundary")}>
            Run test
          </Button>
          {state.boundaryActual ? (
            <Button variant="secondary" type="button" onClick={() => setShowWhy((open) => !open)} aria-expanded={showWhy}>
              {showWhy ? "Hide explanation" : "Inspect why this result occurred"}
            </Button>
          ) : null}
        </div>
        <Comparison expected={state.boundaryExpected} actual={state.boundaryActual} status={state.boundaryStatus} />
        {showWhy && state.boundaryNote ? <p className="mt-3 text-sm leading-6 text-[#e4e3ee]">{state.boundaryNote}</p> : null}
      </section>

      <section className="panel p-4" aria-label="Test history">
        <h2 className="text-base font-semibold text-white">Test history</h2>
        {state.testHistory.length === 0 ? (
          <p className="mt-2 text-sm text-[#bbbcde]">No tests have been run yet.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {state.testHistory.map((item, index) => (
              <li key={item.id} className="rounded-xl bg-[#0B1021] px-3 py-2 text-sm text-[#e4e3ee]">
                <span className="font-semibold text-white">Test #{index + 1}</span> · {item.kindLabel} · {item.at}
                <span className="mt-1 block font-mono text-xs text-[#bbbcde]">
                  Input: {item.input} · Expected: {item.expected} · Actual: {item.actual} · {item.status.toUpperCase()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </StageFrame>
  );
}

function Comparison({
  expected,
  actual,
  status,
}: {
  expected: string;
  actual: string;
  status: "idle" | "pass" | "review";
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-[#0B1021] p-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#8890a6]">EXPECTED</p>
        <p className="mt-1 font-mono text-lg break-words text-white">{expected || "—"}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0B1021] p-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#8890a6]">ACTUAL</p>
        <p className="mt-1 font-mono text-lg break-words text-white">{actual || "—"}</p>
      </div>
      <div className="sm:col-span-2">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
