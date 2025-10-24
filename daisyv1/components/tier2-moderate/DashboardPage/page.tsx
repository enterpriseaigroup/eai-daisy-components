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

export default function DashboardPage() {
  const { isLoading, error } = useDashboard();
  const isAuthenticated = useIsAuthenticated();
  const { profileData } = useProfileStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isCouncilPortal = searchParams?.get('councilPortal') === 'true';
  const profileReady = profileData?.id !== 'AnonymousUser';

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