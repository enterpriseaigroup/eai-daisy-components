/**
 * useProfileData - Configurator V2 Component
 *
 * Component useProfileData from useProfileData.ts
 *
 * @migrated from DAISY v1
 */

import "reflect-metadata";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import container from "@presentation/di"; // Adjust if needed
import type { IProfileDataUseCase } from "@application/interfaces/IProfileDataUseCase";
import { ProfileData, UserConfig } from "@domain/entities/ProfileData";
import { useStageService } from "./useStageService";
// Optional: Zustand store if you're persisting the profile globally
import { useProfileStore } from "../store/useProfileStore";
import type { ProfileDataResponse } from "@application/models/ProfileDataResponse";
import { StageType } from "@domain/entities/ApplicationStage";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: mergeWithFallback
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements mergeWithFallback logic
   * 2. Calls helper functions: Object.keys
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - Object.keys() - Function call
   *
   * WHY IT CALLS THEM:
   * - Object.keys: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls Object.keys to process data
   * Output: Computed value or side effect
   *
   */
function mergeWithFallback<T extends object>(fetched: T | undefined, current: T | undefined): T {
  const result = { ...(current || {}) } as T;
  if (!fetched) return result;
  for (const key of Object.keys(fetched) as (keyof T)[]) {
    const fetchedVal = fetched[key];
    const currentVal = current?.[key];
    result[key] =
      fetchedVal !== undefined && fetchedVal !== ''
        ? fetchedVal
        : currentVal!;
  }
  return result;
}

// TODO: See if this impacts movement to document_checklist from anon PP state
const previousStage = useStageService.getPreviousStage();
console.log("previousStage", previousStage)
const mapStageToState: Record<StageType, string> = {
  property: 'qa',
  project: 'planning_pathway',
  documents: 'document_checklist',
  application: 'application',
};
console.log("(previousStage ? mapStageToState[previousStage] : 'qa')", (previousStage ? mapStageToState[previousStage] : 'qa'))

// NOTE: changes needed
  /**
   * BUSINESS LOGIC: useProfileData
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useProfileData logic
   * 2. Calls helper functions: useState, useProfileStore, useMutation, container.resolve, useCase.execute, getProfileData, console.log, console.log, mergeWithFallback, mergeWithFallback, mergeWithFallback, mergeWithFallback, console.log, setData, setProfileData, setIsAnonymous, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useProfileStore() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - useCase.execute() - Function call
   * - getProfileData() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - mergeWithFallback() - Function call
   * - mergeWithFallback() - Function call
   * - mergeWithFallback() - Function call
   * - mergeWithFallback() - Function call
   * - console.log() - Function call
   * - setData() - Function call
   * - setProfileData() - Function call
   * - setIsAnonymous() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useProfileStore: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - useCase.execute: Required functionality
   * - getProfileData: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - mergeWithFallback: Required functionality
   * - mergeWithFallback: Required functionality
   * - mergeWithFallback: Required functionality
   * - mergeWithFallback: Required functionality
   * - console.log: Debugging output
   * - setData: State update
   * - setProfileData: State update
   * - setIsAnonymous: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setData: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useProfileStore, useMutation to process data
   * Output: Computed value or side effect
   *
   */
export const useProfileData = () => {
  const [data, setData] = useState<ProfileDataResponse | null>(null);
  const {
    getProfileData,
    setProfileData,
    setIsAnonymous,
  } = useProfileStore();
  // TODO: Need to see how to merge the user_config created before and after login (resolved)
  const fetchUserProfile = useMutation<ProfileDataResponse, Error, { token: string }>({
    mutationFn: async ({ token }) => {
      const useCase = container.resolve<IProfileDataUseCase>("IProfileDataUseCase");
      return await useCase.execute(token);
    },
    // In the onSuccess handler:
    // TODO: Merging is causing overwriting and it doesn't have the latest data!! (resolved)
    onSuccess: (fetchedProfile: ProfileDataResponse) => {
      const currentProfile = getProfileData();
      console.log("currentProfile in fetchUserProfile", currentProfile);
      console.log("fetchedProfile in fetchUserProfile", fetchedProfile);
      const currentUserConfig = currentProfile?.user_config;
      const fetchedUserConfig = fetchedProfile;
      const mergedUserConfig: UserConfig = {
        org_id: fetchedUserConfig?.current_org_id ?? currentUserConfig?.org_id ?? fetchedProfile.current_org_id ?? '',
        project_id: currentUserConfig?.project_id || '',
        conversation_id: currentUserConfig?.conversation_id || '',
        country: currentUserConfig?.country ?? 'Australia',
        first_name: fetchedUserConfig?.first_name ?? currentUserConfig?.first_name ?? fetchedProfile.first_name,
        last_name: fetchedUserConfig?.last_name ?? currentUserConfig?.last_name ?? fetchedProfile.last_name,
        email: fetchedUserConfig?.email_address ?? currentUserConfig?.email ?? fetchedProfile.email_address,
        state: currentUserConfig?.state ?? (previousStage ? mapStageToState[previousStage] : 'qa'),
        user_id: fetchedUserConfig?.id ?? currentUserConfig?.user_id ?? fetchedProfile.id,
        workflow: mergeWithFallback(undefined, currentUserConfig?.workflow),
        project: mergeWithFallback(undefined, currentUserConfig?.project),
        policies: {
          state: mergeWithFallback(undefined, currentUserConfig?.policies?.state),
          local: mergeWithFallback(undefined, currentUserConfig?.policies?.local),
        },
      };
      // Create merged profile with properly handled user_config
      const mergedProfile: ProfileData = {
        ...currentProfile,
        ...fetchedProfile,
        user_config: mergedUserConfig,
        role: currentProfile?.role ?? "applicant",
      };
      console.log("mergedProfile in fetchUserProfile", mergedProfile)
      setData(mergedProfile);
      setProfileData(mergedProfile);
      setIsAnonymous(false);
    },
    onError: async (error) => {
      await handleApiError(error);
      console.error("Error fetching profile:", error);
      setData(null);
    },
  });

  return {
    fetchUserProfile,
    data,
  };
};