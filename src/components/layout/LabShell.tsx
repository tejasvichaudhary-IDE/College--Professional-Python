import { useEffect, useState } from "react";
import { brand } from "../../data/branding.ts";
import { useLab } from "../../context/LabContext.tsx";
import { BuildStage } from "../stages/BuildStage.tsx";
import { DefineStage } from "../stages/DefineStage.tsx";
import { ExitStage } from "../stages/ExitStage.tsx";
import { InspectStage } from "../stages/InspectStage.tsx";
import { ReviewStage } from "../stages/ReviewStage.tsx";
import { TestStage } from "../stages/TestStage.tsx";
import { Button, Modal } from "../ui/Controls.tsx";
import { EvidencePanel } from "./EvidencePanel.tsx";
import { Header } from "./Header.tsx";
import { MentorPanel } from "./MentorPanel.tsx";
import { Sidebar } from "./Sidebar.tsx";

export function LabShell() {
  const { state, dispatch } = useLab();
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const name =
      state.currentStage === "exit" ? "Exit check" : state.currentStage === "define" ? "Define the task" : state.currentStage;
    document.title = `${name} · ${brand.labTitle}`;
  }, [state.currentStage]);

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col">
      <a href="#lab-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-[#57F0EE] focus:px-3 focus:py-2 focus:text-[#0B1021]">
        Skip to lab content
      </a>
      <Header />
      {state.timeUp ? (
        <div className="border-b border-[#f0d78a]/30 bg-[#2a2416] px-4 py-2 text-sm text-[#f6e7b8]" role="status">
          {brand.timeUpMessage}
        </div>
      ) : null}
      <div className="flex w-full min-w-0 flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main id="lab-content" className="min-w-0 flex-1" tabIndex={-1}>
          {state.currentStage === "define" ? <DefineStage /> : null}
          {state.currentStage === "inspect" ? <InspectStage /> : null}
          {state.currentStage === "build" ? <BuildStage /> : null}
          {state.currentStage === "test" ? <TestStage /> : null}
          {state.currentStage === "review" ? <ReviewStage /> : null}
          {state.currentStage === "exit" ? <ExitStage /> : null}
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pb-6 md:px-6">
            <p className="text-xs text-[#8890a6]">Execution: lab simulation. Code stays in this browser.</p>
            <Button variant="ghost" type="button" onClick={() => setConfirmReset(true)}>
              Reset lab
            </Button>
          </div>
        </main>
        <aside className="w-full min-w-0 border-t border-white/10 bg-[#0B1021] lg:w-[340px] lg:shrink-0 lg:border-t-0 lg:border-l" aria-label="Mentor and evidence">
          <div className="flex gap-2 p-3 lg:hidden">
            <Button variant="secondary" type="button" onClick={() => dispatch({ type: "TOGGLE_MENTOR" })}>
              {state.mentorCollapsed ? "Show Bit" : "Hide Bit"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => dispatch({ type: "TOGGLE_EVIDENCE" })}>
              {state.evidenceCollapsed ? "Show evidence" : "Hide evidence"}
            </Button>
          </div>
          {state.mentorCollapsed ? (
            <div className="hidden p-3 lg:block">
              <Button type="button" variant="secondary" onClick={() => dispatch({ type: "TOGGLE_MENTOR" })}>
                Show Bit
              </Button>
            </div>
          ) : (
            <MentorPanel />
          )}
          {state.evidenceCollapsed ? (
            <div className="hidden p-3 lg:block">
              <Button type="button" variant="secondary" onClick={() => dispatch({ type: "TOGGLE_EVIDENCE" })}>
                Show evidence
              </Button>
            </div>
          ) : (
            <EvidencePanel />
          )}
        </aside>
      </div>
      <Modal open={confirmReset} title="Reset this lab?" onClose={() => setConfirmReset(false)}>
        <p className="text-sm leading-6">This clears the saved lab on this browser and returns to the opening screen. Download your evidence first if you want to keep it.</p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={() => {
              dispatch({ type: "RESET" });
              setConfirmReset(false);
            }}
          >
            Reset lab
          </Button>
          <Button variant="secondary" type="button" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
