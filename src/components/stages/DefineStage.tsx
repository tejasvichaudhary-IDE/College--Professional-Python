import { brand } from "../../data/branding.ts";
import { taskFields } from "../../data/questions.ts";
import { useLab } from "../../context/LabContext.tsx";
import { Button, Notice, TextField } from "../ui/Controls.tsx";
import { StageFrame } from "./StageFrame.tsx";

export function DefineStage() {
  const { state, dispatch } = useLab();
  return (
    <StageFrame
      id="define"
      actions={
        <>
          <Button type="button" onClick={() => dispatch({ type: "SAVE_TASK", go: false })}>
            Save task
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "SAVE_TASK", go: true })}>
            Save and continue
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[#e4e3ee]">{brand.labGoal}</p>
      {state.notice && state.currentStage === "define" ? <Notice tone={state.notice.tone}>{state.notice.text}</Notice> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {taskFields.map((field) => (
          <TextField
            key={field.id}
            id={field.id}
            label={field.label}
            hint={field.hint}
            placeholder={field.placeholder}
            rows={field.rows}
            value={state[field.id]}
            error={state.errors[field.id]}
            onChange={(value) => dispatch({ type: "SET_TEXT", key: field.id, value })}
          />
        ))}
      </div>
    </StageFrame>
  );
}
