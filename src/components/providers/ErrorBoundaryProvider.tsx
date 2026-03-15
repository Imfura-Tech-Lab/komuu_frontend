"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: Error) => {
    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error);
    console.error("Application error:", error);
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
