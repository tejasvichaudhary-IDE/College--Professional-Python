export const STARTER_CODE = `from dataclasses import dataclass

@dataclass
class Record:
    label: str
    value: float

def average(values: list[float]) -> float:
    if not values:
        raise ValueError("values must not be empty")
    return sum(values) / len(values)
`;

export const starterGuidance = {
  eyebrow: "STARTER GUIDANCE",
  caveat: "This is a pattern, not a complete submission.",
  detail:
    "Adapt it to the task, explain what each part does, and test it with a known case. You can keep the pattern or adjust the names. Keep a typed function, an exception path, and a result you can check.",
  fileName: "src/utility.py",
} as const;

export interface StarterFile {
  id: string;
  path: string;
  kind: "folder" | "file";
  parent: string | null;
  content?: string;
}

export const starterTree: StarterFile[] = [
  { id: "root", path: "project/", kind: "folder", parent: null },
  { id: "src", path: "src/", kind: "folder", parent: "root" },
  { id: "tests", path: "tests/", kind: "folder", parent: "root" },
  {
    id: "utility",
    path: "src/utility.py",
    kind: "file",
    parent: "src",
    content: STARTER_CODE,
  },
  {
    id: "test",
    path: "tests/test_utility.py",
    kind: "file",
    parent: "tests",
    content: `from src.utility import average

def test_average_known_case():
    """Normal case: the mean of three known values is 20."""
    assert average([10, 20, 30]) == 20
`,
  },
  {
    id: "requirements",
    path: "requirements.txt",
    kind: "file",
    parent: "root",
    content: `# No third-party packages are required for this exercise.
# Keep project dependencies isolated inside .venv.
`,
  },
  {
    id: "readme",
    path: "README.md",
    kind: "file",
    parent: "root",
    content: `# Package a small Python utility

Classroom starter for M1 — Professional Python.

Create a virtual environment, adapt the typed utility in src/utility.py, and keep one test in tests/test_utility.py.

Use a supervised environment and a permitted classroom or public dataset only.

## Setup

python -m venv .venv

Activate the environment, then run the test with your course's permitted runner.
`,
  },
];

export const dataShape = {
  title: "Record data shape",
  typeName: "Record",
  fields: [
    { name: "label", type: "str" },
    { name: "value", type: "float" },
  ],
  sample: "[10.0, 20.0, 30.0]",
  shape: "list[float]",
  length: 3,
  empty: "[]",
  emptyNote: "Length 0. Treated as invalid input for this utility.",
} as const;
