/**
 * DashboardPage - Configurator V2 Component
 *
 * Component DashboardPage from page.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import { useState, useEffect } from 'react';
import { StageManager } from "@presentation/components/dashboard/StageManager";
import Header from "@presentation/components/Headers/Header/Header";
import { LoginLoader } from "@presentation/components/loader/LoginLoader";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@presentation/hooks/useDashboard";
import { useIsAuthenticated } from '@azure/msal-react';
import { useProfileStore } from '@presentation/store/useProfileStore';
import { useRouter, useSearchParams } from 'next/navigation';

  /**
   * BUSINESS LOGIC: DashboardPage
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DashboardPage logic
   * 2. Calls helper functions: useDashboard, useIsAuthenticated, useProfileStore, useRouter, useSearchParams, useState, searchParams.get, useEffect, console.log, console.log, console.log, console.log, console.log, searchParams.get, sessionStorage.getItem, console.log, console.log, console.log, console.log, console.log, router.push, setIsRedirecting, console.log, console.log, router.push, setIsRedirecting, console.log, useEffect, sessionStorage.getItem, sessionStorage.removeItem, console.log
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useDashboard() - Function call
   * - useIsAuthenticated() - Function call
   * - useProfileStore() - Function call
   * - useRouter() - Function call
   * - useSearchParams() - Function call
   * - useState() - Function call
   * - searchParams.get() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - searchParams.get() - Function call
   * - sessionStorage.getItem() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - router.push() - Function call
   * - setIsRedirecting() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - router.push() - Function call
   * - setIsRedirecting() - Function call
   * - console.log() - Function call
   * - useEffect() - Function call
   * - sessionStorage.getItem() - Function call
   * - sessionStorage.removeItem() - Function call
   * - console.log() - Function call
   *
   * WHY IT CALLS THEM:
   * - useDashboard: Required functionality
   * - useIsAuthenticated: Required functionality
   * - useProfileStore: Required functionality
   * - useRouter: Required functionality
   * - useSearchParams: Required functionality
   * - useState: Required functionality
   * - searchParams.get: Required functionality
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - searchParams.get: Required functionality
   * - sessionStorage.getItem: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - router.push: Required functionality
   * - setIsRedirecting: State update
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - router.push: Required functionality
   * - setIsRedirecting: State update
   * - console.log: Debugging output
   * - useEffect: Required functionality
   * - sessionStorage.getItem: Required functionality
   * - sessionStorage.removeItem: Required functionality
   * - console.log: Debugging output
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useDashboard, useIsAuthenticated, useProfileStore to process data
   * Output: Computed value or side effect
   *
   */
export default function DashboardPage() {
  const { isLoading, error } = useDashboard();
  const isAuthenticated = useIsAuthenticated();
  const { profileData } = useProfileStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isCouncilPortal = searchParams?.get('councilPortal') === 'true';
  const profileReady = profileData?.id !== 'AnonymousUser';

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors isAuthenticated, profileData, isCouncilPortal, router, searchParams for changes
     * 2. Executes console.log, console.log, console.log, console.log, console.log, searchParams.get, sessionStorage.getItem, console.log, console.log, console.log, console.log, console.log, router.push, setIsRedirecting, console.log, console.log, router.push, setIsRedirecting, console.log functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - console.log() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - searchParams.get() - Function call
     * - sessionStorage.getItem() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - router.push() - Function call
     * - setIsRedirecting() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - router.push() - Function call
     * - setIsRedirecting() - Function call
     * - console.log() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - searchParams.get: Required functionality
     * - sessionStorage.getItem: Required functionality
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - router.push: Required functionality
     * - setIsRedirecting: State update
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - router.push: Required functionality
     * - setIsRedirecting: State update
     * - console.log: Debugging output
     *
     * DATA FLOW:
     * Input: isAuthenticated, profileData, isCouncilPortal, router, searchParams state/props
     * Processing: Calls console.log, console.log, console.log to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - isAuthenticated: Triggers when isAuthenticated changes
     * - profileData: Triggers when profileData changes
     * - isCouncilPortal: Triggers when isCouncilPortal changes
     * - router: Triggers when router changes
     * - searchParams: Triggers when searchParams changes
     *
     */
  useEffect(() => {
    // Don’t run redirect logic until profile is hydrated
    const profileReady = profileData?.id !== 'AnonymousUser';
    if (!profileReady) {
      console.log("⏳ Waiting for profile to hydrate...");
      return;
    }
    console.log("[🔍 Redirect Evaluation]");
    console.log("→ isAuthenticated:", isAuthenticated);
    console.log("→ isCouncilPortal:", isCouncilPortal);
    console.log("→ profileData:", profileData);
    const missingProfile = !profileData?.user_config;
    const missingOrgId = !profileData?.user_config?.org_id;
    const fromSwitchCouncil =
      searchParams?.get('fromSwitch') === 'true' ||
      (typeof window !== 'undefined' && sessionStorage.getItem("hasCompletedSwitch") === 'true');
    const hasCurrentOrgId = profileData?.current_org_id;
    console.log("→ missingProfile:", missingProfile);
    console.log("→ missingOrgId:", missingOrgId);
    console.log("→ current_org_id:", profileData?.current_org_id);
    console.log("→ fromSwitchCouncil:", fromSwitchCouncil);
    if (!isCouncilPortal && (!isAuthenticated || missingProfile)) {
      console.log("🚨 Redirecting unauthenticated user to home");
      router.push('/');
      setIsRedirecting(true);
      return;
    }
    if (
      !isCouncilPortal &&
      isAuthenticated &&
      !missingProfile &&
      missingOrgId &&
      !hasCurrentOrgId
    ) {
      if (!fromSwitchCouncil) {
        console.log("🧭 First-time user → Redirecting to switch-council");
        router.push('/switch-council');
        setIsRedirecting(true);
      } else {
        console.log("✅ Returning from switch-council → allow dashboard load");
      }
      return;
    }
    if (hasCurrentOrgId && !missingProfile && isAuthenticated) {
      console.log("✅ User has org_id → Allow dashboard access");
    }
  }, [isAuthenticated, profileData, isCouncilPortal, router, searchParams]);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Executes sessionStorage.getItem, sessionStorage.removeItem, console.log functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - sessionStorage.getItem() - Function call
     * - sessionStorage.removeItem() - Function call
     * - console.log() - Function call
     *
     * WHY IT CALLS THEM:
     * - sessionStorage.getItem: Required functionality
     * - sessionStorage.removeItem: Required functionality
     * - console.log: Debugging output
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls sessionStorage.getItem, sessionStorage.removeItem, console.log to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const flag = sessionStorage.getItem("hasCompletedSwitch");
      if (flag === 'true') {
        sessionStorage.removeItem("hasCompletedSwitch");
        console.log("🧹 Cleared hasCompletedSwitch from sessionStorage");
      }
    }
  }, []);

  if ((isLoading || isRedirecting || (isAuthenticated && !profileReady))) {
    return <LoginLoader />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-red-500">
            Authentication error
          </p>
          <Button
            variant="link"
            onClick={() => window.location.href = "/"}
            className="text-blue-500 hover:underline"
          >
            Please Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      <Header />
      <main className="flex-1 overflow-hidden">
        <StageManager />
      </main>
    </div>
  );
}