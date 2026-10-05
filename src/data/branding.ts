export const brand = {
  organization: "Certily AI Academy",
  program: "Applied Python & Data Science",
  audience: "University / College learners",
  moduleCode: "M1",
  moduleName: "Professional Python",
  moduleTitle: "M1 — Professional Python",
  labKind: "15-Minute AI Lab",
  labTitle: "Package a Small Python Utility",
  durationLabel: "15:00",
  durationMs: 15 * 60 * 1000,
  timeUpMessage:
    "Your planned lab time is complete. Finish your current step and submit your evidence.",
  moduleScope:
    "Environments and packaging, modules, OOP, typing, exceptions, testing basics, and PEP 8 style.",
  labGoal:
    "Package a small Python utility with a virtual environment, typed function, exception path, and one test. Save the notebook or repository evidence and a decision note.",
  simulationLabel: "LAB SIMULATION",
  simulationDisclaimer:
    "This is not a local Python interpreter. The lab simulation evaluates the utility pattern in your editor and does not send your code anywhere.",
  storageNote: "Progress stays in this browser. It is not uploaded.",
  workbookTitle: "Applied Python & Data Science University / College Exercise Workbook",
  handoff:
    "Open the M1 Workbook sheet. Complete the five responses, copy the evidence into the practical-lab evidence grid, record the tutorial or peer reflection, and answer the exit check: Explain the role of an environment, module, type hint, exception handler, unit test, and PEP 8 style rule.",
  colors: {
    navy: "#14172E",
    ink: "#0B1021",
    purple: "#8A7BBB",
    lilac: "#BBBCDE",
    cyan: "#57F0EE",
    slate: "#8890A6",
    mist: "#E4E3EE",
    white: "#FFFFFF",
  },
} as const;

export const bitStates = {
  idle: "Standing by",
  explaining: "Explaining",
  pointing: "Highlighting",
  thinking: "Thinking",
  success: "Confirmed",
  encouraging: "Encouraging",
  warning: "Needs attention",
  reviewing: "Reviewing",
} as const;
