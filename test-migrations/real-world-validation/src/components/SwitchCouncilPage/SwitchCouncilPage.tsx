/**
 * SwitchCouncilPage - Configurator V2 Component
 *
 * Component SwitchCouncilPage from page.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
import Header from "@presentation/components/Headers/Header/Header";
import { useUpdateOrgId } from "../../hooks/useUpdateOrgId";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
import { LoginLoader } from "../../components/loader/LoginLoader";
import { getParsedCouncilMappings } from "../../constants/councilMappings";
import { resetForCouncilSwitch } from "../../store/utils/sessionUtils";
import { useProfileData } from "../../hooks/useProfileData";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Ensure hydration before Zustand access
  /**
   * BUSINESS LOGIC: useHasHydrated
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useHasHydrated logic
   * 2. Calls helper functions: useState, useEffect, setHasHydrated
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useEffect() - Function call
   * - setHasHydrated() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useEffect: Required functionality
   * - setHasHydrated: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useEffect, setHasHydrated to process data
   * Output: Computed value or side effect
   *
   */
const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Executes setHasHydrated functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setHasHydrated() - Function call
     *
     * WHY IT CALLS THEM:
     * - setHasHydrated: State update
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls setHasHydrated to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
};

  /**
   * BUSINESS LOGIC: SwitchCouncilPage
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements SwitchCouncilPage logic
   * 2. Calls helper functions: useHasHydrated, useAuthStore, useState, useUpdateOrgId, useProfileData, useRouter, useState, useState, useState, useState, useRef, useEffect, setIsLoading, fetchUserProfile.mutate, Array.isArray, Boolean, setIsFirstTimeUser, .filter, historicIds.map, console.log, councilMappings.map, councilList.sort, LIVE_COUNCILS.includes, LIVE_COUNCILS.includes, a.localeCompare, console.log, setLocalOrgContext, setCouncils, setIsLoading, console.error, setIsLoading, useMemo, getParsedCouncilMappings, useMemo, councilMappings.reduce, useMemo, councilMappings.find, console.log, .back, setIsLoading, updateOrgId.mutate, fetchUserProfile.mutate, resetForCouncilSwitch, sessionStorage.setItem, sessionStorage.setItem, console.error, router.push, console.error, setIsLoading, councils.map, councilMappings.find, LIVE_COUNCILS.includes, e.preventDefault, handleSave
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useHasHydrated() - Function call
   * - useAuthStore() - Function call
   * - useState() - Function call
   * - useUpdateOrgId() - Function call
   * - useProfileData() - Function call
   * - useRouter() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useRef() - Function call
   * - useEffect() - Function call
   * - setIsLoading() - Function call
   * - fetchUserProfile.mutate() - Function call
   * - Array.isArray() - Function call
   * - Boolean() - Function call
   * - setIsFirstTimeUser() - Function call
   * - .filter() - Function call
   * - historicIds.map() - Function call
   * - console.log() - Function call
   * - councilMappings.map() - Function call
   * - councilList.sort() - Function call
   * - LIVE_COUNCILS.includes() - Function call
   * - LIVE_COUNCILS.includes() - Function call
   * - a.localeCompare() - Function call
   * - console.log() - Function call
   * - setLocalOrgContext() - Function call
   * - setCouncils() - Function call
   * - setIsLoading() - Function call
   * - console.error() - Function call
   * - setIsLoading() - Function call
   * - useMemo() - Function call
   * - getParsedCouncilMappings() - Function call
   * - useMemo() - Function call
   * - councilMappings.reduce() - Function call
   * - useMemo() - Function call
   * - councilMappings.find() - Function call
   * - console.log() - Function call
   * - .back() - Function call
   * - setIsLoading() - Function call
   * - updateOrgId.mutate() - Function call
   * - fetchUserProfile.mutate() - Function call
   * - resetForCouncilSwitch() - Function call
   * - sessionStorage.setItem() - Function call
   * - sessionStorage.setItem() - Function call
   * - console.error() - Function call
   * - router.push() - Function call
   * - console.error() - Function call
   * - setIsLoading() - Function call
   * - councils.map() - Function call
   * - councilMappings.find() - Function call
   * - LIVE_COUNCILS.includes() - Function call
   * - e.preventDefault() - Function call
   * - handleSave() - Function call
   *
   * WHY IT CALLS THEM:
   * - useHasHydrated: Required functionality
   * - useAuthStore: Required functionality
   * - useState: Required functionality
   * - useUpdateOrgId: Required functionality
   * - useProfileData: Required functionality
   * - useRouter: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useRef: Required functionality
   * - useEffect: Required functionality
   * - setIsLoading: State update
   * - fetchUserProfile.mutate: Data fetching
   * - Array.isArray: Required functionality
   * - Boolean: Required functionality
   * - setIsFirstTimeUser: State update
   * - .filter: Required functionality
   * - historicIds.map: Required functionality
   * - console.log: Debugging output
   * - councilMappings.map: Required functionality
   * - councilList.sort: Required functionality
   * - LIVE_COUNCILS.includes: Required functionality
   * - LIVE_COUNCILS.includes: Required functionality
   * - a.localeCompare: Required functionality
   * - console.log: Debugging output
   * - setLocalOrgContext: State update
   * - setCouncils: State update
   * - setIsLoading: State update
   * - console.error: Error logging
   * - setIsLoading: State update
   * - useMemo: Required functionality
   * - getParsedCouncilMappings: Required functionality
   * - useMemo: Required functionality
   * - councilMappings.reduce: Required functionality
   * - useMemo: Required functionality
   * - councilMappings.find: Required functionality
   * - console.log: Debugging output
   * - .back: Required functionality
   * - setIsLoading: State update
   * - updateOrgId.mutate: Required functionality
   * - fetchUserProfile.mutate: Data fetching
   * - resetForCouncilSwitch: State update
   * - sessionStorage.setItem: State update
   * - sessionStorage.setItem: State update
   * - console.error: Error logging
   * - router.push: Required functionality
   * - console.error: Error logging
   * - setIsLoading: State update
   * - councils.map: Required functionality
   * - councilMappings.find: Required functionality
   * - LIVE_COUNCILS.includes: Required functionality
   * - e.preventDefault: Required functionality
   * - handleSave: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useHasHydrated, useAuthStore, useState to process data
   * Output: Computed value or side effect
   *
   */
