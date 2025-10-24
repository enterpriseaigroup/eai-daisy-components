import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "zustand-logger-middleware";
import { ProfileData } from "@domain/entities/ProfileData";
import { OrgProject } from "@domain/entities/OrgProject";
import { mapQueryToUserConfig } from "./utils/mapQueryToUserConfig";
import type { ProfileDataResponse } from "@application/models/ProfileDataResponse";
import { set as lodashSet, get as lodashGet } from 'lodash';
// import { customApiStorage } from "./customApiStorage";

export interface ProfileStoreState {
  profileData: ProfileData | null;
  setProfileData: (data: ProfileData) => void;
  clearProfileData: () => void;
  getProfileData: () => ProfileData | null;
  currentProject: OrgProject | null;
  setCurrentProject: (project: OrgProject) => void;
  clearCurrentProject: () => void;
  getCurrentProject: () => OrgProject | null; // ✅ NEW
  isAnonymous: boolean;
  setIsAnonymous: (val: boolean) => void;
  updateUserConfig: (path: string, value: unknown) => void;
  applyUserConfigFromQuery: (query: Record<string, string>, profile: ProfileDataResponse) => void;
  hasApplicationBeenCreated: boolean;
  setApplicationCreated: (val: boolean) => void;
  triggerAddressCard: boolean;
  setTriggerAddressCard: (val: boolean) => void;
  selectedPlanningPathwayInAnonymous: string | null; // Required, must be defined
  setSelectedPlanningPathwayInAnonymous: (pathway: string | null) => void; // Required setter
  isFormBricksInitialized: boolean; // ✅ NEW FormBricks flag
  setFormBricksInitialized: (initialized: boolean) => void; // ✅ NEW FormBricks setter
}

export const useProfileStore = create<ProfileStoreState>()(
  logger(
    devtools(
      persist(
        immer<ProfileStoreState>((set, get) => ({
          profileData: null,
          currentProject: null,
          isAnonymous: true,
          hasApplicationBeenCreated: false,
          triggerAddressCard: false,
          selectedPlanningPathwayInAnonymous: null, // Initialize as null
          isFormBricksInitialized: false, // ✅ NEW Initialize FormBricks flag

          setSelectedPlanningPathwayInAnonymous: (pathway: string | null) => {
            set((state) => {
              console.log("[useProfileStore] Setting selectedPlanningPathwayInAnonymous", pathway);
              state.selectedPlanningPathwayInAnonymous = pathway;
            });
          },

          setFormBricksInitialized: (initialized: boolean) => {
            set((state) => {
              console.log("[useProfileStore] Setting isFormBricksInitialized", initialized);
              state.isFormBricksInitialized = initialized;
            });
          },

          setTriggerAddressCard: (val: boolean) => {
            set((state) => {
              console.log("[useProfileStore] Setting triggerAddressCard", val);
              state.triggerAddressCard = val;
            });
          },

          setProfileData: (data: ProfileData) => {
            set((state) => {
              console.log("[useProfileStore] Setting profile data", data);
              state.profileData = data; // Mutable-style update
            });
          },

          clearProfileData: () => {
            set((state) => {
              state.profileData = null;
              state.currentProject = null;
              state.isAnonymous = true;
            });

            console.log("[useProfileStore] Clearing profile data");
            // Clear the persisted state - use the correct API
            try {
              // Option 1: Access persist methods through the store's persist property
              if (useProfileStore.persist?.clearStorage) {
                useProfileStore.persist.clearStorage();
              } else {
                // Option 2: Manually clear sessionStorage as fallback
                sessionStorage.removeItem('profile-store');
              }
            } catch (error) {
              console.warn("[useProfileStore] Failed to clear persisted storage:", error);
              // Fallback: manually clear sessionStorage
              try {
                sessionStorage.removeItem('profile-store');
              } catch (fallbackError) {
                console.error("[useProfileStore] Failed to clear sessionStorage:", fallbackError);
              }
            }
          },

          getProfileData: () => {
            return get().profileData; // Return the current profileData
          },

          setCurrentProject: (project: OrgProject) => {
            set((state) => {
              console.log("[useProfileStore] Setting current project", project);
              state.currentProject = project;
            });
          },

          clearCurrentProject: () => {
            set((state) => {
              console.log("[useProfileStore] Clearing current project");
              state.currentProject = null;
            });
          },

          getCurrentProject: () => {
            return get().currentProject;
          },

          setIsAnonymous: (val: boolean) => {
            set((state) => {
              console.log("[useProfileStore] Setting isAnonymous", val);
              state.isAnonymous = val;
            });
          },

          setApplicationCreated: (val: boolean) => {
            set((state) => {
              console.log("[useProfileStore] Setting hasApplicationBeenCreated:", val);
              state.hasApplicationBeenCreated = val;
            });
          },

          updateUserConfig: (path: string, value: unknown) => {
            set((state) => {
              if (!state.profileData) return;
              // ⛔ Prevent unnecessary update if value hasn't changed
              const currentValue = lodashGet(state.profileData, path);
              if (currentValue === value) {
                return; // ✅ Skip update
              }
              console.log("[useProfileStore] Updating user config", path, value);
              // ✅ Safely deep clone to avoid mutations triggering React errors
              const newProfileData = JSON.parse(JSON.stringify(state.profileData));
              // ✅ Perform deep update
              lodashSet(newProfileData, path, value);
              // ✅ Commit update to Zustand
              state.profileData = newProfileData;
            });
          },

          applyUserConfigFromQuery: (query: Record<string, string>, profile: ProfileDataResponse) => {
            const { user_config, extras } = mapQueryToUserConfig(query, profile);
            set((state) => {
              console.log("[useProfileStore] Applying user config from query", query, profile);
              if (!state.profileData) {
                const transformedProfileData: ProfileData = {
                  ...profile, // Spread the ProfileDataResponse properties
                  user_config, // Add or override the user_config
                  ...extras, // Add extras directly if ProfileData supports them
                  role: "applicant",
                };

                state.profileData = transformedProfileData;
              } else {
                state.profileData.user_config = user_config;
                if (
                  typeof extras.directLineToken === 'object' &&
                  extras.directLineToken?.token &&
                  extras.directLineToken?.expiration
                ) {
                  state.profileData.direct_line_token = extras.directLineToken;
                }
                if (extras.socialLogin) state.profileData.social_login = extras.socialLogin;
                if (extras.propertyReport) state.profileData.property_report = extras.propertyReport;
                if (extras.councilPortal) state.profileData.council_portal = extras.councilPortal;
              }
            });
          }
        })),
        {
          name: "profile-store", // Key for storage
          // storage: customApiStorage, // When using this, enable monitorLocalStorageClear
          storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
          partialize: (state: ProfileStoreState) => ({
            profileData: state.profileData,
            currentProject: state.currentProject,
            isAnonymous: state.isAnonymous,
            hasApplicationBeenCreated: state.hasApplicationBeenCreated,
            triggerAddressCard: state.triggerAddressCard,
            selectedPlanningPathwayInAnonymous: state.selectedPlanningPathwayInAnonymous,
            isFormBricksInitialized: state.isFormBricksInitialized, // ✅ NEW Include in persisted state
          } as Partial<ProfileStoreState>),
        }
      )
    )
  )
);