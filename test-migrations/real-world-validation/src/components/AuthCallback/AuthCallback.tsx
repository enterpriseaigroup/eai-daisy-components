/**
 * AuthCallback - Configurator V2 Component
 *
 * Component AuthCallback from page.tsx
 *
 * @migrated from DAISY v1
 */

// app/auth/callback/page.tsx

// Use a single redirect URI (e.g. /auth/callback) and always return there
// In Azure Portal, add this to your list of redirect URIs: http://localhost:3000/auth/callback
// In your MSAL config: redirectUri: 'http://localhost:3000/auth/callback'


// 1. User clicks Login (or lands on /login)
// 2. Redirect to Microsoft Auth
// 3. After login → redirected back to /auth/callback
// 4. In /auth/callback:
//    - acquire token
//    - fetch profile
//    - handle org logic
//    - redirect to /dashboard (or original destination)

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIsAuthenticated } from '@azure/msal-react';
import { useTokenAndProfile } from '@presentation/hooks/useTokenAndProfile';

  /**
   * BUSINESS LOGIC: AuthCallback
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements AuthCallback logic
   * 2. Calls helper functions: useRouter, useIsAuthenticated, useSearchParams, decodeURIComponent, searchParams.entries, useTokenAndProfile, router.replace, console.error, router.replace, useEffect, refetch
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useRouter() - Function call
   * - useIsAuthenticated() - Function call
   * - useSearchParams() - Function call
   * - decodeURIComponent() - Function call
   * - searchParams.entries() - Function call
   * - useTokenAndProfile() - Function call
   * - router.replace() - Function call
   * - console.error() - Function call
   * - router.replace() - Function call
   * - useEffect() - Function call
   * - refetch() - Function call
   *
   * WHY IT CALLS THEM:
   * - useRouter: Required functionality
   * - useIsAuthenticated: Required functionality
   * - useSearchParams: Required functionality
   * - decodeURIComponent: Required functionality
   * - searchParams.entries: Required functionality
   * - useTokenAndProfile: State update
   * - router.replace: Required functionality
   * - console.error: Error logging
   * - router.replace: Required functionality
   * - useEffect: Required functionality
   * - refetch: Data fetching
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useRouter, useIsAuthenticated, useSearchParams to process data
   * Output: Computed value or side effect
   *
   */
export default function AuthCallback() {
    const router = useRouter();
    const isAuthenticated = useIsAuthenticated();
    const searchParams = useSearchParams();

    const queryParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
        queryParams[key] = decodeURIComponent(value);
    }

    const { refetch } = useTokenAndProfile({
            autoFetch: true,
            queryParams,
            onProfileFetched: () => {
            router.replace('/dashboard');
        },
        onError: (err) => {
            console.error('Error completing login:', err);
            router.replace('/login');
        },
    });

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors isAuthenticated, refetch for changes
       * 2. Executes refetch functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - refetch() - Function call
       *
       * WHY IT CALLS THEM:
       * - refetch: Data fetching
       *
       * DATA FLOW:
       * Input: isAuthenticated, refetch state/props
       * Processing: Calls refetch to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - isAuthenticated: Triggers when isAuthenticated changes
       * - refetch: Triggers when refetch changes
       *
       */
    useEffect(() => {
        if (isAuthenticated) {
        refetch();
        }
    }, [isAuthenticated, refetch]);

    return (
        <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Finishing login process...</p>
        </div>
    );
}