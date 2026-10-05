import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/cx.ts";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button className={cx("btn", `btn-${variant}`, className)} {...props} />;
}

export function TextField({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint ? (
        <p id={hintId} className="hint">
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        spellCheck
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={cx(hint && hintId, error && errorId) || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-[#f0d78a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LineField(props: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const { label, error, hint, ...input } = props;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="hint">{hint}</p> : null}
      <input id={id} className="plain-input" autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} {...input} />
      {error ? (
        <p role="alert" className="text-sm text-[#f0d78a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "ok" | "attention"; children: ReactNode }) {
  return (
    <div className={cx("alert", tone === "ok" ? "alert-ok" : "alert-attention")} role="status">
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: "idle" | "pass" | "review" }) {
  const label = status === "pass" ? "PASS" : status === "review" ? "REVIEW" : "NOT RUN";
  const tone =
    status === "pass"
      ? "border-[#57F0EE]/40 text-[#57F0EE]"
      : status === "review"
        ? "border-[#f0d78a]/50 text-[#f0d78a]"
        : "border-white/15 text-[#bbbcde]";
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold tracking-[0.14em]", tone)}>
      <span aria-hidden="true">{status === "pass" ? "✓" : status === "review" ? "◌" : "–"}</span>
      {label}
    </span>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const nodes = root ? [...root.querySelectorAll<HTMLElement>("button, [href], input, select, textarea")] : [];
    nodes[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/65" aria-label="Close dialog" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="panel relative z-10 w-full max-w-md p-5"
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <div className="mt-3 text-[#e4e3ee]">{children}</div>
      </div>
    </div>
  );
}
