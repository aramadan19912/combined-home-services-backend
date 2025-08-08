import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Bug, AlertTriangle, Home } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    this.props.onError?.(error, errorInfo);

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/errors/boundary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (err) {
      console.error('Failed to log error to service:', err);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Bug className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {this.state.error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded overflow-auto max-h-40 mt-2">
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                If this problem persists, please contact support with the error details above.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component that uses the error handler hook
const ErrorBoundary: React.FC<Props> = ({ children, fallback, onError }) => {
  const { logError } = useErrorHandler();

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logError(error, errorInfo.componentStack);
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundaryClass fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;