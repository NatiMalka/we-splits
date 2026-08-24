import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last line of defence: without this, any render-time throw leaves an empty
 * white page with no message and no way out. Must be a class component —
 * React only exposes render-error catching through these lifecycle methods.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this — it's the only trace of what happened, since there's no
    // error-reporting service wired up.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-background flex items-center justify-center px-6">
        <div className="glass-card flex max-w-sm flex-col items-center gap-4 p-8 text-center">
          <AlertTriangle size={40} className="text-brand-coral-400" />
          <div>
            <h1 className="text-lg font-bold text-brand-sand">משהו נשבר</h1>
            <p className="mt-1 text-sm text-brand-sand/60">
              קרתה תקלה לא צפויה. רענון הדף בדרך כלל פותר את זה.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-amber-500 to-brand-coral-500 px-6 py-3.5 text-base font-bold text-brand-charcoal"
          >
            <RotateCcw size={18} />
            רענן את הדף
          </button>
        </div>
      </div>
    );
  }
}
