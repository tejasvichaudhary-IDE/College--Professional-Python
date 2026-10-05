import { safetyCopy } from "../../data/questions.ts";
import { useLab } from "../../context/LabContext.tsx";

export function SafetyPanel() {
  const { state, dispatch } = useLab();
  return (
    <section className="panel border-[#f0d78a]/30 p-4" aria-label="Responsible use">
      <h2 className="text-base font-semibold text-white">{safetyCopy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#e4e3ee]">{safetyCopy.body}</p>
      <p className="mt-2 text-sm leading-6 text-[#bbbcde]">{safetyCopy.practice}</p>
      <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-white">
        <input
          type="checkbox"
          className="mt-1 accent-[#57F0EE]"
          checked={state.safetyAcknowledged}
          onChange={(event) => dispatch({ type: "SET_SAFETY", value: event.target.checked })}
        />
        <span>{safetyCopy.confirm}</span>
      </label>
      {state.errors.safety ? (
        <p role="alert" className="mt-2 text-sm text-[#f0d78a]">
          {state.errors.safety}
        </p>
      ) : null}
    </section>
  );
}
