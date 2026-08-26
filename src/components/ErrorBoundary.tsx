import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Film, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kollywood Connect Uncaught Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-cinema-border text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-display font-black text-white">
              Something went wrong
            </h2>
            
            <p className="text-xs text-cinema-muted leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred while loading the game arena.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleRetry}
                className="flex-1 py-3 rounded-2xl btn-cinema-primary text-black font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Game</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-2xl bg-cinema-surface hover:bg-cinema-cardHover border border-cinema-border text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
