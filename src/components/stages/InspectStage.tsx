import { useState } from "react";
import { dataShape, starterTree } from "../../data/starterCode.ts";
import { feedback } from "../../data/feedback.ts";
import { useLab } from "../../context/LabContext.tsx";
import { inspectionChecks } from "../../lib/validation.ts";
import { cx } from "../../lib/cx.ts";
import { Button, Notice, TextField } from "../ui/Controls.tsx";
import { StageFrame } from "./StageFrame.tsx";

export function InspectStage() {
  const { state, dispatch } = useLab();
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ root: true, src: true, tests: true });
  const checks = inspectionChecks(state);
  const selected = starterTree.find((file) => file.id === state.selectedFile);
  const content = selected?.id === "utility" ? state.code : selected?.content;

  return (
    <StageFrame
      id="inspect"
      actions={
        <>
          <Button variant="ghost" type="button" onClick={() => dispatch({ type: "GOTO", stage: "define" })}>
            Back
          </Button>
          <Button type="button" onClick={() => dispatch({ type: "SAVE_INSPECTION", go: false })}>
            Save inspection
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "SAVE_INSPECTION", go: true })}>
            Save and continue
          </Button>
        </>
      }
    >
      {state.notice && state.currentStage === "inspect" ? <Notice tone={state.notice.tone}>{state.notice.text}</Notice> : null}
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[#8890a6]">ENVIRONMENT</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {state.environmentStatus === "ready" ? ".venv" : "Not initialized"}
            </p>
            <p className="text-sm text-[#57F0EE]">{state.environmentStatus === "ready" ? "READY" : "NOT READY"}</p>
          </div>
          {state.environmentStatus === "ready" ? (
            <Button variant="secondary" type="button" onClick={() => dispatch({ type: "RESET_VENV" })}>
              Reset environment
            </Button>
          ) : (
            <Button type="button" onClick={() => dispatch({ type: "CREATE_VENV" })}>
              Create virtual environment
            </Button>
          )}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#bbbcde]">{feedback.venvReady}</p>
        <p className="mt-2 font-mono text-xs text-[#8890a6]">LAB SIMULATION · equivalent command: python -m venv .venv</p>
        {state.errors.environment ? (
          <p role="alert" className="mt-2 text-sm text-[#f0d78a]">
            {state.errors.environment}
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="panel p-3" aria-label="Starter project">
          <p className="px-2 pb-2 text-xs font-semibold tracking-[0.14em] text-[#8890a6]">STARTER</p>
          <Tree
            parent={null}
            openFolders={openFolders}
            selected={state.selectedFile}
            onToggle={(id) => setOpenFolders((current) => ({ ...current, [id]: !current[id] }))}
            onOpen={(id) => dispatch({ type: "OPEN_FILE", fileId: id })}
          />
          {state.errors.files ? (
            <p role="alert" className="px-2 pt-2 text-sm text-[#f0d78a]">
              {state.errors.files}
            </p>
          ) : null}
        </div>
        <div className="panel min-w-0 p-4">
          {selected && content !== undefined ? (
            <>
              <p className="font-mono text-sm text-[#57F0EE]">{selected.path}</p>
              <pre className="wrap-code mt-3 rounded-xl bg-[#0B1021] p-4 font-mono text-sm leading-6 text-[#e4e3ee]">
                {content}
              </pre>
            </>
          ) : (
            <p className="text-sm text-[#bbbcde]">Select a file to inspect its contents.</p>
          )}
        </div>
      </div>

      <section className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">{dataShape.title}</h2>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "VIEW_SHAPE" })}>
            {state.dataShapeViewed ? "Data shape reviewed" : "Inspect data shape"}
          </Button>
        </div>
        {state.dataShapeViewed ? (
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-[#0B1021] p-3 font-mono text-[#e4e3ee]">
              <p>{dataShape.typeName}</p>
              {dataShape.fields.map((field) => (
                <p key={field.name} className="pl-4">
                  {field.name}: {field.type}
                </p>
              ))}
            </div>
            <div className="text-[#bbbcde]">
              <p>Example values: {dataShape.sample}</p>
              <p>Shape: {dataShape.shape}</p>
              <p>Length: {dataShape.length}</p>
              <p className="mt-2">
                Empty input {dataShape.empty}. {dataShape.emptyNote}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#bbbcde]">Open the data shape before you rely on the field types.</p>
        )}
        {state.errors.shape ? (
          <p role="alert" className="mt-2 text-sm text-[#f0d78a]">
            {state.errors.shape}
          </p>
        ) : null}
      </section>

      <ul className="grid gap-2 text-sm sm:grid-cols-2" aria-label="Inspection progress">
        <Check done={checks.venv} label="Virtual environment ready" />
        <Check done={checks.module} label="Starter module opened" />
        <Check done={checks.testFile} label="Test file opened" />
        <Check done={checks.shape} label="Data shape reviewed" />
      </ul>

      <TextField
        id="inspectionNote"
        label="Inspection note"
        hint="What did you notice about the input, the environment, or the data shape?"
        rows={3}
        value={state.inspectionNote}
        error={state.errors.inspectionNote}
        onChange={(value) => dispatch({ type: "SET_TEXT", key: "inspectionNote", value })}
      />
    </StageFrame>
  );
}

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={cx("rounded-lg border px-3 py-2", done ? "border-[#57F0EE]/30 text-white" : "border-white/10 text-[#bbbcde]")}>
      <span aria-hidden="true">{done ? "✓ " : "○ "}</span>
      {label}
      <span className="sr-only">{done ? ", done" : ", not yet"}</span>
    </li>
  );
}

function Tree({
  parent,
  openFolders,
  selected,
  onToggle,
  onOpen,
}: {
  parent: string | null;
  openFolders: Record<string, boolean>;
  selected: string | null;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const nodes = starterTree.filter((file) => file.parent === parent);
  return (
    <ul className={cx(parent && "ml-3 border-l border-white/10 pl-2")}>
      {nodes.map((node) => (
        <li key={node.id}>
          {node.kind === "folder" ? (
            <>
              <button type="button" className="rounded px-2 py-1 text-left text-sm text-[#bbbcde]" onClick={() => onToggle(node.id)}>
                {openFolders[node.id] ? "▾" : "▸"} {node.path}
              </button>
              {openFolders[node.id] ? (
                <Tree parent={node.id} openFolders={openFolders} selected={selected} onToggle={onToggle} onOpen={onOpen} />
              ) : null}
            </>
          ) : (
            <button
              type="button"
              className={cx(
                "block w-full rounded px-2 py-1 text-left font-mono text-sm",
                selected === node.id ? "bg-[#57F0EE]/15 text-white" : "text-[#e4e3ee]",
              )}
              onClick={() => onOpen(node.id)}
            >
              {node.path.split("/").pop()}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
