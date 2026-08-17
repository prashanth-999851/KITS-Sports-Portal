import React, { useState, useEffect, Component } from 'react';
import AppRouter from './router/AppRouter';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    const showTechnicalDetails = import.meta.env.DEV;

    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundColor: '#F8FAFC',
          minHeight: '100vh',
          color: '#0F172A'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#DC2626' }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: '#475569' }}>
            The application encountered a runtime error. Please reload the page or contact the sports office if the issue continues.
          </p>
          {showTechnicalDetails && (
            <pre style={{
              padding: '16px',
              backgroundColor: '#1E293B',
              color: '#F87171',
              borderRadius: '8px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '300px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error && this.state.error.toString()}
              {'\n\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              backgroundColor: '#1E3A8A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <AppRouter darkMode={darkMode} setDarkMode={setDarkMode} />
    </ErrorBoundary>
  );
}
