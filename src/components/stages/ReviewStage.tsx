import { reviewFields } from "../../data/questions.ts";
import { useLab } from "../../context/LabContext.tsx";
import { Button, Notice, TextField } from "../ui/Controls.tsx";
import { ChecklistPanel } from "../lab/ChecklistPanel.tsx";
import { SafetyPanel } from "../lab/SafetyPanel.tsx";
import { StageFrame } from "./StageFrame.tsx";

export function ReviewStage() {
  const { state, dispatch } = useLab();
  return (
    <StageFrame
      id="review"
      actions={
        <>
          <Button variant="ghost" type="button" onClick={() => dispatch({ type: "GOTO", stage: "test" })}>
            Back
          </Button>
          <Button type="button" onClick={() => dispatch({ type: "SAVE_REVIEW", go: false })}>
            Save decision note
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "SAVE_REVIEW", go: true })}>
            Save and continue
          </Button>
        </>
      }
    >
      {state.notice && state.currentStage === "review" ? <Notice tone={state.notice.tone}>{state.notice.text}</Notice> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {reviewFields.map((field) => (
          <TextField
            key={field.id}
            id={field.id}
            label={field.label}
            hint={field.hint}
            rows={field.rows}
            value={state[field.id]}
            error={state.errors[field.id]}
            onChange={(value) => dispatch({ type: "SET_TEXT", key: field.id, value })}
          />
        ))}
      </div>
      <div className="field">
        <label htmlFor="evidence-file">Optional local file</label>
        <p className="hint">Choose a file name to record. The contents stay on this device and are not uploaded.</p>
        <input
          id="evidence-file"
          className="plain-input"
          type="file"
          accept=".txt,.md,.py,.png,.jpg,.pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            dispatch({ type: "SET_FILE_NAME", name: file?.name ?? "" });
          }}
        />
        {state.evidenceFileName ? <p className="text-sm text-[#bbbcde]">Selected: {state.evidenceFileName}</p> : null}
      </div>
      <SafetyPanel />
      <ChecklistPanel />
    </StageFrame>
  );
}
