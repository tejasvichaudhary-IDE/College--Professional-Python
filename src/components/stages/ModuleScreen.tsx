import { brand } from "../../data/branding.ts";
import { conceptNotes } from "../../data/questions.ts";
import { useLab } from "../../context/LabContext.tsx";
import { Header } from "../layout/Header.tsx";
import { Button } from "../ui/Controls.tsx";

export function ModuleScreen() {
  const { dispatch } = useLab();
  return (
    <div className="flex min-h-dvh flex-col">
      <Header showTimer={false} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#57F0EE]">{brand.organization}</p>
        <h1 className="text-3xl font-semibold text-white">{brand.moduleTitle}</h1>
        <p className="text-[#bbbcde]">{brand.program}</p>
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-white">Why this module matters</h2>
          <p className="mt-2 text-sm leading-6 text-[#e4e3ee]">
            Professional data work depends on code that another person can install, read, test, and maintain.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#bbbcde]">{brand.moduleScope}</p>
        </section>
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-white">Session outcome</h2>
          <p className="mt-2 text-sm leading-6 text-[#e4e3ee]">
            Learners should be ready to complete the module exercises and practical lab with a clear explanation of their assumptions, evidence, limitations, and responsible-use choices.
          </p>
          <dl className="mt-4 space-y-3">
            {conceptNotes.map((note) => (
              <div key={note.term}>
                <dt className="text-sm font-semibold text-white">{note.term}</dt>
                <dd className="text-sm text-[#bbbcde]">{note.text}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-white">Lab handoff</h2>
          <p className="mt-2 text-sm leading-6 text-[#bbbcde]">{brand.handoff}</p>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => dispatch({ type: "BACK_TO_EVIDENCE" })}>
            Back to evidence
          </Button>
          <Button variant="secondary" type="button" onClick={() => dispatch({ type: "REVIEW_LAB" })}>
            Review lab
          </Button>
        </div>
      </main>
    </div>
  );
}
