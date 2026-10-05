const KEYWORDS = new Set(
  "from import class def return if not raise for while in and or else elif pass None True False".split(" "),
);
const BUILTINS = new Set(
  "list float str int bool dict set tuple len sum min max round ValueError dataclass Exception ZeroDivisionError IndexError".split(
    " ",
  ),
);

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function tokenizeLine(line: string): string {
  let html = "";
  let index = 0;
  while (index < line.length) {
    const char = line[index] ?? "";
    if (char === "#") {
      html += `<span class="tok-cmt">${escapeHtml(line.slice(index))}</span>`;
      break;
    }
    if (char === '"' || char === "'") {
      let end = index + 1;
      while (end < line.length && line[end] !== char) {
        if (line[end] === "\\") end += 1;
        end += 1;
      }
      if (end < line.length) end += 1;
      html += `<span class="tok-str">${escapeHtml(line.slice(index, end))}</span>`;
      index = end;
      continue;
    }
    if (char === "@") {
      const match = /^@\w+/.exec(line.slice(index));
      if (match) {
        html += `<span class="tok-dec">${escapeHtml(match[0])}</span>`;
        index += match[0].length;
        continue;
      }
    }
    if (/[0-9]/.test(char)) {
      const match = /^\d+(?:\.\d+)?/.exec(line.slice(index));
      if (match) {
        html += `<span class="tok-num">${match[0]}</span>`;
        index += match[0].length;
        continue;
      }
    }
    if (/[A-Za-z_]/.test(char)) {
      const match = /^[A-Za-z_]\w*/.exec(line.slice(index));
      const word = match?.[0] ?? char;
      const next = line.slice(index + word.length);
      const klass = KEYWORDS.has(word) ? "tok-kw" : BUILTINS.has(word) ? "tok-type" : /^\s*\(/.test(next) ? "tok-fn" : "";
      html += klass ? `<span class="${klass}">${escapeHtml(word)}</span>` : escapeHtml(word);
      index += word.length;
      continue;
    }
    html += escapeHtml(char);
    index += 1;
  }
  return html;
}

export function highlightPython(code: string): string {
  if (!code) return "";
  return code.split("\n").map((line) => tokenizeLine(line)).join("\n");
}
