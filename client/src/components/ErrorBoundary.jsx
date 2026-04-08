import { Component } from 'react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Oops!</h1>
            <p className="text-[var(--color-text)] mb-6">
              Something went wrong. Our team has been notified.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {this.state.error?.message}
              </p>
            </div>
            <Button onClick={this.handleReset}>
              Return Home
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
