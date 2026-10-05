import { Component, type ReactNode } from "react";
import { LabProvider, useLab } from "./context/LabContext.tsx";
import { IntroScreen } from "./components/intro/IntroScreen.tsx";
import { LabShell } from "./components/layout/LabShell.tsx";
import { CompleteScreen } from "./components/stages/CompleteScreen.tsx";
import { ModuleScreen } from "./components/stages/ModuleScreen.tsx";

function LabApp() {
  const { state } = useLab();
  if (state.phase === "intro") return <IntroScreen />;
  if (state.phase === "module") return <ModuleScreen />;
  if (state.phase === "complete") return <CompleteScreen />;
  return <LabShell />;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="mx-auto max-w-lg p-8 text-[#e4e3ee]">
          <h1 className="text-2xl font-semibold text-white">The lab hit a problem</h1>
          <p className="mt-3 text-sm leading-6">Reload the page to continue from the last saved point in this browser.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => window.location.reload()}>
            Reload lab
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LabProvider>
        <LabApp />
      </LabProvider>
    </ErrorBoundary>
  );
}
