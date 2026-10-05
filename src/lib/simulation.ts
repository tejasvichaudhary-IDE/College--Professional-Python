export interface Analysis {
  hasFunction: boolean;
  functionName: string | null;
  hasTypeHint: boolean;
  hasException: boolean;
  hasEmptyGuard: boolean;
  hasTest: boolean;
  hasDataclass: boolean;
  notes: string[];
}

export interface SimResult {
  actual: string;
  detail: string;
}

interface UtilityFn {
  name: string;
  params: string;
  paramName: string | null;
  returns: string | null;
  body: string;
}

const IDENT = "[A-Za-z_][A-Za-z0-9_]*";

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "non-finite result";
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

export function parseNumberList(raw: string): { ok: true; values: number[] } | { ok: false; message: string } {
  const text = raw.trim();
  if (!text.startsWith("[") || !text.endsWith("]")) {
    return { ok: false, message: "Use a list of numbers. Example: [10, 20, 30]." };
  }
  const inner = text.slice(1, -1).trim();
  if (!inner) return { ok: true, values: [] };
  const values: number[] = [];
  for (const part of inner.split(",")) {
    const token = part.trim();
    if (!token) continue;
    if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(token)) {
      return { ok: false, message: `Could not read "${token}" as a float.` };
    }
    values.push(Number(token));
  }
  return { ok: true, values };
}

function withoutDocstrings(code: string): string {
  return code.replace(/'''[\s\S]*?'''/g, "").replace(/"""[\s\S]*?"""/g, "");
}

function stripComments(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      let quote = "";
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (quote) {
          if (char === "\\" ) {
            i += 1;
            continue;
          }
          if (char === quote) quote = "";
          continue;
        }
        if (char === "#") return line.slice(0, i);
        if (char === '"' || char === "'") quote = char;
      }
      return line;
    })
    .join("\n");
}

function cleaned(code: string): string {
  return stripComments(withoutDocstrings(code));
}

function findUtilities(code: string): UtilityFn[] {
  const source = cleaned(code);
  const pattern = new RegExp(`^def\\s+(${IDENT})\\s*\\(([^)]*)\\)\\s*(->\\s*[^:\\n]+)?\\s*:`, "gm");
  const found: UtilityFn[] = [];
  for (const match of source.matchAll(pattern)) {
    const name = match[1] ?? "";
    const params = match[2] ?? "";
    const returns = match[3]?.trim() ?? null;
    const start = (match.index ?? 0) + match[0].length;
    const rest = source.slice(start);
    const newline = rest.indexOf("\n");
    const inline = (newline === -1 ? rest : rest.slice(0, newline)).trim();
    const after = newline === -1 ? "" : rest.slice(newline + 1);
    const bodyLines: string[] = [];
    if (inline) bodyLines.push(inline);
    for (const line of after.split("\n")) {
      if (line.trim() === "") {
        bodyLines.push(line);
        continue;
      }
      if (!/^\s+/.test(line)) break;
      bodyLines.push(line);
    }
    const firstParam = params.split(",")[0]?.trim().split(":")[0]?.split("=")[0]?.trim() ?? "";
    found.push({
      name,
      params,
      paramName: firstParam && new RegExp(`^${IDENT}$`).test(firstParam) ? firstParam : null,
      returns,
      body: bodyLines.join("\n"),
    });
  }
  return found;
}

function chooseUtility(fns: UtilityFn[]): UtilityFn | null {
  return fns.find((fn) => fn.params.includes("list[")) ?? fns.find((fn) => !fn.name.startsWith("_")) ?? fns[0] ?? null;
}

function emptyBlock(body: string, param: string | null): string | null {
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const matchesParam = param
      ? new RegExp(`^\\s*if\\s+not\\s+${param}\\b`).test(line) ||
        new RegExp(`^\\s*if\\s+len\\(\\s*${param}\\s*\\)\\s*==\\s*0`).test(line) ||
        new RegExp(`^\\s*if\\s+${param}\\s*==\\s*\\[\\s*\\]`).test(line)
      : false;
    const generic = /^\s*if\s+not\s+[A-Za-z_]\w*/.test(line) || /^\s*if\s+len\(\s*[A-Za-z_]\w*\s*\)\s*==\s*0/.test(line);
    if (!matchesParam && !generic) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const block = [line];
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j] ?? "";
      if (next.trim() === "") {
        block.push(next);
        continue;
      }
      const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
      if (nextIndent <= indent) break;
      block.push(next);
    }
    return block.join("\n");
  }
  return null;
}

