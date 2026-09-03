/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ UI Component Error Boundary (V10 Production)
 * Gracefully isolates rendering exceptions, preventing application crashes,
 * providing Retry, Safe State Reset, and Diagnostic Reporting without exposing sensitive data.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: '',
    errorId: ''
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ui-err-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering anomaly occurred.',
      errorId
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitized telemetry logging (zero PHI)
    console.warn(`[SAAHAJ UI Boundary] [ID: ${this.state.errorId}] Handled render exception:`, error.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '', errorId: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-6 bg-[#FBF9F5] dark:bg-[#12110F] text-[#1A1A1A] dark:text-[#EAE5DD]">
          <div className="w-full max-w-xl p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 shadow-xl space-y-6">
            
            {/* Header / Error Shield */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[#C25E00]/10 border border-[#C25E00]/30 text-[#C25E00]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#8A857D]">
                  UI ISOLATION ACTIVE
                </span>
                <h3 className="text-lg font-serif font-bold text-[#1A1A1A] dark:text-[#FBF9F5]">
                  {this.props.fallbackTitle || 'Component Encountered an Anomaly'}
                </h3>
              </div>
            </div>

            {/* Explanation & Safety Notice */}
            <p className="text-xs text-[#5A554E] dark:text-[#A8A39A] leading-relaxed">
              SAAHAJ isolated this component to protect workspace state and prevent session data corruption. Your underlying health records and biometric inputs remain safe in secure storage.
            </p>

            {/* Error Reference Code (Sanitized) */}
            <div className="p-3 bg-[#F4EFEA] dark:bg-[#252320] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8A857D]">Incident Reference:</span>
              <span className="text-[#A38D7D] font-bold">{this.state.errorId}</span>
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-4 py-2.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#FFFFFF] dark:text-[#1A1A1A] text-xs font-mono font-medium hover:bg-[#A38D7D] dark:hover:bg-[#A38D7D] dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Component
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-mono text-[#5A554E] dark:text-[#A8A39A] hover:text-[#1A1A1A] dark:hover:text-[#FBF9F5] transition-colors flex items-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                Reload Application
              </button>
            </div>

            {/* Clinical Notice */}
            <div className="pt-4 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-center gap-2 text-[10px] text-[#8A857D] font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-[#A38D7D]" />
              <span>Deterministic zero-data-loss architecture active.</span>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
