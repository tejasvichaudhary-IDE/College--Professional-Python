export const knowledgeCheck = {
  intro:
    "Explain the role of an environment, module, type hint, exception handler, unit test, and PEP 8 style rule.",
  code: {
    id: "type-hint",
    prompt: "Which part of this code is a type hint?",
    note: "Select one annotation. More than one part of the signature qualifies.",
    sample: `def average(values: list[float]) -> float:
    if not values:
        raise ValueError("values must not be empty")
    return sum(values) / len(values)`,
    choices: [
      {
        id: "def",
        label: "def average",
        correct: false,
        feedback:
          "That names the function. A type hint is an annotation, such as list[float] on the parameter or float after the arrow.",
      },
      {
        id: "param",
        label: "values: list[float]",
        correct: true,
        feedback:
          "Yes. values: list[float] is a type hint on the parameter. The return annotation -> float is a type hint as well.",
      },
      {
        id: "return-hint",
        label: "-> float",
        correct: true,
        feedback:
          "Yes. -> float is a return type hint. values: list[float] is also a type hint, on the parameter.",
      },
      {
        id: "raise",
        label: 'raise ValueError("values must not be empty")',
        correct: false,
        feedback:
          "That is the exception path. A type hint annotates a value, such as values: list[float].",
      },
      {
        id: "expr",
        label: "sum(values) / len(values)",
        correct: false,
        feedback:
          "That is the return expression. Look at the annotations on the parameter and the return type.",
      },
    ],
  },
  matching: {
    prompt: "Match each idea to its role in this lab.",
    terms: [
      { id: "environment", label: "Environment" },
      { id: "module", label: "Module" },
      { id: "typehint", label: "Type hint" },
      { id: "exception", label: "Exception handler" },
      { id: "unittest", label: "Unit test" },
      { id: "pep8", label: "PEP 8 style rule" },
    ],
    definitions: [
      { id: "unittest", text: "A check that compares a known case with the result you expect." },
      { id: "pep8", text: "A shared convention for naming, spacing, and layout so another developer can read the code." },
      { id: "environment", text: "Isolates this project's packages from other Python projects." },
      { id: "exception", text: "Makes an invalid path explicit, by raising or catching a specific exception, instead of hiding the failure." },
      { id: "typehint", text: "States the expected type of a parameter, value, or return." },
      { id: "module", text: "A Python file of definitions that another file can import." },
    ],
  },
  mcq: [
    {
      id: "unitTestChoice",
      prompt: "What does a unit test primarily provide in this lab?",
      options: [
        {
          id: "known",
          label: "A recorded check that a known case behaves as expected.",
          correct: true,
          feedback: "A unit test records one known case. It does not, by itself, prove every input.",
        },
        {
          id: "proof",
          label: "Proof that the utility is correct for every possible input.",
          correct: false,
          feedback: "One test cannot certify every input. It checks the case you wrote down.",
        },
        {
          id: "comment",
          label: "A comment that replaces running the code.",
          correct: false,
          feedback: "A comment is not evidence. The test has to compare an expected result with an actual one.",
        },
        {
          id: "hide",
          label: "A way to remove an error from the evidence.",
          correct: false,
          feedback: "Hiding an error removes the evidence a tutor needs. Record the error instead.",
        },
      ],
    },
    {
      id: "pep8Choice",
      prompt: "Which statement best describes a PEP 8 style rule?",
      options: [
        {
          id: "style",
          label: "A convention for readable naming, spacing, and layout.",
          correct: true,
          feedback: "PEP 8 is a style convention for people reading and maintaining the code.",
        },
        {
          id: "venv",
          label: "A command that creates a virtual environment.",
          correct: false,
          feedback: "The virtual environment is created with a command such as python -m venv .venv. That is not PEP 8.",
        },
        {
          id: "checker",
          label: "A type checker that executes the function.",
          correct: false,
          feedback: "PEP 8 does not run the function. Type hints and tests do different jobs.",
        },
        {
          id: "tests-only",
          label: "A rule that only applies to test files.",
          correct: false,
          feedback: "PEP 8 applies to the Python you expect another person to read, including the utility module.",
        },
      ],
    },
  ],
  short: {
    id: "exceptionWhy",
    prompt: "Why is the exception path useful?",
    hint: "Consider empty input and what a caller needs to know. A few clear sentences are enough.",
    minLength: 24,
  },
} as const;
