/**
 * LogoutPage - Configurator V2 Component
 *
 * Component LogoutPage from page.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMsalInstance } from '@/app/(presentation)/components/auth/config';
import { resetForLogout } from '@/app/(presentation)/store/utils/sessionUtils';

  /**
   * BUSINESS LOGIC: LogoutPage
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements LogoutPage logic
   * 2. Calls helper functions: useRouter, useSearchParams, useEffect, searchParams.get, console.warn, router.replace, console.log, resetForLogout, sessionStorage.clear, localStorage.clear, getMsalInstance, msalInstance.logoutRedirect, console.error, router.replace, logout
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useRouter() - Function call
   * - useSearchParams() - Function call
   * - useEffect() - Function call
   * - searchParams.get() - Function call
   * - console.warn() - Function call
   * - router.replace() - Function call
   * - console.log() - Function call
   * - resetForLogout() - Function call
   * - sessionStorage.clear() - Function call
   * - localStorage.clear() - Function call
   * - getMsalInstance() - Function call
   * - msalInstance.logoutRedirect() - Function call
   * - console.error() - Function call
   * - router.replace() - Function call
   * - logout() - Function call
   *
   * WHY IT CALLS THEM:
   * - useRouter: Required functionality
   * - useSearchParams: Required functionality
   * - useEffect: Required functionality
   * - searchParams.get: Required functionality
   * - console.warn: Warning notification
   * - router.replace: Required functionality
   * - console.log: Debugging output
   * - resetForLogout: State update
   * - sessionStorage.clear: Required functionality
   * - localStorage.clear: Required functionality
   * - getMsalInstance: Required functionality
   * - msalInstance.logoutRedirect: Required functionality
   * - console.error: Error logging
   * - router.replace: Required functionality
   * - logout: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useRouter, useSearchParams, useEffect to process data
   * Output: Computed value or side effect
   *
   */
export default function LogoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors router, searchParams for changes
       * 2. Executes searchParams.get, console.warn, router.replace, console.log, resetForLogout, sessionStorage.clear, localStorage.clear, getMsalInstance, msalInstance.logoutRedirect, console.error, router.replace, logout functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - searchParams.get() - Function call
       * - console.warn() - Function call
       * - router.replace() - Function call
       * - console.log() - Function call
       * - resetForLogout() - Function call
       * - sessionStorage.clear() - Function call
       * - localStorage.clear() - Function call
       * - getMsalInstance() - Function call
       * - msalInstance.logoutRedirect() - Function call
       * - console.error() - Function call
       * - router.replace() - Function call
       * - logout() - Function call
       *
       * WHY IT CALLS THEM:
       * - searchParams.get: Required functionality
       * - console.warn: Warning notification
       * - router.replace: Required functionality
       * - console.log: Debugging output
       * - resetForLogout: State update
       * - sessionStorage.clear: Required functionality
       * - localStorage.clear: Required functionality
       * - getMsalInstance: Required functionality
       * - msalInstance.logoutRedirect: Required functionality
       * - console.error: Error logging
       * - router.replace: Required functionality
       * - logout: Required functionality
       *
       * DATA FLOW:
       * Input: router, searchParams state/props
       * Processing: Calls searchParams.get, console.warn, router.replace to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - router: Triggers when router changes
       * - searchParams: Triggers when searchParams changes
       *
       */
    useEffect(() => {
          /**
           * BUSINESS LOGIC: logout
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements logout logic
           * 2. Calls helper functions: searchParams.get, console.warn, router.replace, console.log, resetForLogout, sessionStorage.clear, localStorage.clear, getMsalInstance, msalInstance.logoutRedirect, console.error, router.replace
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - searchParams.get() - Function call
           * - console.warn() - Function call
           * - router.replace() - Function call
           * - console.log() - Function call
           * - resetForLogout() - Function call
           * - sessionStorage.clear() - Function call
           * - localStorage.clear() - Function call
           * - getMsalInstance() - Function call
           * - msalInstance.logoutRedirect() - Function call
           * - console.error() - Function call
           * - router.replace() - Function call
           *
           * WHY IT CALLS THEM:
           * - searchParams.get: Required functionality
           * - console.warn: Warning notification
           * - router.replace: Required functionality
           * - console.log: Debugging output
           * - resetForLogout: State update
           * - sessionStorage.clear: Required functionality
           * - localStorage.clear: Required functionality
           * - getMsalInstance: Required functionality
           * - msalInstance.logoutRedirect: Required functionality
           * - console.error: Error logging
           * - router.replace: Required functionality
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls searchParams.get, console.warn, router.replace to process data
           * Output: Computed value or side effect
           *
           */
        const logout = async () => {
            const internal = searchParams.get('internal');
            if (internal !== 'true') {
                console.warn('[LogoutPage] Unauthorized logout attempt. Redirecting...');
                router.replace('/');
                return;
            }
            console.log('[LogoutPage] Running logout logic...');
            try {
                // 1. Reset in-memory stores (Zustand etc)
                resetForLogout();
                // 2. Clear browser storage
                sessionStorage.clear();
                localStorage.clear();
                // 3. Trigger MSAL logout redirect
                const msalInstance = getMsalInstance();
                await msalInstance.logoutRedirect();
            } catch (err) {
                console.error('[LogoutPage] Logout failed:', err);
                router.replace('/');
            }
        };
        logout();
    }, [router, searchParams]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
            <div className="text-center">
                <div className="inline-block w-20 h-20 mb-4 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                <p className="mt-4 font-semibold text-gray-600 text-[14px] font-geist">
                Logging you out...
                </p>
            </div>
        </div>
    );
}