export default function SwitchCouncilPage() {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((state) => state.accessToken);
  const [localOrgContext, setLocalOrgContext] = useState<{
    current_org_id: string;
    historic_org_ids: string[];
  } | null>(null);
  const { updateOrgId } = useUpdateOrgId();
  const { fetchUserProfile } = useProfileData();
  const router = useRouter();
  const [councils, setCouncils] = useState<string[]>([]);
  const [selectedCouncilName, setSelectedCouncilName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false); // NEW: Track if user is selecting for first time
  const hasFetchedProfileRef = useRef(false);
  const LIVE_COUNCILS = [
    "Wingecarribee Shire Council",
    "Cumberland City Council",
    "Blacktown City Council"
    // Add more councils here when they go live
  ];

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors token, hasHydrated, fetchUserProfile for changes
     * 2. Executes setIsLoading, fetchUserProfile.mutate, Array.isArray, Boolean, setIsFirstTimeUser, .filter, historicIds.map, console.log, councilMappings.map, councilList.sort, LIVE_COUNCILS.includes, LIVE_COUNCILS.includes, a.localeCompare, console.log, setLocalOrgContext, setCouncils, setIsLoading, console.error, setIsLoading functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setIsLoading() - Function call
     * - fetchUserProfile.mutate() - Function call
     * - Array.isArray() - Function call
     * - Boolean() - Function call
     * - setIsFirstTimeUser() - Function call
     * - .filter() - Function call
     * - historicIds.map() - Function call
     * - console.log() - Function call
     * - councilMappings.map() - Function call
     * - councilList.sort() - Function call
     * - LIVE_COUNCILS.includes() - Function call
     * - LIVE_COUNCILS.includes() - Function call
     * - a.localeCompare() - Function call
     * - console.log() - Function call
     * - setLocalOrgContext() - Function call
     * - setCouncils() - Function call
     * - setIsLoading() - Function call
     * - console.error() - Function call
     * - setIsLoading() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsLoading: State update
     * - fetchUserProfile.mutate: Data fetching
     * - Array.isArray: Required functionality
     * - Boolean: Required functionality
     * - setIsFirstTimeUser: State update
     * - .filter: Required functionality
     * - historicIds.map: Required functionality
     * - console.log: Debugging output
     * - councilMappings.map: Required functionality
     * - councilList.sort: Required functionality
     * - LIVE_COUNCILS.includes: Required functionality
     * - LIVE_COUNCILS.includes: Required functionality
     * - a.localeCompare: Required functionality
     * - console.log: Debugging output
     * - setLocalOrgContext: State update
     * - setCouncils: State update
     * - setIsLoading: State update
     * - console.error: Error logging
     * - setIsLoading: State update
     *
     * DATA FLOW:
     * Input: token, hasHydrated, fetchUserProfile state/props
     * Processing: Calls setIsLoading, fetchUserProfile.mutate, Array.isArray to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - token: Triggers when token changes
     * - hasHydrated: Triggers when hasHydrated changes
     * - fetchUserProfile: Triggers when fetchUserProfile changes
     *
     */
  useEffect(() => {
    if (!token || hasFetchedProfileRef.current || !hasHydrated) return;
    hasFetchedProfileRef.current = true;
    setIsLoading(true);
    fetchUserProfile.mutate(
      { token },
      {
        onSuccess: (data) => {
          const historicIds = Array.isArray(data.historic_org_ids) ? data.historic_org_ids : [];
          const hasHistoric = historicIds.length > 0;
          const hasCurrentOrg = Boolean(data.current_org_id);
          // NEW: Determine if this is a first-time user (no current_org_id and no historic_org_ids)
          const isFirstTime = !hasCurrentOrg && !hasHistoric;
          setIsFirstTimeUser(isFirstTime);
          let councilList: string[];
          if (isFirstTime) {
            // NEW: Show all available councils for first-time users
            // Show all councils, sorted with live ones first
              councilList = councilMappings.map((c) => c.name);
              // Sort: LIVE councils first, then alphabetically
              councilList = councilList.sort((a, b) => {
                const aIsLive = LIVE_COUNCILS.includes(a);
                const bIsLive = LIVE_COUNCILS.includes(b);
                if (aIsLive === bIsLive) return a.localeCompare(b); // fallback alpha
                return aIsLive ? -1 : 1;
              });
            console.log("🆕 First-time user - showing all councils:", councilList);
          } else {
            // Existing logic: Show historic councils if available
            councilList = historicIds.map((id) => councilMap[id]).filter(Boolean);
            console.log("📋 Historic councils found:", councilList);
          }
          setLocalOrgContext({
            current_org_id: data.current_org_id ?? '',
            historic_org_ids: historicIds,
          });
          setCouncils(councilList);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error("❌ Failed to fetch profile:", error);
          setIsLoading(false);
        },
      }
    );
  }, [token, hasHydrated, fetchUserProfile]);

    /**
     * BUSINESS LOGIC: councilMappings
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * WHAT IT CALLS:
     * - getParsedCouncilMappings() - Function call
     *
     * WHY IT CALLS THEM:
     * - getParsedCouncilMappings: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls getParsedCouncilMappings to process data
     * Output: Computed value or side effect
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const councilMappings = useMemo(() => getParsedCouncilMappings(), []);
    /**
     * BUSINESS LOGIC: councilMap
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * WHAT IT CALLS:
     * - councilMappings.reduce() - Function call
     *
     * WHY IT CALLS THEM:
     * - councilMappings.reduce: Required functionality
     *
     * DATA FLOW:
     * Input: councilMappings state/props
     * Processing: Calls councilMappings.reduce to process data
     * Output: Computed value or side effect
     *
     * DEPENDENCIES:
     * - councilMappings: Triggers when councilMappings changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const councilMap = useMemo(() => {
    return councilMappings.reduce((acc, council) => {
      acc[council.entra_id] = council.name;
      return acc;
    }, {} as Record<string, string>);
  }, [councilMappings]);

    /**
     * BUSINESS LOGIC: selectedCouncil
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * WHAT IT CALLS:
     * - councilMappings.find() - Function call
     *
     * WHY IT CALLS THEM:
     * - councilMappings.find: Required functionality
     *
     * DATA FLOW:
     * Input: selectedCouncilName, councilMappings state/props
     * Processing: Calls councilMappings.find to process data
     * Output: Computed value or side effect
     *
     * DEPENDENCIES:
     * - selectedCouncilName: Triggers when selectedCouncilName changes
     * - councilMappings: Triggers when councilMappings changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const selectedCouncil = useMemo(() => {
    return councilMappings.find((c) => c.name === selectedCouncilName);
  }, [selectedCouncilName, councilMappings]);

    /**
     * BUSINESS LOGIC: handleCancel
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements handleCancel logic
     * 2. Calls helper functions: console.log, .back
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - console.log() - Function call
     * - .back() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.log: Debugging output
     * - .back: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls console.log, .back to process data
     * Output: Computed value or side effect
     *
     */
  const handleCancel = () => {
    if (isFirstTimeUser) {
      // NEW: For first-time users, they can't go back without selecting a council
      // Could redirect to logout or show a warning
      console.log("⚠️ First-time user trying to cancel - council selection required");
      return;
    }
    window.history.back();
  };

    /**
     * BUSINESS LOGIC: handleSave
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements handleSave logic
     * 2. Calls helper functions: setIsLoading, updateOrgId.mutate, fetchUserProfile.mutate, resetForCouncilSwitch, sessionStorage.setItem, sessionStorage.setItem, console.error, router.push, console.error, setIsLoading
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - setIsLoading() - Function call
     * - updateOrgId.mutate() - Function call
     * - fetchUserProfile.mutate() - Function call
     * - resetForCouncilSwitch() - Function call
     * - sessionStorage.setItem() - Function call
     * - sessionStorage.setItem() - Function call
     * - console.error() - Function call
     * - router.push() - Function call
     * - console.error() - Function call
     * - setIsLoading() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsLoading: State update
     * - updateOrgId.mutate: Required functionality
     * - fetchUserProfile.mutate: Data fetching
     * - resetForCouncilSwitch: State update
     * - sessionStorage.setItem: State update
     * - sessionStorage.setItem: State update
     * - console.error: Error logging
     * - router.push: Required functionality
     * - console.error: Error logging
     * - setIsLoading: State update
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls setIsLoading, updateOrgId.mutate, fetchUserProfile.mutate to process data
     * Output: Computed value or side effect
     *
     */
  const handleSave = () => {
    if (!token || !selectedCouncil?.entra_id) return;
    setIsLoading(true);
    updateOrgId.mutate(
      { token, orgId: selectedCouncil.entra_id },
      {
        onSuccess: () => {
          fetchUserProfile.mutate(
            { token },
            {
              onSuccess: () => {
                resetForCouncilSwitch();
                if (isFirstTimeUser) {
                  sessionStorage.setItem("hasCompletedSwitch", "true");
                  window.location.href = "/dashboard?fromSwitch=true";
                } else {
                  sessionStorage.setItem("hasCompletedSwitch", "true");
                  window.location.href = "/dashboard";
                }
              },
              onError: (err) => {
                console.error("❌ Profile fetch after org update failed", err);
                router.push("/dashboard");
              },
            }
          );
        },
        onError: (err) => {
          console.error("❌ Failed to update org ID:", err);
          setIsLoading(false);
        },
      }
    );
  };

  if (!hasHydrated || isLoading || !token) return <LoginLoader />;

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen bg-muted">
        <div className="flex items-start justify-center flex-1 px-4 pt-6">
          <Card className="w-[700px] border shadow-sm bg-background my-0 rounded">
            <CardHeader className="pb-0">
              <CardTitle className="font-sans text-2xl font-semibold leading-loose tracking-wide text-foreground">
                {isFirstTimeUser ? "Welcome! Choose your council" : "Choose your council"}
              </CardTitle>
              {isFirstTimeUser && (
                <p className="text-sm text-muted-foreground">
                  Please select your council to get started with DAISY.
                </p>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="flex flex-col gap-6"
              >
                <div className="grid gap-2">
                  <label
                    htmlFor="council"
                    className="text-sm font-medium font-sans leading-[14px] text-foreground"
                  >
                    Your council
                  </label>
                  <Select
                    onValueChange={setSelectedCouncilName}
                    value={selectedCouncilName}
                    required
                  >
                    <SelectTrigger className="w-full h-10 font-sans text-sm font-normal leading-tight text-foreground">
                      <SelectValue placeholder="Select a council..." />
                    </SelectTrigger>
                    <SelectContent>
                      {councils.map((council) => {
                        const matching = councilMappings.find((c) => c.name === council);
                        const isCurrent = matching?.entra_id === localOrgContext?.current_org_id;
                        const isLive = LIVE_COUNCILS.includes(council);
                        // Disable if: 
                        // 1. Not live AND first time user, OR
                        // 2. Is current council (for existing users)
                        const isDisabled = (!isLive && isFirstTimeUser) || (isCurrent && !isFirstTimeUser);
                        return (
                          <SelectItem
                            key={council}
                            value={council}
                            disabled={isDisabled}
                          >
                            {council}
                            {!isLive && isFirstTimeUser && " (Coming soon)"}
                            {isCurrent && !isFirstTimeUser && " (Current)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  {!isFirstTimeUser && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={!selectedCouncil}>
                    {isFirstTimeUser ? "Get started" : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}