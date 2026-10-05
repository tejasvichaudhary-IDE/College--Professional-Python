import { troubleshootingPrompts } from "../../data/questions.ts";
import { useLab } from "../../context/LabContext.tsx";

export function HintPanel() {
  const { dispatch } = useLab();
  return (
    <details
      className="panel p-4"
      onToggle={(event) => {
        const open = event.currentTarget.open;
        dispatch({
          type: "SET_BIT",
          bitState: open ? "pointing" : "explaining",
          override: open ? troubleshootingPrompts[0] : null,
        });
      }}
    >
      <summary className="cursor-pointer text-sm font-semibold text-white">Need a Hint?</summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#bbbcde]">
        {troubleshootingPrompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>
    </details>
  );
}
