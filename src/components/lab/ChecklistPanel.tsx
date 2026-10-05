import { facilitatorChecks } from "../../data/rubrics.ts";
import { reflectionFields } from "../../data/questions.ts";
import { useLab } from "../../context/LabContext.tsx";
import { TextField } from "../ui/Controls.tsx";

export function ChecklistPanel() {
  const { state, dispatch } = useLab();
  return (
    <section className="panel p-4" aria-label="Review checklist">
      <h2 className="text-base font-semibold text-white">Review checklist</h2>
      <p className="mt-1 text-sm text-[#bbbcde]">
        Optional facilitator check. Use it to decide whether a peer could inspect this result.
      </p>
      <ul className="mt-3 space-y-2">
        {facilitatorChecks.map((item) => (
          <li key={item.id}>
            <label className="flex items-start gap-2 text-sm text-[#e4e3ee]">
              <input
                type="checkbox"
                className="mt-1 accent-[#57F0EE]"
                checked={Boolean(state.checklist[item.id])}
                onChange={() => dispatch({ type: "TOGGLE_CHECK", id: item.id })}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-4">
        {reflectionFields.map((field) => (
          <TextField
            key={field.id}
            id={field.id}
            label={field.label}
            hint={field.hint}
            rows={2}
            value={state[field.id]}
            error={state.errors[field.id]}
            onChange={(value) => dispatch({ type: "SET_TEXT", key: field.id, value })}
          />
        ))}
      </div>
    </section>
  );
}
