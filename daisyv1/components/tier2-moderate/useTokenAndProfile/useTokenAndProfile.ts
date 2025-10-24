import { useState, useEffect, useCallback, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { useProfileData } from "@presentation/hooks/useProfileData";
import { useUpdateOrgId } from "@presentation/hooks/useUpdateOrgId";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { useAuthStore } from '../store/useAuthStore';
import { useChatMigrateHistory } from '@presentation/hooks/useChatMigrateHistory';
import { ChatMigrateHistoryRequest } from '@application/models/ChatMigrateHistoryRequest';
import { getEntraIdByCouncilLabel } from '../constants/councilMappings';
import type { ProfileDataResponse } from '@application/models/ProfileDataResponse';
import { safeUpdateUserConfig } from '../components/chatbot/utils/safeUpdateUserConfig';
import { handleApiError } from "./handleApiError";

interface UseTokenAndProfileOptions {
  onTokenAcquired?: (token: string) => void;
  onProfileFetched?: (profile: unknown) => void;
  onError?: (error: unknown) => void;
  scopes?: string[];
  autoFetch?: boolean;
  queryParams?: Record<string, string>;
}
interface UseTokenAndProfileReturn {
  token: string | null;
  profile: ProfileDataResponse | null;
  isLoading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
  needsCouncilSelection: boolean;
}

export const useTokenAndProfile = ({
  onTokenAcquired,
  onProfileFetched,
  onError,
  scopes = [process.env.NEXT_PUBLIC_MSAL_SCOPE || "api://32191e63-e253-48de-9ea1-a5337e236fe6/.default"],
  autoFetch = true,
  queryParams
}: UseTokenAndProfileOptions = {}): UseTokenAndProfileReturn => {
  const { instance, accounts } = useMsal();
  const [error, setError] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { applyUserConfigFromQuery, getProfileData, updateUserConfig, isAnonymous } = useProfileStore.getState();
  const { accessToken, setAccessToken } = useAuthStore.getState();
  const { data: profile, fetchUserProfile } = useProfileData();
  const { updateOrgId: updateOrgIdMutation } = useUpdateOrgId();
  const { data: chatHistory, chatMigrateHistory } = useChatMigrateHistory();
  const { isPending, isSuccess, isError } = fetchUserProfile;
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgIdStatus, setOrgIdStatus] = useState<'pending' | 'ready' | 'skipped'>('pending');
  const [shouldChatMigrate, setShouldChatMigrate] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [needsCouncilSelection, setNeedsCouncilSelection] = useState<boolean>(false);
  const hasUpdatedOrgId = useRef<boolean>(false); // ✅ Prevent repeated updateOrgId calls

  // Step 1: Try extracting from profileData directly (most reliable)
  // Step 2: Fallback to existingProfile user_config.project.council_name → get mapped entra_id
  // Step 3: If still no orgId, use hardcoded default council name (REMOVED - will redirect to switch-council page)
  // TODO: Need to update the DEFAULT council name to DEFAULT (edge case if the user hits /dashboard directly without coming from council page) - will never happen (resolved)
  const resolveOrgId = (profileData: ProfileDataResponse): string | undefined => {
    if (queryParams?.entraOrgId || profileData.current_org_id) {
      return queryParams?.entraOrgId || profileData.current_org_id; // ✅ Prioritize query param, fallback to profile
    }
    const existingProfile = getProfileData();
    const councilLabel = existingProfile?.user_config?.project?.council_name;
    const entraIdFromLabel = councilLabel ? getEntraIdByCouncilLabel(councilLabel) : undefined;
    return (
      profileData.current_org_id ||
      entraIdFromLabel
    );
  };

  const handleChatMigration = (conversationId: string, token: string) => {
    const payload: ChatMigrateHistoryRequest = {
      user_config: {
        conversation_id: conversationId,
        workflows: { chat_migrated: false },
      },
    };
    chatMigrateHistory.mutate({ token, payload });
  };

  const fetchTokenAndProfileData = useCallback(async () => {
    if (!accounts.length) return setIsLoading(false);
    setIsLoading(true);
    try {
      const tokenResponse = await instance.acquireTokenSilent({ scopes, account: accounts[0] });
      const token = tokenResponse.accessToken;
      setAccessToken(token);
      onTokenAcquired?.(token);
      fetchUserProfile.mutate(
        { token },
        {
          onSuccess: (profileData) => {
            console.log("[✅ Profile fetched]", profileData);
            const existingProfile = getProfileData();
            const existingConfig = existingProfile?.user_config;
            const resolvedOrgId = resolveOrgId(profileData);
            if (queryParams && Object.keys(queryParams).length > 0 && (!existingConfig?.conversation_id || !existingConfig?.project_id)) {
              applyUserConfigFromQuery(queryParams, profileData);
            }
            if (resolvedOrgId) {
              setOrgId(resolvedOrgId);
              setOrgIdStatus('ready');
            } else {
              setOrgIdStatus('skipped'); // defer update
              setNeedsCouncilSelection(true);
            }
            const isChatMigrated = existingConfig?.workflow?.chat_migrated;
            const conversationId = existingConfig?.conversation_id;
            if (isAnonymous && !isChatMigrated && conversationId) {
              setShouldChatMigrate(true);
              setConversationId(conversationId);
            }
            onProfileFetched?.(profileData);
          },
          onError: async (err) => {
            await handleApiError(err);
            setError(err);
            onError?.(err);
          }
        }
      );
      // setIsLoading(false);  // NEW
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setIsLoading(false); // NEW
    }
  }, [
    accounts, scopes, instance, setAccessToken,
    fetchUserProfile, applyUserConfigFromQuery,
    getProfileData, onError, onProfileFetched, onTokenAcquired, queryParams
  ]);

  useEffect(() => {
    if (autoFetch && accounts.length > 0 && !isPending && !isSuccess && !isError) {
      fetchTokenAndProfileData();
    }
    // NEW
    else if (!accounts.length) {
      setIsLoading(false);
    }
  }, [accounts, autoFetch, isPending, isSuccess, isError, fetchTokenAndProfileData]);

  // Effect to updateOrgIdMutation when orgId changes
  useEffect(() => {
    if (
      orgIdStatus === 'ready' &&
      orgId &&
      accessToken &&
      !hasUpdatedOrgId.current
    ) {
      console.log("🔁 Updating orgId:", orgId);
      hasUpdatedOrgId.current = true; // ✅ This was missing — MUST be set here
      updateOrgIdMutation.mutate(
        { token: accessToken, orgId },
        {
          onSuccess: () => {
            console.log("[✅ Org ID updated successfully, re-fetching profile]");
            fetchUserProfile.mutate(
              { token: accessToken },
              {
                onSuccess: (refetchedProfile) => {
                  console.log("[✅ Profile re-fetched after orgId update]");
                  onProfileFetched?.(refetchedProfile);
                },
                onError: async (err) => {
                  console.error("[⚠️ Error re-fetching profile after orgId update]", err);
                  await handleApiError(err);
                  setError(err);
                  onError?.(err);
                }
              }
            );
          },
          onError: async (err) => {
            await handleApiError(err);
            hasUpdatedOrgId.current = false; // allow retry on failure
          },
        }
      );
    }
  }, [orgIdStatus, orgId, accessToken, updateOrgIdMutation]);

  useEffect(() => {
    if (orgIdStatus === 'skipped' && orgId && accessToken) {
      setOrgIdStatus('ready'); // trigger delayed update
    }
  }, [orgId, accessToken, orgIdStatus]);
  // Effect to chatMigrateHistory when isChatMigrated && conversationId changes
  // TODO: migrate-chat-history to happen when logging in from anon state - currently it is happening but failing with 200 success
  useEffect(() => {
    if (shouldChatMigrate && accessToken && conversationId) {
      handleChatMigration(conversationId, accessToken);
    }
  }, [shouldChatMigrate, accessToken, conversationId]);
  // Effect to updateUserConfig when chat migration is successful
  useEffect(() => {
    if (chatHistory) {
      const { success, message } = chatHistory as { success?: boolean; message?: string };
      if (success) {
        console.log("[✅ Chat migration completed successfully]");
        const profileData = getProfileData();
        if (profileData) {
          safeUpdateUserConfig("user_config.workflow.chat_migrated", true, profileData, updateUserConfig);
          setShouldChatMigrate(false);
          setConversationId(null);
        }
      } else {
        console.warn("[⚠️ Chat migration failed]:", message || "Unknown error");
      }
    }
  }, [chatHistory, getProfileData, updateUserConfig]);

  return {
    token: accessToken,
    profile,
    isLoading: isLoading, // NEW: include both token + profile (introduced in staff screens)
    error: error || (isError ? new Error('Error fetching profile') : null),
    refetch: fetchTokenAndProfileData,
    needsCouncilSelection
  };
};