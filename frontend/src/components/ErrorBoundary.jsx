/**
 * ErrorBoundary — Catches render errors and shows a branded error page.
 * Without this, any component crash shows a blank white screen.
 */
import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    fetch('http://localhost:5000/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error?.message || String(error),
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(err => console.error('Failed to log error to backend:', err));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#f7f6f0] min-h-screen flex items-center justify-center font-body px-6">
          <div className="bg-white border border-brand-border p-8 md:p-12 max-w-md text-center shadow-md">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="serif-title text-2xl text-brand-charcoal mb-4 uppercase">
              Something Went Wrong
            </h1>
            <p className="text-brand-muted text-sm leading-relaxed mb-8">
              We apologize for the inconvenience. Please try refreshing the page or navigate back to the home page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-brand-charcoal text-white hover:bg-brand-button-hover px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white px-6 py-3 font-heading font-bold text-xs uppercase tracking-widest transition-all text-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
