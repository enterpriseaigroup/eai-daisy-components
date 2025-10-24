/**
 * ProtectedStageLayout - Configurator V2 Component
 *
 * Component ProtectedStageLayout from ProtectedStageLayout.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import { MSALProvider } from "@presentation/components/auth/MSALAuthProvider";
import { AuthProvider } from "../auth/AuthProvider";
import { ReactNode } from "react";

interface ProtectedStageLayoutProps {
  children: ReactNode;
  onAuthFailure?: () => void;
}

  /**
   * BUSINESS LOGIC: ProtectedStageLayout
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements ProtectedStageLayout logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
export function ProtectedStageLayout({ children, onAuthFailure }: ProtectedStageLayoutProps) {
  return (
    <MSALProvider>
      <AuthProvider onAuthFailure={onAuthFailure}>
        {children}
      </AuthProvider>
    </MSALProvider>
  );
}