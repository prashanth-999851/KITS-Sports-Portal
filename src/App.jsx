import React, { useState, useEffect, Component } from 'react';
import AppRouter from './router/AppRouter';
import { FONT_FAMILY } from './constants/fonts';
import { COLORS } from './constants/theme';

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
          fontFamily: FONT_FAMILY,
          backgroundColor: COLORS.surface.light,
          minHeight: '100vh',
          color: COLORS.brand.primary
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#DC2626' }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: '12px', fontSize: '14px', color: COLORS.text.secondary }}>
            The application encountered a runtime error. Please reload the page or contact the sports office if the issue continues.
          </p>
          {showTechnicalDetails && (
            <pre style={{
              padding: '16px',
              backgroundColor: COLORS.surface.darkCard,
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
              backgroundColor: COLORS.brand.secondary,
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
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
