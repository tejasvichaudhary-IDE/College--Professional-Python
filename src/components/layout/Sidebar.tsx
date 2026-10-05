import { brand } from "../../data/branding.ts";
import { exitStage, labStages } from "../../data/stages.ts";
import { useLab } from "../../context/LabContext.tsx";
import { canEnter, stageComplete } from "../../lib/completion.ts";
import { cx } from "../../lib/cx.ts";

export function Sidebar() {
  const { state, dispatch } = useLab();
  const items = [...labStages, exitStage];
  return (
    <nav className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-[#0B1021] lg:flex" aria-label="Lab navigation">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#57F0EE]">15-MINUTE LAB</p>
        <h2 className="mt-1 text-base font-semibold text-white">{brand.labTitle}</h2>
      </div>
      <ol className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const current = item.id === state.currentStage;
          const unlocked = canEnter(item.id, state);
          const done = stageComplete(item.id, state);
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                className={cx(
                  "w-full rounded-xl px-3 py-2 text-left",
                  current ? "bg-[#14172E] text-white ring-1 ring-[#57F0EE]/50" : "text-[#bbbcde] hover:bg-white/5",
                  !unlocked && !current && "opacity-60",
                )}
                onClick={() => dispatch({ type: "GOTO", stage: item.id })}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  <span>
                    {item.index ? String(item.index).padStart(2, "0") : "—"} {item.nav}
                  </span>
                  {done ? <span aria-label="Completed">✓</span> : null}
                </span>
                <span className="mt-0.5 block text-xs text-[#8890a6]">{item.time}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="px-4 pb-4 text-xs leading-5 text-[#8890a6]">{brand.moduleScope}</p>
    </nav>
  );
}
