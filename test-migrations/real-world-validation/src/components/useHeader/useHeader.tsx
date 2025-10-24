/**
 * useHeader - Configurator V2 Component
 *
 * Component useHeader from useHeader.ts
 *
 * @migrated from DAISY v1
 */

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useProfileStore } from '@presentation/store/useProfileStore';
import { useAuthStore } from '@presentation/store/useAuthStore';
import type { AuthStore } from '@presentation/store/useAuthStore';
import { useFetchOrgProjects } from '@presentation/hooks/useFetchOrgProjects';
import { getCouncilByName } from '@presentation/constants/councilMappings';
import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '@presentation/hooks/useClickOutside';
import { useMemo } from 'react';
import { OrgProject } from '@/app/domain/entities/OrgProject';
import { ProfileData } from '@/app/domain/entities/ProfileData';
import { resolveOrgId } from '@/app/(presentation)/store/utils/userProfileHelpers';
import { resetForLogout } from '@/app/(presentation)/store/utils/sessionUtils';
import { initNewUserProfileConfig } from '@/app/(presentation)/store/utils/profileUtils';
import { resetForProjectChange } from '@/app/(presentation)/store/utils/sessionUtils';

  /**
   * BUSINESS LOGIC: useHeader
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useHeader logic
   * 2. Calls helper functions: useMsal, useProfileStore, resolveOrgId, useAuthStore, useFetchOrgProjects, useState, useState, useState, useIsAuthenticated, useRef, useRef, useRef, useClickOutside, setIsProjectMenuOpen, useClickOutside, setIsHelpOpen, useClickOutside, setIsProfileOpen, .trim, useMemo, .trim, .trim, useState, getCouncilByName, useEffect, setCouncilLogoSrc, resolveOrgId, getCouncilByName, setCouncilLogoSrc, instance.loginRedirect, resetForLogout, sessionStorage.clear, localStorage.clear, instance.logoutRedirect, localStorage.setItem, resetForProjectChange, setCurrentProject, initNewUserProfileConfig, setProfileData, initNewUserProfileConfig, .setProfileData, useProfileStore.getState, setIsProjectMenuOpen, .reload
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useMsal() - Function call
   * - useProfileStore() - Function call
   * - resolveOrgId() - Function call
   * - useAuthStore() - Function call
   * - useFetchOrgProjects() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useIsAuthenticated() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useClickOutside() - Function call
   * - setIsProjectMenuOpen() - Function call
   * - useClickOutside() - Function call
   * - setIsHelpOpen() - Function call
   * - useClickOutside() - Function call
   * - setIsProfileOpen() - Function call
   * - .trim() - Function call
   * - useMemo() - Function call
   * - .trim() - Function call
   * - .trim() - Function call
   * - useState() - Function call
   * - getCouncilByName() - Function call
   * - useEffect() - Function call
   * - setCouncilLogoSrc() - Function call
   * - resolveOrgId() - Function call
   * - getCouncilByName() - Function call
   * - setCouncilLogoSrc() - Function call
   * - instance.loginRedirect() - Function call
   * - resetForLogout() - Function call
   * - sessionStorage.clear() - Function call
   * - localStorage.clear() - Function call
   * - instance.logoutRedirect() - Function call
   * - localStorage.setItem() - Function call
   * - resetForProjectChange() - Function call
   * - setCurrentProject() - Function call
   * - initNewUserProfileConfig() - Function call
   * - setProfileData() - Function call
   * - initNewUserProfileConfig() - Function call
   * - .setProfileData() - Function call
   * - useProfileStore.getState() - Function call
   * - setIsProjectMenuOpen() - Function call
   * - .reload() - Function call
   *
   * WHY IT CALLS THEM:
   * - useMsal: Required functionality
   * - useProfileStore: Required functionality
   * - resolveOrgId: Required functionality
   * - useAuthStore: Required functionality
   * - useFetchOrgProjects: Data fetching
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useIsAuthenticated: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useClickOutside: Required functionality
   * - setIsProjectMenuOpen: State update
   * - useClickOutside: Required functionality
   * - setIsHelpOpen: State update
   * - useClickOutside: Required functionality
   * - setIsProfileOpen: State update
   * - .trim: Required functionality
   * - useMemo: Required functionality
   * - .trim: Required functionality
   * - .trim: Required functionality
   * - useState: Required functionality
   * - getCouncilByName: Required functionality
   * - useEffect: Required functionality
   * - setCouncilLogoSrc: State update
   * - resolveOrgId: Required functionality
   * - getCouncilByName: Required functionality
   * - setCouncilLogoSrc: State update
   * - instance.loginRedirect: Required functionality
   * - resetForLogout: State update
   * - sessionStorage.clear: Required functionality
   * - localStorage.clear: Required functionality
   * - instance.logoutRedirect: Required functionality
   * - localStorage.setItem: State update
   * - resetForProjectChange: State update
   * - setCurrentProject: State update
   * - initNewUserProfileConfig: Required functionality
   * - setProfileData: State update
   * - initNewUserProfileConfig: Required functionality
   * - .setProfileData: State update
   * - useProfileStore.getState: Required functionality
   * - setIsProjectMenuOpen: State update
   * - .reload: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useMsal, useProfileStore, resolveOrgId to process data
   * Output: Computed value or side effect
   *
   */
