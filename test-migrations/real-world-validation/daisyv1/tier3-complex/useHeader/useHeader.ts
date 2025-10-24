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

    const handleLogin = () =>
        instance.loginRedirect({ scopes: ['openid', 'profile', 'email'], prompt: 'create' });

    const handleLogout = () => {
        resetForLogout(); // 🧼 Clear everything with a reason label
        sessionStorage.clear();
        localStorage.clear();
        instance.logoutRedirect();
    };

    // 🎯 Unified project switching handler
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