function exceptionFrom(source: string): string | null {
  const withMessage = source.match(/raise\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*(['"])(.*?)\2\s*\)/);
  if (withMessage) {
    const name = withMessage[1] ?? "Exception";
    const message = withMessage[3] ?? "";
    return message ? `${name}: ${message}` : name;
  }
  const bare = source.match(/raise\s+([A-Za-z_][A-Za-z0-9_]*)/);
  return bare?.[1] ?? null;
}

function evalExpression(expr: string, param: string, values: number[]): SimResult | null {
  const mean = new RegExp(`^\\(?\\s*sum\\(\\s*${param}\\s*\\)\\s*/\\s*len\\(\\s*${param}\\s*\\)\\s*\\)?$`);
  const rounded = new RegExp(
    `^round\\(\\s*sum\\(\\s*${param}\\s*\\)\\s*/\\s*len\\(\\s*${param}\\s*\\)\\s*,\\s*(\\d+)\\s*\\)$`,
  );
  const sumOnly = new RegExp(`^sum\\(\\s*${param}\\s*\\)$`);
  const lenOnly = new RegExp(`^len\\(\\s*${param}\\s*\\)$`);
  const minOnly = new RegExp(`^min\\(\\s*${param}\\s*\\)$`);
  const maxOnly = new RegExp(`^max\\(\\s*${param}\\s*\\)$`);
  const first = new RegExp(`^${param}\\s*\\[\\s*0\\s*\\]$`);
  const literal = /^[-+]?\d+(?:\.\d+)?$/;

  if (values.length === 0 && mean.test(expr)) {
    return {
      actual: "ZeroDivisionError: division by zero",
      detail:
        "The list is empty and the return expression still divides by its length. The simulation reports ZeroDivisionError. An explicit exception path would tell the caller that empty input is rejected.",
    };
  }
  if (mean.test(expr)) {
    const total = values.reduce((sum, value) => sum + value, 0);
    const result = formatNumber(total / values.length);
    return {
      actual: result,
      detail: `The simulation added every value and divided by the count. The total is ${formatNumber(total)} across ${values.length} value${values.length === 1 ? "" : "s"}, so the result is ${result}.`,
    };
  }
  const roundMatch = rounded.exec(expr);
  if (roundMatch && values.length > 0) {
    const digits = Number(roundMatch[1]);
    const total = values.reduce((sum, value) => sum + value, 0);
    const result = formatNumber(Number((total / values.length).toFixed(digits)));
    return {
      actual: result,
      detail: `The simulation computed the mean and rounded it to ${digits} decimal place${digits === 1 ? "" : "s"}.`,
    };
  }
  if (sumOnly.test(expr)) {
    return {
      actual: formatNumber(values.reduce((sum, value) => sum + value, 0)),
      detail: "The return expression is the sum of the list, not the mean.",
    };
  }
  if (lenOnly.test(expr)) {
    return { actual: String(values.length), detail: "The return expression is the length of the list." };
  }
  if (minOnly.test(expr)) {
    if (values.length === 0) {
      return {
        actual: "ValueError: min() arg is an empty sequence",
        detail: "min() cannot choose a value from an empty list. The simulation reports ValueError.",
      };
    }
    return { actual: formatNumber(Math.min(...values)), detail: "The return expression is the smallest value." };
  }
  if (maxOnly.test(expr)) {
    if (values.length === 0) {
      return {
        actual: "ValueError: max() arg is an empty sequence",
        detail: "max() cannot choose a value from an empty list. The simulation reports ValueError.",
      };
    }
    return { actual: formatNumber(Math.max(...values)), detail: "The return expression is the largest value." };
  }
  if (first.test(expr)) {
    if (values.length === 0) {
      return {
        actual: "IndexError: list index out of range",
        detail: "The expression reads the first item, and the list has no items.",
      };
    }
    return { actual: formatNumber(values[0] ?? 0), detail: "The return expression is the first value in the list." };
  }
  if (literal.test(expr)) {
    return { actual: formatNumber(Number(expr)), detail: "The function returned a literal number." };
  }
  return null;
}

export function analyzeCode(code: string): Analysis {
  const source = cleaned(code);
  const fns = findUtilities(source);
  const utility = chooseUtility(fns);
  const indentedDef = !utility && /^\s+def\s+/m.test(code);
  const hasTypeHint = Boolean(utility && (utility.params.includes(":") || utility.returns));
  const hasException = Boolean(utility && /raise\s+[A-Za-z_]/.test(utility.body));
  const hasEmptyGuard = Boolean(utility && emptyBlock(utility.body, utility.paramName));
  const notes: string[] = [];

  if (indentedDef) {
    notes.push("A function is indented. Define it at module level so another file can import it.");
  }
  if (hasTypeHint) notes.push("Type hint detected.");
  else notes.push("Check the function's return type.");

  if (hasException) notes.push("Exception path included.");
  else notes.push("Consider whether the function handles empty input.");

  const pep: string[] = [];
  if (code.includes("\t")) pep.push("PEP 8 uses four spaces for indentation. A tab character is present.");
  if (/^def\s+[A-Z]/m.test(code)) pep.push("PEP 8 function names use lower_snake_case.");
  if (/[ \t]+$/m.test(code)) pep.push("Trailing whitespace is present. PEP 8 leaves lines clean.");
  if (/def\s+\w+\s+\(/.test(code)) pep.push("PEP 8 avoids a space before the parenthesis in a function definition.");
  if (/return\s+sum\([^)]+\)\/len/.test(code)) pep.push("Check spacing around the division operator for PEP 8 consistency.");
  if (pep.length === 0) notes.push("Naming and spacing look consistent with these PEP 8 checks.");
  else notes.push(...pep.slice(0, 2));

  if (utility && /assert\s+|def\s+test_/.test(source)) notes.push("A test or assertion is present in the editor.");
  if (/@dataclass/.test(source)) notes.push("Dataclass detected.");

  return {
    hasFunction: Boolean(utility),
    functionName: utility?.name ?? null,
    hasTypeHint,
    hasException,
    hasEmptyGuard,
    hasTest: /assert\s+|def\s+test_/.test(source),
    hasDataclass: /@dataclass/.test(source),
    notes,
  };
}

export function simulateCall(code: string, inputRaw: string): SimResult {
  const utility = chooseUtility(findUtilities(code));
  if (!utility) {
    const indented = /^\s+def\s+/m.test(code);
    return {
      actual: indented ? "Function is indented" : "No function definition detected",
      detail: indented
        ? "The simulation looks for a module-level function. Remove the extra indent so the utility can be imported."
        : "Add a typed function before running a sample call.",
    };
  }
  const parsed = parseNumberList(inputRaw);
  if (!parsed.ok) return { actual: parsed.message, detail: parsed.message };

  const param = utility.paramName ?? "values";
  const block = emptyBlock(utility.body, utility.paramName);
  if (parsed.values.length === 0 && block) {
    const raised = exceptionFrom(block);
    if (raised) {
      return {
        actual: raised,
        detail:
          "The list is empty. The function treats that as invalid and raises before dividing. An empty list has length 0, so dividing by the length would not describe a mean. The exception keeps that failure visible.",
      };
    }
    const literal = block.match(/return\s+([-+]?\d+(?:\.\d+)?)/);
    if (literal?.[1]) {
      return {
        actual: formatNumber(Number(literal[1])),
        detail:
          "The empty-input branch returned a number. That choice hides the invalid case inside a normal-looking result. Consider whether a caller can tell that the list was empty.",
      };
    }
  }

  const working = block ? utility.body.replace(block, "") : utility.body;
  const returns = [...working.matchAll(/^\s*return\s+(.+)$/gm)].map((match) => match[1]?.trim() ?? "");
  const mean = returns.find((expr) => expr.includes("sum(") && expr.includes("len("));
  const chosen = mean ?? returns[returns.length - 1];
  if (!chosen) {
    return {
      actual: "None",
      detail: "The function does not return a value the simulation can record. In Python the result would be None.",
    };
  }
  const evaluated = evalExpression(chosen.replace(/#.*$/, "").trim(), param, parsed.values);
  if (evaluated) return evaluated;
  return {
    actual: "Return expression not simulated",
    detail: `LAB SIMULATION supports sum, len, min, max, and sum/len on the parameter "${param}". This return was not one of those patterns: ${chosen}`,
  };
}

export function sampleLog(code: string): string {
  const analysis = analyzeCode(code);
  const normal = simulateCall(code, "[10, 20, 30]");
  const empty = simulateCall(code, "[]");
  const name = analysis.functionName ?? "utility";
  return [
    "LAB SIMULATION",
    "This is not a local Python interpreter.",
    "The simulation evaluates the typed function pattern in your editor.",
    "",
    analysis.hasFunction ? `Detected function: ${name}` : "Detected function: none",
    `Type hints: ${analysis.hasTypeHint ? "yes" : "not found"}`,
    `Exception path: ${analysis.hasException ? "yes" : "not found"}`,
    "",
    "Sample inspection call",
    `  ${name}([10.0, 20.0, 30.0])`,
    `  -> ${normal.actual}`,
    "",
    "Empty-input path",
    `  ${name}([])`,
    `  -> ${empty.actual}`,
  ].join("\n");
}
