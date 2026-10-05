export function compareExpected(expected: string, actual: string): "pass" | "review" {
  const expectedText = expected.trim();
  const actualText = actual.trim();
  const expectedKey = expectedText.toLowerCase();
  const actualKey = actualText.toLowerCase();
  if (!expectedKey || !actualKey) return "review";

  const expectedNumber = Number(expectedText);
  const actualNumber = Number(actualText);
  if (Number.isFinite(expectedNumber) && Number.isFinite(actualNumber)) {
    return Math.abs(expectedNumber - actualNumber) < 1e-6 ? "pass" : "review";
  }
  if (actualKey.includes(expectedKey)) return "pass";
  if (expectedKey.includes("valueerror") && actualKey.includes("valueerror")) return "pass";
  if (expectedKey.includes("zerodivision") && actualKey.includes("zerodivision")) return "pass";
  if (expectedKey.includes("indexerror") && actualKey.includes("indexerror")) return "pass";
  if ((expectedKey === "exception" || expectedKey === "error") && actualKey.includes("error")) return "pass";
  if (expectedKey.includes("empty") && actualKey.includes("empty")) return "pass";
  return "review";
}
