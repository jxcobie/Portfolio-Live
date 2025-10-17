'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ComponentError } from '@/app/types';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: ComponentError;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: ComponentError; reset: () => void }>;
  onError?: (error: ComponentError, errorInfo: ErrorInfo) => void;
}

const DefaultErrorFallback: React.FC<{ error: ComponentError; reset: () => void }> = ({
  error,
  reset,
}) => (
  <div className="error-boundary-fallback rounded-lg border border-red-500/20 bg-red-500/5 p-6">
    <div className="space-y-4 text-center">
      <div className="font-mono text-lg text-red-400">[ERROR_DETECTED]</div>
      <p className="text-sm text-gray-300">
        {error.message || 'Something went wrong in this section'}
      </p>
      <button
        onClick={reset}
        className="rounded border border-red-500/50 bg-red-500/20 px-4 py-2 font-mono text-sm text-red-300 transition-colors hover:bg-red-500/30"
        aria-label="Retry loading this section"
      >
        [ RETRY ]
      </button>
    </div>
  </div>
);

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        message: error.message,
        stack: error.stack,
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentError: ComponentError = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    };

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call onError prop if provided
    this.props.onError?.(componentError, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
