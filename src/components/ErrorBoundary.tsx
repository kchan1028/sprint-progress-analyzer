import { Component, type ErrorInfo, type ReactNode } from 'react';
import { csvJiraService } from '../services/jira';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level catch for unexpected render errors, so a component tripped up by
 * unusual imported data shows a recovery screen instead of a blank page.
 * "Reset to demo data" swaps the in-memory import for the bundled demo sprint
 * (imports are memory-only, so nothing stored is lost) and renders again.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // No error reporting service: log locally so the cause is visible in dev tools.
    console.error('Sprint Progress Analyzer render error', error, info.componentStack);
  }

  handleReset = () => {
    csvJiraService.resetToDemoData();
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="section">
        <div className="card" role="alert">
          <h1 className="section__heading">Something went wrong showing this sprint</h1>
          <p className="section__subheading">
            The page hit an unexpected error, often caused by unusual values in an imported file. Your CSV
            was never uploaded anywhere. Reset to the demo sprint to continue, then try the import again or
            check the file.
          </p>
          <button type="button" className="filter-button filter-button--active" onClick={this.handleReset}>
            Reset to demo data
          </button>
        </div>
      </main>
    );
  }
}
