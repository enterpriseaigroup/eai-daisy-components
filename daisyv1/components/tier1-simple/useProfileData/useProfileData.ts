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