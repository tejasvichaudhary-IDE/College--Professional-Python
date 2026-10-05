export const voiceLines = {
  intro:
    "Welcome to the Professional Python lab. I am Bit. We will package a small utility, test it, and record evidence a tutor can inspect.",
  define: "Before you build anything, define what you are trying to do.",
  inspect:
    "Inspect the starter before you change it. Look at the inputs, the environment, and the data shape.",
  build:
    "Adapt the starter pattern. It is guidance, not a finished submission. Check the type hints and the exception path.",
  test: "Before you run the code, predict what should happen. Then compare the expected result with the actual result.",
  review:
    "Record the result, one limitation, and a responsible-use decision. Which part is evidence, and which part is your interpretation?",
  exit: "Explain the role of the environment, the module, the type hint, the exception handler, the unit test, and the PEP 8 rule.",
  timeUp: "Your planned lab time is complete. Finish your current step and submit your evidence.",
  taskSaved: "Good. Your input and intended output are clearly defined.",
  inspectSaved: "Inspection recorded. The environment, inputs, and data shape are ready to build from.",
  venvReady: "A virtual environment keeps this project's packages isolated from other Python projects.",
  codeSaved: "Code saved. Check the type hint, the exception path, and your explanation.",
  normalPass: "Your normal case passes. Now test a boundary or error case.",
  resultsDiffer: "Your expected and actual results differ. Inspect the input and assumption.",
  testsRecorded: "Expected and actual results are recorded for both cases.",
  evidenceGood: "Good evidence. Another learner should be able to understand what happened.",
  complete: "The lab evidence is complete. Your Python utility has been documented and reviewed.",
  needAttention: "Something still needs attention before this step can be saved.",
  locked: "Save the current step before moving on.",
} as const;

export type VoiceLineId = keyof typeof voiceLines;
