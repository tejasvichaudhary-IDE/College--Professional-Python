import { highlightPython } from "../../lib/highlight.ts";

export function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const highlighted = highlightPython(value).split("\n");

  return (
    <div className="editor-shell">
      <div className="editor-highlight" aria-hidden="true">
        {highlighted.map((line, index) => (
          <div className="editor-line" key={index}>
            <span className="editor-gutter">{index + 1}</span>
            <span className="editor-code" dangerouslySetInnerHTML={{ __html: line || " " }} />
          </div>
        ))}
      </div>
      <textarea
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="soft"
        aria-label="Python editor for src/utility.py. Lab simulation, not a local interpreter."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          event.preventDefault();
          const el = event.currentTarget;
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const next = `${value.slice(0, start)}    ${value.slice(end)}`;
          onChange(next);
          requestAnimationFrame(() => {
            el.selectionStart = start + 4;
            el.selectionEnd = start + 4;
          });
        }}
      />
    </div>
  );
}
