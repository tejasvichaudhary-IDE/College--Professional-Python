import { STARTER_CODE } from "../src/data/starterCode.ts";
import { analyzeCode, simulateCall } from "../src/lib/simulation.ts";
import { compareExpected } from "../src/lib/compare.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const analysis = analyzeCode(STARTER_CODE);
assert(analysis.hasFunction, "function");
assert(analysis.hasTypeHint, "hint");
assert(analysis.hasException, "exception");
assert(analysis.functionName === "average", "name");

const normal = simulateCall(STARTER_CODE, "[10, 20, 30]");
assert(normal.actual === "20", `normal ${normal.actual}`);
assert(compareExpected("20", normal.actual) === "pass", "compare 20");
assert(compareExpected("20.0", normal.actual) === "pass", "compare 20.0");

const empty = simulateCall(STARTER_CODE, "[]");
assert(empty.actual.includes("ValueError"), empty.actual);
assert(compareExpected("ValueError", empty.actual) === "pass", "compare error");

const single = simulateCall(STARTER_CODE, "[5]");
assert(single.actual === "5", single.actual);

const half = simulateCall(STARTER_CODE, "[1, 2]");
assert(half.actual === "1.5", half.actual);

const renamed = `def mean_value(nums: list[float]) -> float:\n    if not nums:\n        raise ValueError("values must not be empty")\n    return sum(nums) / len(nums)\n`;
assert(simulateCall(renamed, "[2, 4]").actual === "3", "renamed");
assert(simulateCall(renamed, "[]").actual.includes("ValueError"), "renamed empty");

const unguarded = `def average(values: list[float]) -> float:\n    return sum(values) / len(values)\n`;
assert(simulateCall(unguarded, "[]").actual.includes("ZeroDivisionError"), "zero");

assert(simulateCall(STARTER_CODE, "10").actual.includes("list"), "shape");
console.log("simulation checks passed");
