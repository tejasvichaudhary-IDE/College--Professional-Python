export const taskFields = [
  {
    id: "task",
    label: "Task",
    hint: "One sentence. Example shape: package a utility that averages a list of floats.",
    placeholder: "What are you trying to do?",
    rows: 2,
  },
  {
    id: "input",
    label: "Input",
    hint: "What the function receives. Example shape: a list of floats.",
    placeholder: "What goes in?",
    rows: 2,
  },
  {
    id: "intendedOutput",
    label: "Intended output",
    hint: "What a successful call should return, and what an invalid call should do.",
    placeholder: "What should come out?",
    rows: 2,
  },
  {
    id: "assumption",
    label: "Assumption",
    hint: "One thing you are taking as given. Example shape: empty input is invalid.",
    placeholder: "What are you assuming?",
    rows: 2,
  },
] as const;

export const reviewFields = [
  {
    id: "builtSummary",
    label: "What I built or tested",
    hint: "Name the utility and the cases you ran.",
    rows: 2,
  },
  {
    id: "expectedSummary",
    label: "What I expected",
    hint: "State the predicted result before you interpret it.",
    rows: 2,
  },
  {
    id: "actualSummary",
    label: "What actually happened",
    hint: "Record the result you observed, including an error if one appeared.",
    rows: 2,
  },
  {
    id: "learnedSummary",
    label: "What I changed or learned",
    hint: "Include one limitation of this result.",
    rows: 2,
  },
  {
    id: "evidenceLink",
    label: "Evidence link or file",
    hint: "A file name or notebook location is enough. Example: evidence/m1-utility.md",
    rows: 1,
  },
  {
    id: "responsibleUseDecision",
    label: "Responsible-use decision",
    hint: "What this classroom result can support, and what it must not be used to decide.",
    rows: 2,
  },
] as const;

export const reflectionFields = [
  {
    id: "evidenceReflection",
    label: "Which part of your result is evidence?",
    hint: "Evidence is something another person could rerun or read, such as the input, the actual output, or the saved code.",
  },
  {
    id: "interpretationReflection",
    label: "Which part is interpretation?",
    hint: "Interpretation is your explanation of what the result means or how far it can be trusted.",
  },
] as const;

export const troubleshootingPrompts = [
  "What did you predict before running the change?",
  "What shape, type, key, parameter, or assumption did the operation receive?",
  "Which line or transformation should be isolated?",
  "Would a different reasonable choice change the result?",
  "What would another learner need to rerun or review this artifact?",
] as const;

export const bitPrompts: Record<string, readonly string[]> = {
  define: [
    "Start by identifying the input and intended output.",
    "What are you assuming is true before the function runs?",
  ],
  inspect: [
    "What is the type of each field on Record?",
    "Which file would another learner import, and which file would they run?",
  ],
  build: [
    "Check the function's input type and return type.",
    "What happens when the list is empty?",
  ],
  test: [
    "Before you run the code, predict what should happen.",
    "Would another reasonable choice change the result?",
  ],
  review: [
    "Which part of the result is evidence, and which part is your interpretation?",
    "What would another learner need in order to rerun this?",
  ],
  exit: [
    "Name the role of the construct. You do not need to restate the whole function.",
    "Keep the explanation specific to this utility.",
  ],
};

export const safetyCopy = {
  title: "Responsible professional practice",
  body: "Use a supervised local or hosted environment and a permitted classroom or public dataset. Do not upload personal data, credentials, API keys, confidential files, or material whose sharing rights are unclear. This lab should remain a low-risk educational exercise.",
  confirm:
    "I confirm that I am using permitted data and have not included credentials, API keys, personal data, or confidential material.",
  practice:
    "Use lawful and permitted data. Keep personal information, credentials, API keys, and confidential material out of repositories and screenshots. Do not present a small classroom result as proof for a high-stakes decision.",
} as const;

export const conceptNotes = [
  {
    term: "Environment",
    text: "Isolates this project's packages from other Python projects on the same machine.",
  },
  {
    term: "Module",
    text: "A Python file of definitions another file can import. Here, src/utility.py is the module.",
  },
  {
    term: "Dataclass",
    text: "A compact typed record. Record holds a string label and a float value.",
  },
  {
    term: "Type hint",
    text: "An annotation such as list[float] or -> float. It states the expected type for a reader or a checker.",
  },
  {
    term: "Exception path",
    text: "An explicit failure for an invalid case. An empty list raises ValueError instead of looking like a mean.",
  },
  {
    term: "Unit test",
    text: "A recorded check that a known case matches the result you expect.",
  },
  {
    term: "PEP 8",
    text: "A style convention for naming, spacing, and layout so another developer can maintain the code.",
  },
] as const;
