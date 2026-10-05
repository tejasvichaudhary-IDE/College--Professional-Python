export const facilitatorChecks = [
  { id: "io", label: "Learner identified input and output." },
  { id: "test", label: "Learner ran at least one test." },
  { id: "error", label: "Learner did not hide an error." },
  { id: "assumption", label: "Learner did not rely on an unsupported assumption." },
  {
    id: "peer",
    label: "Learner recorded enough information for a peer or tutor to inspect the result.",
  },
] as const;

export const completionLabels = [
  { id: "task", label: "Task statement", stage: "define" },
  { id: "input", label: "Input identified", stage: "define" },
  { id: "output", label: "Intended output identified", stage: "define" },
  { id: "assumption", label: "Assumption recorded", stage: "define" },
  { id: "inspected", label: "Starter and environment inspected", stage: "inspect" },
  { id: "implemented", label: "Main operation implemented", stage: "build" },
  { id: "typed", label: "Typed function demonstrated", stage: "build" },
  { id: "exception", label: "Exception path demonstrated", stage: "build" },
  { id: "normal", label: "Normal test completed", stage: "test" },
  { id: "boundary", label: "Boundary, error, alternative, or review case tested", stage: "test" },
  { id: "comparison", label: "Expected versus actual recorded", stage: "test" },
  { id: "result", label: "Result recorded", stage: "review" },
  { id: "limitation", label: "Limitation recorded", stage: "review" },
  { id: "decision", label: "Responsible-use decision recorded", stage: "review" },
  { id: "evidence", label: "Evidence captured", stage: "review" },
  { id: "exit", label: "Exit check completed", stage: "exit" },
] as const;

export const finalEvidence = [
  { id: "task", label: "Task defined" },
  { id: "inspected", label: "Environment inspected" },
  { id: "implemented", label: "Utility implemented" },
  { id: "exception", label: "Exception path tested" },
  { id: "comparison", label: "Test evidence captured" },
  { id: "decision", label: "Responsible-use decision recorded" },
] as const;
