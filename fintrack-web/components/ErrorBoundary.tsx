"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <div className="max-w-md w-full space-y-4 text-center">
              <h2 className="text-3xl font-bold text-red-500">Algo salió mal</h2>
              <p className="text-gray-400">
                Hubo un error al cargar esta sección. Por favor, intenta recargar la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                Recargar Página
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
