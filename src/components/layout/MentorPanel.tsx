import { bitStates } from "../../data/branding.ts";
import { conceptNotes, bitPrompts } from "../../data/questions.ts";
import { voiceLines, type VoiceLineId } from "../../data/voiceLines.ts";
import { useLab } from "../../context/LabContext.tsx";
import { speechAvailable } from "../../lib/speech.ts";
import { BitAvatar } from "../bit/BitAvatar.tsx";
import { Button } from "../ui/Controls.tsx";

export function MentorPanel() {
  const { state, dispatch, replay } = useLab();
  const line = state.bitOverride ?? voiceLines[state.bitLineId as VoiceLineId] ?? "";
  const prompts = bitPrompts[state.currentStage] ?? [];
  return (
    <section className="panel m-3 p-4" aria-label="Bit, lab mentor">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BitAvatar state={state.bitState} size="md" />
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#57F0EE]">BIT</p>
            <p className="text-sm text-[#bbbcde]">{bitStates[state.bitState]}</p>
          </div>
        </div>
        <Button variant="ghost" type="button" onClick={() => dispatch({ type: "TOGGLE_MENTOR" })} aria-label="Collapse mentor panel">
          Hide
        </Button>
      </div>
      <p className="mt-4 text-[15px] leading-6 text-white" aria-live="polite">
        {line}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" type="button" onClick={replay}>
          Replay
        </Button>
        <Button variant="ghost" type="button" aria-pressed={state.muted} onClick={() => dispatch({ type: "TOGGLE_MUTE" })}>
          {state.muted ? "Unmute" : "Mute"}
        </Button>
      </div>
      {speechAvailable() ? null : (
        <p className="mt-2 text-sm text-[#bbbcde]">Voice output is unavailable in this browser. Bit's guidance stays on screen.</p>
      )}
      <ul className="mt-4 space-y-2 text-sm leading-5 text-[#bbbcde]">
        {prompts.map((prompt) => (
          <li key={prompt} className="rounded-lg bg-[#0B1021] px-3 py-2">
            {prompt}
          </li>
        ))}
      </ul>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#bbbcde]">Module ideas</summary>
        <dl className="mt-3 space-y-2">
          {conceptNotes.map((note) => (
            <div key={note.term}>
              <dt className="text-sm font-semibold text-white">{note.term}</dt>
              <dd className="text-sm text-[#bbbcde]">{note.text}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
