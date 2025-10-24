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
const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  return hasHydrated;
};

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

  const councilMappings = useMemo(() => getParsedCouncilMappings(), []);
  const councilMap = useMemo(() => {
    return councilMappings.reduce((acc, council) => {
      acc[council.entra_id] = council.name;
      return acc;
    }, {} as Record<string, string>);
  }, [councilMappings]);

  const selectedCouncil = useMemo(() => {
    return councilMappings.find((c) => c.name === selectedCouncilName);
  }, [selectedCouncilName, councilMappings]);

  const handleCancel = () => {
    if (isFirstTimeUser) {
      // NEW: For first-time users, they can't go back without selecting a council
      // Could redirect to logout or show a warning
      console.log("⚠️ First-time user trying to cancel - council selection required");
      return;
    }
    window.history.back();
  };

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