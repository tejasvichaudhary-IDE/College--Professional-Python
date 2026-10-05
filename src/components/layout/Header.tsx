import { brand, bitStates } from "../../data/branding.ts";
import { labStages } from "../../data/stages.ts";
import { voiceLines, type VoiceLineId } from "../../data/voiceLines.ts";
import { useLab } from "../../context/LabContext.tsx";
import { stageComplete } from "../../lib/completion.ts";
import { cx } from "../../lib/cx.ts";
import { clockLabel, formatClock } from "../../lib/time.ts";
import { Logo } from "../brand/Logo.tsx";
import { Button } from "../ui/Controls.tsx";

export function Header({ showTimer = true }: { showTimer?: boolean }) {
  const { state, dispatch, remainingMs, replay } = useLab();
  const step = labStages.find((item) => item.id === state.currentStage);
  const stepLabel =
    state.phase === "complete"
      ? "Lab complete"
      : state.currentStage === "exit"
        ? "Exit check"
        : step
          ? `Step ${step.index} of 5`
          : "15-Minute Lab";

  return (
    <header className="border-b border-white/10 bg-[#0B1021]/95">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#bbbcde]">CERTILY AI ACADEMY</p>
            <p className="truncate text-sm text-white">{brand.program}</p>
          </div>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-white">{brand.moduleTitle}</p>
          <p className="text-xs text-[#bbbcde]">{brand.labTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {showTimer ? (
            <div
              role="timer"
              aria-label={state.timeUp ? brand.timeUpMessage : clockLabel(remainingMs)}
              className={cx(
                "rounded-lg border px-3 py-1.5 font-mono text-sm",
                state.timeUp ? "border-[#f0d78a]/50 text-[#f0d78a]" : "border-white/15 text-white",
              )}
            >
              {state.timeUp ? "00:00" : formatClock(remainingMs)}
            </div>
          ) : null}
          <Button variant="ghost" type="button" onClick={replay} aria-label="Replay Bit's narration">
            Replay
          </Button>
          <Button
            variant="ghost"
            type="button"
            aria-pressed={state.muted}
            aria-label={state.muted ? "Unmute Bit" : "Mute Bit's automatic narration"}
            onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
          >
            {state.muted ? "Muted" : "Mute"}
          </Button>
        </div>
      </div>
      {state.phase === "lab" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-4 py-2">
          <p className="text-sm text-[#bbbcde]">
            <span className="text-white">{stepLabel}</span>
            <span className="mx-2 text-[#8890a6]">·</span>
            {brand.labKind}
            <span className="sr-only">. Bit is {bitStates[state.bitState]}.</span>
          </p>
          <ol className="flex max-w-full flex-wrap gap-1" aria-label="Lab progress">
            {labStages.map((item) => {
              const current = item.id === state.currentStage;
              const done = stageComplete(item.id, state) && !current;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    className={cx(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      current && "bg-[#57F0EE] text-[#0B1021]",
                      done && "text-[#57F0EE]",
                      !current && !done && "text-[#8890a6]",
                    )}
                    onClick={() => dispatch({ type: "GOTO", stage: item.id })}
                  >
                    {String(item.index).padStart(2, "0")} {item.nav}
                    {done ? <span className="ml-1" aria-hidden="true">✓</span> : null}
                    {done ? <span className="sr-only"> completed</span> : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="sr-only">{voiceLines[state.bitLineId as VoiceLineId]}</p>
        </div>
      ) : null}
    </header>
  );
}
