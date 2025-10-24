/**
 * useTokenAndProfile - Configurator V2 Component
 *
 * Component useTokenAndProfile from useTokenAndProfile.ts
 *
 * @migrated from DAISY v1
 */

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

  /**
   * BUSINESS LOGIC: useTokenAndProfile
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useTokenAndProfile logic
   * 2. Calls helper functions: useMsal, useState, useState, useProfileStore.getState, useAuthStore.getState, useProfileData, useUpdateOrgId, useChatMigrateHistory, useState, useState, useState, useState, useState, useRef, getProfileData, getEntraIdByCouncilLabel, chatMigrateHistory.mutate, useCallback, setIsLoading, setIsLoading, instance.acquireTokenSilent, setAccessToken, onTokenAcquired, fetchUserProfile.mutate, console.log, getProfileData, resolveOrgId, applyUserConfigFromQuery, Object.keys, setOrgIdStatus, setNeedsCouncilSelection, setOrgId, setOrgIdStatus, setShouldChatMigrate, setConversationId, onProfileFetched, handleApiError, setError, onError, setIsLoading, setError, onError, useEffect, setIsLoading, fetchTokenAndProfileData, useEffect, console.log, updateOrgIdMutation.mutate, console.log, fetchUserProfile.mutate, console.log, onProfileFetched, console.error, handleApiError, setError, onError, handleApiError, useEffect, setOrgIdStatus, useEffect, handleChatMigration, useEffect, console.warn, console.log, getProfileData, safeUpdateUserConfig, setShouldChatMigrate, setConversationId
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useMsal() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useProfileStore.getState() - Function call
   * - useAuthStore.getState() - Function call
   * - useProfileData() - Function call
   * - useUpdateOrgId() - Function call
   * - useChatMigrateHistory() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useRef() - Function call
   * - getProfileData() - Function call
   * - getEntraIdByCouncilLabel() - Function call
   * - chatMigrateHistory.mutate() - Function call
   * - useCallback() - Function call
   * - setIsLoading() - Function call
   * - setIsLoading() - Function call
   * - instance.acquireTokenSilent() - Function call
   * - setAccessToken() - Function call
   * - onTokenAcquired() - Function call
   * - fetchUserProfile.mutate() - Function call
   * - console.log() - Function call
   * - getProfileData() - Function call
   * - resolveOrgId() - Function call
   * - applyUserConfigFromQuery() - Function call
   * - Object.keys() - Function call
   * - setOrgIdStatus() - Function call
   * - setNeedsCouncilSelection() - Function call
   * - setOrgId() - Function call
   * - setOrgIdStatus() - Function call
   * - setShouldChatMigrate() - Function call
   * - setConversationId() - Function call
   * - onProfileFetched() - Function call
   * - handleApiError() - Function call
   * - setError() - Function call
   * - onError() - Function call
   * - setIsLoading() - Function call
   * - setError() - Function call
   * - onError() - Function call
   * - useEffect() - Function call
   * - setIsLoading() - Function call
   * - fetchTokenAndProfileData() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - updateOrgIdMutation.mutate() - Function call
   * - console.log() - Function call
   * - fetchUserProfile.mutate() - Function call
   * - console.log() - Function call
   * - onProfileFetched() - Function call
   * - console.error() - Function call
   * - handleApiError() - Function call
   * - setError() - Function call
   * - onError() - Function call
   * - handleApiError() - Function call
   * - useEffect() - Function call
   * - setOrgIdStatus() - Function call
   * - useEffect() - Function call
   * - handleChatMigration() - Function call
   * - useEffect() - Function call
   * - console.warn() - Function call
   * - console.log() - Function call
   * - getProfileData() - Function call
   * - safeUpdateUserConfig() - Function call
   * - setShouldChatMigrate() - Function call
   * - setConversationId() - Function call
   *
   * WHY IT CALLS THEM:
   * - useMsal: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useProfileStore.getState: Required functionality
   * - useAuthStore.getState: Required functionality
   * - useProfileData: Required functionality
   * - useUpdateOrgId: Required functionality
   * - useChatMigrateHistory: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useRef: Required functionality
   * - getProfileData: Required functionality
   * - getEntraIdByCouncilLabel: Required functionality
   * - chatMigrateHistory.mutate: Required functionality
   * - useCallback: Required functionality
   * - setIsLoading: State update
   * - setIsLoading: State update
   * - instance.acquireTokenSilent: Required functionality
   * - setAccessToken: State update
   * - onTokenAcquired: Required functionality
   * - fetchUserProfile.mutate: Data fetching
   * - console.log: Debugging output
   * - getProfileData: Required functionality
   * - resolveOrgId: Required functionality
   * - applyUserConfigFromQuery: Required functionality
   * - Object.keys: Required functionality
   * - setOrgIdStatus: State update
   * - setNeedsCouncilSelection: State update
   * - setOrgId: State update
   * - setOrgIdStatus: State update
   * - setShouldChatMigrate: State update
   * - setConversationId: State update
   * - onProfileFetched: Data fetching
   * - handleApiError: Required functionality
   * - setError: State update
   * - onError: Required functionality
   * - setIsLoading: State update
   * - setError: State update
   * - onError: Required functionality
   * - useEffect: Required functionality
   * - setIsLoading: State update
   * - fetchTokenAndProfileData: Data fetching
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - updateOrgIdMutation.mutate: Required functionality
   * - console.log: Debugging output
   * - fetchUserProfile.mutate: Data fetching
   * - console.log: Debugging output
   * - onProfileFetched: Data fetching
   * - console.error: Error logging
   * - handleApiError: Required functionality
   * - setError: State update
   * - onError: Required functionality
   * - handleApiError: Required functionality
   * - useEffect: Required functionality
   * - setOrgIdStatus: State update
   * - useEffect: Required functionality
   * - handleChatMigration: Required functionality
   * - useEffect: Required functionality
   * - console.warn: Warning notification
   * - console.log: Debugging output
   * - getProfileData: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - setShouldChatMigrate: State update
   * - setConversationId: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useMsal, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
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
    /**
     * BUSINESS LOGIC: resolveOrgId
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements resolveOrgId logic
     * 2. Calls helper functions: getProfileData, getEntraIdByCouncilLabel
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - getProfileData() - Function call
     * - getEntraIdByCouncilLabel() - Function call
     *
     * WHY IT CALLS THEM:
     * - getProfileData: Required functionality
     * - getEntraIdByCouncilLabel: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls getProfileData, getEntraIdByCouncilLabel to process data
     * Output: Computed value or side effect
     *
     */
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

    /**
     * BUSINESS LOGIC: handleChatMigration
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements handleChatMigration logic
     * 2. Calls helper functions: chatMigrateHistory.mutate
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - chatMigrateHistory.mutate() - Function call
     *
     * WHY IT CALLS THEM:
     * - chatMigrateHistory.mutate: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls chatMigrateHistory.mutate to process data
     * Output: Computed value or side effect
     *
     */
  const handleChatMigration = (conversationId: string, token: string) => {
    const payload: ChatMigrateHistoryRequest = {
      user_config: {
        conversation_id: conversationId,
        workflows: { chat_migrated: false },
      },
    };
    chatMigrateHistory.mutate({ token, payload });
  };

    /**
     * BUSINESS LOGIC: fetchTokenAndProfileData
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setIsLoading, setIsLoading, instance.acquireTokenSilent, setAccessToken, onTokenAcquired, fetchUserProfile.mutate, console.log, getProfileData, resolveOrgId, applyUserConfigFromQuery, Object.keys, setOrgIdStatus, setNeedsCouncilSelection, setOrgId, setOrgIdStatus, setShouldChatMigrate, setConversationId, onProfileFetched, handleApiError, setError, onError, setIsLoading, setError, onError functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setIsLoading() - Function call
     * - setIsLoading() - Function call
     * - instance.acquireTokenSilent() - Function call
     * - setAccessToken() - Function call
     * - onTokenAcquired() - Function call
     * - fetchUserProfile.mutate() - Function call
     * - console.log() - Function call
     * - getProfileData() - Function call
     * - resolveOrgId() - Function call
     * - applyUserConfigFromQuery() - Function call
     * - Object.keys() - Function call
     * - setOrgIdStatus() - Function call
     * - setNeedsCouncilSelection() - Function call
     * - setOrgId() - Function call
     * - setOrgIdStatus() - Function call
     * - setShouldChatMigrate() - Function call
     * - setConversationId() - Function call
     * - onProfileFetched() - Function call
     * - handleApiError() - Function call
     * - setError() - Function call
     * - onError() - Function call
     * - setIsLoading() - Function call
     * - setError() - Function call
     * - onError() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsLoading: State update
     * - setIsLoading: State update
     * - instance.acquireTokenSilent: Required functionality
     * - setAccessToken: State update
     * - onTokenAcquired: Required functionality
     * - fetchUserProfile.mutate: Data fetching
     * - console.log: Debugging output
     * - getProfileData: Required functionality
     * - resolveOrgId: Required functionality
     * - applyUserConfigFromQuery: Required functionality
     * - Object.keys: Required functionality
     * - setOrgIdStatus: State update
     * - setNeedsCouncilSelection: State update
     * - setOrgId: State update
     * - setOrgIdStatus: State update
     * - setShouldChatMigrate: State update
     * - setConversationId: State update
     * - onProfileFetched: Data fetching
     * - handleApiError: Required functionality
     * - setError: State update
     * - onError: Required functionality
     * - setIsLoading: State update
     * - setError: State update
     * - onError: Required functionality
     *
     * DATA FLOW:
     * Input: accounts, scopes, instance, setAccessToken, fetchUserProfile, applyUserConfigFromQuery, getProfileData, onError, onProfileFetched, onTokenAcquired, queryParams state/props
     * Processing: Calls setIsLoading, setIsLoading, instance.acquireTokenSilent to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - accounts: Triggers when accounts changes
     * - scopes: Triggers when scopes changes
     * - instance: Triggers when instance changes
     * - setAccessToken: Triggers when setAccessToken changes
     * - fetchUserProfile: Triggers when fetchUserProfile changes
     * - applyUserConfigFromQuery: Triggers when applyUserConfigFromQuery changes
     * - getProfileData: Triggers when getProfileData changes
     * - onError: Triggers when onError changes
     * - onProfileFetched: Triggers when onProfileFetched changes
     * - onTokenAcquired: Triggers when onTokenAcquired changes
     * - queryParams: Triggers when queryParams changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
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

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors accounts, autoFetch, isPending, isSuccess, isError, fetchTokenAndProfileData for changes
     * 2. Executes setIsLoading, fetchTokenAndProfileData functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setIsLoading() - Function call
     * - fetchTokenAndProfileData() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsLoading: State update
     * - fetchTokenAndProfileData: Data fetching
     *
     * DATA FLOW:
     * Input: accounts, autoFetch, isPending, isSuccess, isError, fetchTokenAndProfileData state/props
     * Processing: Calls setIsLoading, fetchTokenAndProfileData to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - accounts: Triggers when accounts changes
     * - autoFetch: Triggers when autoFetch changes
     * - isPending: Triggers when isPending changes
     * - isSuccess: Triggers when isSuccess changes
     * - isError: Triggers when isError changes
     * - fetchTokenAndProfileData: Triggers when fetchTokenAndProfileData changes
     *
     */
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
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors orgIdStatus, orgId, accessToken, updateOrgIdMutation for changes
     * 2. Executes console.log, updateOrgIdMutation.mutate, console.log, fetchUserProfile.mutate, console.log, onProfileFetched, console.error, handleApiError, setError, onError, handleApiError functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - console.log() - Function call
     * - updateOrgIdMutation.mutate() - Function call
     * - console.log() - Function call
     * - fetchUserProfile.mutate() - Function call
     * - console.log() - Function call
     * - onProfileFetched() - Function call
     * - console.error() - Function call
     * - handleApiError() - Function call
     * - setError() - Function call
     * - onError() - Function call
     * - handleApiError() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.log: Debugging output
     * - updateOrgIdMutation.mutate: Required functionality
     * - console.log: Debugging output
     * - fetchUserProfile.mutate: Data fetching
     * - console.log: Debugging output
     * - onProfileFetched: Data fetching
     * - console.error: Error logging
     * - handleApiError: Required functionality
     * - setError: State update
     * - onError: Required functionality
     * - handleApiError: Required functionality
     *
     * DATA FLOW:
     * Input: orgIdStatus, orgId, accessToken, updateOrgIdMutation state/props
     * Processing: Calls console.log, updateOrgIdMutation.mutate, console.log to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - orgIdStatus: Triggers when orgIdStatus changes
     * - orgId: Triggers when orgId changes
     * - accessToken: Triggers when accessToken changes
     * - updateOrgIdMutation: Triggers when updateOrgIdMutation changes
     *
     */
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

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors orgId, accessToken, orgIdStatus for changes
     * 2. Executes setOrgIdStatus functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setOrgIdStatus() - Function call
     *
     * WHY IT CALLS THEM:
     * - setOrgIdStatus: State update
     *
     * DATA FLOW:
     * Input: orgId, accessToken, orgIdStatus state/props
     * Processing: Calls setOrgIdStatus to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - orgId: Triggers when orgId changes
     * - accessToken: Triggers when accessToken changes
     * - orgIdStatus: Triggers when orgIdStatus changes
     *
     */
  useEffect(() => {
    if (orgIdStatus === 'skipped' && orgId && accessToken) {
      setOrgIdStatus('ready'); // trigger delayed update
    }
  }, [orgId, accessToken, orgIdStatus]);
  // Effect to chatMigrateHistory when isChatMigrated && conversationId changes
  // TODO: migrate-chat-history to happen when logging in from anon state - currently it is happening but failing with 200 success
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors shouldChatMigrate, accessToken, conversationId for changes
     * 2. Executes handleChatMigration functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - handleChatMigration() - Function call
     *
     * WHY IT CALLS THEM:
     * - handleChatMigration: Required functionality
     *
     * DATA FLOW:
     * Input: shouldChatMigrate, accessToken, conversationId state/props
     * Processing: Calls handleChatMigration to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - shouldChatMigrate: Triggers when shouldChatMigrate changes
     * - accessToken: Triggers when accessToken changes
     * - conversationId: Triggers when conversationId changes
     *
     */
  useEffect(() => {
    if (shouldChatMigrate && accessToken && conversationId) {
      handleChatMigration(conversationId, accessToken);
    }
  }, [shouldChatMigrate, accessToken, conversationId]);
  // Effect to updateUserConfig when chat migration is successful
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors chatHistory, getProfileData, updateUserConfig for changes
     * 2. Executes console.warn, console.log, getProfileData, safeUpdateUserConfig, setShouldChatMigrate, setConversationId functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - console.warn() - Function call
     * - console.log() - Function call
     * - getProfileData() - Function call
     * - safeUpdateUserConfig() - Function call
     * - setShouldChatMigrate() - Function call
     * - setConversationId() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.warn: Warning notification
     * - console.log: Debugging output
     * - getProfileData: Required functionality
     * - safeUpdateUserConfig: Required functionality
     * - setShouldChatMigrate: State update
     * - setConversationId: State update
     *
     * DATA FLOW:
     * Input: chatHistory, getProfileData, updateUserConfig state/props
     * Processing: Calls console.warn, console.log, getProfileData to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - chatHistory: Triggers when chatHistory changes
     * - getProfileData: Triggers when getProfileData changes
     * - updateUserConfig: Triggers when updateUserConfig changes
     *
     */
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