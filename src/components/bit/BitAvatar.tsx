import { bitStates } from "../../data/branding.ts";
import { cx } from "../../lib/cx.ts";
import type { BitState } from "../../types/lab.ts";

const sizes = {
  sm: "h-16 w-14",
  md: "h-28 w-24",
  lg: "h-64 w-48",
};

export function BitAvatar({ state, size = "md" }: { state: BitState; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cx("bit-frame", `bit-${state}`, sizes[size], size === "lg" && "mx-auto")}
      role="img"
      aria-label={`Bit, lab mentor, ${bitStates[state]}`}
    >
      <img src="/bit.png" alt="" />
    </div>
  );
}
