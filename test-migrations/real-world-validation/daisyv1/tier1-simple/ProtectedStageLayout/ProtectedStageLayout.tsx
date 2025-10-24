'use client';

import { MSALProvider } from "@presentation/components/auth/MSALAuthProvider";
import { AuthProvider } from "../auth/AuthProvider";
import { ReactNode } from "react";

interface ProtectedStageLayoutProps {
  children: ReactNode;
  onAuthFailure?: () => void;
}

export function ProtectedStageLayout({ children, onAuthFailure }: ProtectedStageLayoutProps) {
  return (
    <MSALProvider>
      <AuthProvider onAuthFailure={onAuthFailure}>
        {children}
      </AuthProvider>
    </MSALProvider>
  );
}