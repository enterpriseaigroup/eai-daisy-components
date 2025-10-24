
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import { useProfileData } from "@presentation/hooks/useProfileData";
import { useUpdateOrgId } from "@presentation/hooks/useUpdateOrgId";
import { useAuthStore } from "@presentation/store/useAuthStore";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { handleApiError } from "./handleApiError";

import { createDefaultUserConfig, ProfileData } from "@domain/entities/ProfileData";

export const useDashboard = () => {
    const { instance, accounts } = useMsal();
    const searchParams = useSearchParams();
    const { setAccessToken } = useAuthStore.getState();
    const isAuthenticated = useIsAuthenticated();
    const { data, fetchUserProfile } = useProfileData();
    const { isPending, isSuccess, isError } = fetchUserProfile;
    const { updateOrgId } = useUpdateOrgId();
    const isLoadingProfile = isAuthenticated && accounts.length > 0 && !isPending && !isSuccess;

    const {
        applyUserConfigFromQuery,
        setProfileData,
        getProfileData,
    } = useProfileStore.getState();

    const queryParams = useMemo(() => {
        const decoded: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            decoded[key] = decodeURIComponent(value);
        }
        return decoded;
    }, [searchParams]);

    // Always initialize default profile if not present
    useEffect(() => {
        const existingProfile = getProfileData();
        if (!existingProfile) {
            console.log("[DashboardPage] Creating default profile with empty user_config");
            const anonymousProfile: ProfileData = {
                id: "AnonymousUser",
                first_name: "Anonymous",
                last_name: "User",
                email_address: "",
                current_org_id: "",
                historic_org_ids: [],
                role: "applicant",
                security_groups_owned: [],
                security_groups_member_of: [],
            };
            setProfileData({
                ...anonymousProfile,
                user_config: createDefaultUserConfig(anonymousProfile),
            });
        }
    }, []);

    // Apply query-based user_config (if query is present)
    useEffect(() => {
        if (Object.keys(queryParams).length === 0) return;
        const existingProfile = getProfileData();
        if (existingProfile) {
            console.log("[Applying queryParams to user_config]");
            applyUserConfigFromQuery(queryParams, existingProfile);
        }
    }, [queryParams]);

    // ✅ Fetch token + user profile on login
    useEffect(() => {
        const fetchTokenAndProfileData = async () => {
            try {
                const tokenResponse = await instance.acquireTokenSilent({
                    scopes: [process.env.NEXT_PUBLIC_MSAL_SCOPE || "api://32191e63-e253-48de-9ea1-a5337e236fe6/.default"],
                    account: accounts[0],
                });
                const token = tokenResponse.accessToken;
                console.log('Token acquired:', token);
                setAccessToken(token);

                fetchUserProfile.mutate(
                    { token },
                    {
                        onSuccess: (profile) => {
                            console.log("[Profile Fetched]:", profile);
                            const orgId = profile.current_org_id;
                            const existingProfile = useProfileStore.getState().getProfileData();
                            // ✅ Optionally re-apply query config with full profile
                            applyUserConfigFromQuery(queryParams, profile);
                            if (orgId) {
                                if (!existingProfile?.current_org_id || existingProfile.current_org_id !== orgId) {
                                    console.log("[Calling updateOrgId] with:", { token, orgId });
                                    updateOrgId.mutate({ token, orgId });
                                } else {
                                    console.log("Org ID already set, skipping update API call.");
                                }
                            } else {
                                console.warn("[No orgId found in profile]");
                            }
                        },
                        onError: async (error) => {
                            await handleApiError(error);
                            console.error('Error fetching user profile:', error);
                        },
                    }
                );
            } catch (error) {
                console.error('Error acquiring token:', error);
            }
        };
        if (isAuthenticated && accounts.length > 0 && !isPending && !isSuccess && !isError) {
            console.log("[DashboardPage] - ${isAuthenticated} && ${accounts.length > 0} && ${!isPending} && ${!isSuccess}");
            fetchTokenAndProfileData();
            console.log("[DashboardPage] - Fetching token and profile data", data);
        }
    }, [isAuthenticated, accounts, isPending, isSuccess]);

    return {
        isLoadingProfile,
        isError,
        isSuccess,
        isPending,
        data,
    };
}