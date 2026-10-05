import { useEffect, useId, useState } from "react";
import { brand } from "../../data/branding.ts";
import { voiceLines } from "../../data/voiceLines.ts";
import { useLab } from "../../context/LabContext.tsx";
import { BitAvatar } from "../bit/BitAvatar.tsx";
import { Logo } from "../brand/Logo.tsx";
import { Button } from "../ui/Controls.tsx";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function IntroScreen() {
  const { dispatch, replay, state } = useLab();
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const titleId = useId();
  const shown = reduced || skipped || ready;

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setReady(true), 4200);
    return () => window.clearTimeout(id);
  }, [reduced]);

  useEffect(() => {
    document.title = `${brand.labTitle} · ${brand.organization}`;
  }, []);

  return (
    <main className="intro-grid flex min-h-dvh flex-col" aria-labelledby={titleId}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <Logo />
          <p className="text-xs font-semibold tracking-[0.16em] text-[#bbbcde]">CERTILY AI ACADEMY</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" type="button" onClick={replay}>
            Replay
          </Button>
          <Button variant="ghost" type="button" aria-pressed={state.muted} onClick={() => dispatch({ type: "TOGGLE_MUTE" })}>
            {state.muted ? "Muted" : "Mute"}
          </Button>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 pb-10">
        <div className="grid w-full items-center gap-8 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <div className="rise" style={{ animationDelay: "200ms" }}>
              <Logo size={48} />
            </div>
            <p className="rise mt-5 text-sm font-semibold tracking-[0.18em] text-[#57F0EE]" style={{ animationDelay: "700ms" }}>
              {brand.program}
            </p>
            <p className="rise mt-6 text-lg text-[#bbbcde]" style={{ animationDelay: "1800ms" }}>
              {brand.moduleTitle}
            </p>
            <p className="rise mt-2 text-sm uppercase tracking-[0.16em] text-[#8890a6]" style={{ animationDelay: "2300ms" }}>
              {brand.labKind}
            </p>
            <h1 id={titleId} className="rise mt-3 text-3xl font-semibold text-white md:text-4xl" style={{ animationDelay: "2800ms" }}>
              {brand.labTitle}
            </h1>
            <p className="rise mt-4 max-w-xl text-sm leading-6 text-[#bbbcde]" style={{ animationDelay: "3200ms" }}>
              {voiceLines.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                className={shown ? "" : "pointer-events-none opacity-0"}
                tabIndex={shown ? 0 : -1}
                aria-hidden={shown ? undefined : true}
                onClick={() => dispatch({ type: "START", at: Date.now() })}
              >
                Start lab
              </Button>
              <Button variant="secondary" type="button" onClick={() => setSkipped(true)}>
                Skip intro
              </Button>
            </div>
          </div>
          <div className="rise mx-auto w-44 md:w-full" style={{ animationDelay: "1200ms" }}>
            <BitAvatar state="idle" size="lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
