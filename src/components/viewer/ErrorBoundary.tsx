import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: unknown) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * React todavía no tiene un hook para esto: una carga de GLTF fallida se
 * propaga como error de render dentro del Suspense, y solo un boundary de
 * clase puede atraparla.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
