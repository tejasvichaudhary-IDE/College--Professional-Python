import { useEffect, useReducer, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { brand } from "../data/branding.ts";
import { voiceLines, type VoiceLineId } from "../data/voiceLines.ts";
import { armSpeech, consumeUtterance, ensureVoices, resetSpeech, silence, speak, speakAuto } from "../lib/speech.ts";
import { loadState, saveState } from "../state/storage.ts";
import { reducer, type Action } from "../state/reducer.ts";
import type { LabState } from "../types/lab.ts";

interface LabContextValue {
  state: LabState;
  dispatch: (action: Action) => void;
  remainingMs: number;
  replay: () => void;
}

const LabContext = createContext<LabContextValue | null>(null);

function lineFor(state: LabState): string {
  if (state.bitOverride) return state.bitOverride;
  return voiceLines[state.bitLineId as VoiceLineId] ?? voiceLines.define;
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    ensureVoices();
    const arm = () => armSpeech();
    window.addEventListener("pointerdown", arm);
    return () => window.removeEventListener("pointerdown", arm);
  }, []);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    dispatch({ type: narrow ? "COLLAPSE_PANELS_FOR_NARROW" : "MARK_PANELS_INITIALIZED" });
  }, []);

  useEffect(() => {
    if (!state.startedAt || state.timeUp) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [state.startedAt, state.timeUp]);

  useEffect(() => {
    if (state.startedAt && !state.timeUp && now - state.startedAt >= brand.durationMs) {
      dispatch({ type: "MARK_TIME_UP" });
    }
  }, [now, state.startedAt, state.timeUp]);

  const narration = lineFor(state);
  useEffect(() => {
    if (state.muted) {
      silence();
      consumeUtterance(String(state.voiceToken));
      return;
    }
    if (state.voiceToken === 0) return;
    speakAuto(String(state.voiceToken), narration);
  }, [narration, state.muted, state.voiceToken]);

  const remainingMs = state.startedAt ? Math.max(0, brand.durationMs - (now - state.startedAt)) : brand.durationMs;

  const send = (action: Action) => {
    if (action.type === "RESET") resetSpeech();
    dispatch(action);
  };

  const replay = () => {
    armSpeech();
    if (state.muted) dispatch({ type: "TOGGLE_MUTE" });
    speak(lineFor(state));
  };

  return <LabContext.Provider value={{ state, dispatch: send, remainingMs, replay }}>{children}</LabContext.Provider>;
}

export function useLab(): LabContextValue {
  const value = useContext(LabContext);
  if (!value) throw new Error("useLab must be used within LabProvider");
  return value;
}