export const useHeader = () => {
    const { instance, accounts } = useMsal();
    const { profileData, currentProject, setCurrentProject, setProfileData } = useProfileStore();
    const currentOrgId = profileData ? resolveOrgId(profileData) : undefined;
    const token = useAuthStore((state: AuthStore) => state.accessToken ?? undefined);
    const { projects, loading, isError, error, refetch: refetchProjects } = useFetchOrgProjects(currentOrgId, token);
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isAuthenticated = useIsAuthenticated();

    const projectRef = useRef<HTMLDivElement>(null);
    const helpRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    useClickOutside(projectRef, () => setIsProjectMenuOpen(false));
    useClickOutside(helpRef, () => setIsHelpOpen(false));
    useClickOutside(profileRef, () => setIsProfileOpen(false));

    const displayName = profileData
        ? `${profileData.first_name} ${profileData.last_name}`.trim()
        : accounts[0]?.name || '';
      /**
       * BUSINESS LOGIC: applicationName
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements business logic
       *
       * WHAT IT CALLS:
       * - .trim() - Function call
       * - .trim() - Function call
       *
       * WHY IT CALLS THEM:
       * - .trim: Required functionality
       * - .trim: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls .trim, .trim to process data
       * Output: Computed value or side effect
       *
       * SPECIAL BEHAVIOR:
       * - Memoized for performance optimization
       *
       */
    const applicationName = useMemo(() => {
        if (currentProject?.title?.trim()) {
            return currentProject.title;
        }
        const projectName = profileData?.user_config?.project?.application_name?.trim();
        return projectName ? projectName : 'New Project';
    }, [currentProject?.title, profileData?.user_config?.project?.application_name]);
    const [councilLogoSrc, setCouncilLogoSrc] = useState('/images/eai.png');
    const matchedCouncil = getCouncilByName(undefined, currentOrgId);
    // Use matchedCouncil.name only if it's resolved; otherwise fallback to legacy logic
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes setCouncilLogoSrc, resolveOrgId, getCouncilByName, setCouncilLogoSrc functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - setCouncilLogoSrc() - Function call
       * - resolveOrgId() - Function call
       * - getCouncilByName() - Function call
       * - setCouncilLogoSrc() - Function call
       *
       * WHY IT CALLS THEM:
       * - setCouncilLogoSrc: State update
       * - resolveOrgId: Required functionality
       * - getCouncilByName: Required functionality
       * - setCouncilLogoSrc: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setCouncilLogoSrc, resolveOrgId, getCouncilByName to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        if (!profileData) {
            setCouncilLogoSrc('/images/eai.png');
            return;
        }
        const resolvedOrgId = resolveOrgId(profileData); // ✅ Now guaranteed ProfileData
        const matchedCouncil = getCouncilByName(undefined, resolvedOrgId);
        setCouncilLogoSrc(
            matchedCouncil?.name ? `/images/${matchedCouncil.name}.png` : '/images/eai.png'
        );
    }, [
        profileData?.user_config?.org_id,
        profileData?.current_org_id,
        currentProject?.id,
    ]);

      /**
       * BUSINESS LOGIC: handleLogin
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleLogin logic
       * 2. Calls helper functions: instance.loginRedirect
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - instance.loginRedirect() - Function call
       *
       * WHY IT CALLS THEM:
       * - instance.loginRedirect: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls instance.loginRedirect to process data
       * Output: Computed value or side effect
       *
       */
    const handleLogin = () =>
        instance.loginRedirect({ scopes: ['openid', 'profile', 'email'], prompt: 'create' });

      /**
       * BUSINESS LOGIC: handleLogout
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleLogout logic
       * 2. Calls helper functions: resetForLogout, sessionStorage.clear, localStorage.clear, instance.logoutRedirect
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - resetForLogout() - Function call
       * - sessionStorage.clear() - Function call
       * - localStorage.clear() - Function call
       * - instance.logoutRedirect() - Function call
       *
       * WHY IT CALLS THEM:
       * - resetForLogout: State update
       * - sessionStorage.clear: Required functionality
       * - localStorage.clear: Required functionality
       * - instance.logoutRedirect: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls resetForLogout, sessionStorage.clear, localStorage.clear to process data
       * Output: Computed value or side effect
       *
       */
    const handleLogout = () => {
        resetForLogout(); // 🧼 Clear everything with a reason label
        sessionStorage.clear();
        localStorage.clear();
        instance.logoutRedirect();
    };

    // 🎯 Unified project switching handler
      /**
       * BUSINESS LOGIC: handleProjectSelection
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleProjectSelection logic
       * 2. Calls helper functions: localStorage.setItem, resetForProjectChange, setCurrentProject, initNewUserProfileConfig, setProfileData, initNewUserProfileConfig, .setProfileData, useProfileStore.getState, setIsProjectMenuOpen, .reload
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - localStorage.setItem() - Function call
       * - resetForProjectChange() - Function call
       * - setCurrentProject() - Function call
       * - initNewUserProfileConfig() - Function call
       * - setProfileData() - Function call
       * - initNewUserProfileConfig() - Function call
       * - .setProfileData() - Function call
       * - useProfileStore.getState() - Function call
       * - setIsProjectMenuOpen() - Function call
       * - .reload() - Function call
       *
       * WHY IT CALLS THEM:
       * - localStorage.setItem: State update
       * - resetForProjectChange: State update
       * - setCurrentProject: State update
       * - initNewUserProfileConfig: Required functionality
       * - setProfileData: State update
       * - initNewUserProfileConfig: Required functionality
       * - .setProfileData: State update
       * - useProfileStore.getState: Required functionality
       * - setIsProjectMenuOpen: State update
       * - .reload: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls localStorage.setItem, resetForProjectChange, setCurrentProject to process data
       * Output: Computed value or side effect
       *
       */
    const handleProjectSelection = (project: OrgProject, isNew = false, isAnon = false) => {
        localStorage.setItem("projectChange", "true");
        // ✅ Clear memory & flow flags before project switch
        resetForProjectChange(); // <- this clears chatbot memory and internal flow state
        setCurrentProject(project);
        if (!profileData) return;
        if (isNew) {
            // Create new config with default "qa" state
            const newProfile = initNewUserProfileConfig(profileData);
            useProfileStore.getState().setProfileData(newProfile);
        } else {
            // 2️⃣ or 3️⃣ Existing project → try to use stored config
            const selectedUserConfig = project.user_config;
            const resolvedUserConfig = selectedUserConfig
            ? {
                ...selectedUserConfig
              } // 1️⃣ Full replace if exists
            : initNewUserProfileConfig(profileData).user_config; // 2️⃣ Fallback to fresh config if missing
            const updatedProfile: ProfileData = {
                ...profileData,
                user_config: resolvedUserConfig,
            };
            setProfileData(updatedProfile);
        }
        setIsProjectMenuOpen(false);
        if (isAnon) {
            // 🔁 Refresh current URL instead of navigating to /dashboard
            window.location.reload();
        } else {
            window.location.href = "/dashboard";
        }
    };

    return {
        isAuthenticated,
        displayName,
        handleLogin,
        handleLogout,
        isProjectMenuOpen,
        setIsProjectMenuOpen,
        isHelpOpen,
        setIsHelpOpen,
        isProfileOpen,
        setIsProfileOpen,
        loading,
        isError,
        error,
        projects,
        setCurrentProject,
        projectRef,
        helpRef,
        profileRef,
        councilLogoSrc,
        isLoadingProfile: !profileData,
        isErrorProfile: !isAuthenticated || !profileData,
        isErrorOrg: !profileData?.current_org_id,
        isErrorToken: !token,
        isErrorCouncil: !matchedCouncil,
        profileData,
        applicationName,
        refetchProjects, // ✅ make this available to Header or other components
        handleProjectSelection
    }
}