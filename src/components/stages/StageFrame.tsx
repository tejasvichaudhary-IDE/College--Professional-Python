import type { ReactNode } from "react";
import { stageById } from "../../data/stages.ts";
import type { StageId } from "../../types/lab.ts";
import { HintPanel } from "../lab/HintPanel.tsx";

export function StageFrame({
  id,
  children,
  actions,
}: {
  id: StageId;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const stage = stageById(id);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 md:p-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-[#57F0EE]">
          {stage.index ? `STAGE ${stage.index} · ${stage.time.toUpperCase()}` : stage.time.toUpperCase()}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{stage.title}</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#bbbcde]">{stage.summary}</p>
      </header>
      {children}
      <HintPanel />
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
