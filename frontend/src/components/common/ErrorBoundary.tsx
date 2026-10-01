import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 text-center shadow-lg animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-900">
              <span className="material-symbols-outlined text-[28px]">refresh</span>
            </div>
            <h2 className="text-xl font-black text-zinc-950 mb-2">Something went sideways</h2>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              We encountered an unexpected display glitch. Don't worry, your cart and session data are safely preserved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-5 rounded-2xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all active:scale-95"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                className="flex-1 py-3 px-5 rounded-2xl border border-zinc-200 bg-white text-zinc-800 font-bold text-xs hover:bg-zinc-50 transition-all active:scale-95"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
