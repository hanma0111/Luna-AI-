import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  onDebug: (error: Error, errorInfo: ErrorInfo) => void;
  onReset: () => void;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  
  handleReset = () => {
    this.props.onReset();
    this.setState({ error: null, errorInfo: null });
  }

  handleDebug = () => {
    if (this.state.error && this.state.errorInfo) {
      this.props.onDebug(this.state.error, this.state.errorInfo);
      this.setState({ error: null, errorInfo: null });
    }
  }

  public render() {
    if (this.state.error && this.state.errorInfo) {
      // You can render any custom fallback UI
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onDebug={this.handleDebug}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}