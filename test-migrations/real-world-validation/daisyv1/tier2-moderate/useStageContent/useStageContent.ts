import { useState, useEffect, useRef, useMemo } from 'react';
import type { IStageService } from '@application/interfaces/IStageService';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import PropertyStage from '../stages/PropertyStage';
import PlanningStage from '../stages/PlanningStage';
import DocumentStage from '../stages/DocumentStage';
import SubmissionStage from '../stages/SubmissionStage';
import { useProfileStore } from '@presentation/store/useProfileStore';
import { StageType } from '@domain/entities/ApplicationStage';
import { getCouncilByName } from '../../constants/councilMappings';
import type { CreateApplicationRecordRequest } from '@application/models/CreateApplicationRecordRequest';
import { useAuthStore } from '@presentation/store/useAuthStore';
import { isUserLoggedIn } from '@presentation/components/chatbot/utils/storeHelpers';
import { useCreateSecurityGroup } from '@presentation/hooks/useCreateSecurityGroup';
import { useCreateApplicationRecord } from '@presentation/hooks/useCreateApplicationRecord';
import { useFetchOrgProjects } from '@presentation/hooks/useFetchOrgProjects';
import { safeUpdateUserConfig } from '../chatbot/utils/safeUpdateUserConfig';
import { generateUniqueProjectTitle } from '@presentation/hooks/generateUniqueProjectTitle';
interface ProjectData {
    address?: string;
    prop_id?: string | number;
    is_bushfire_zone?: boolean;
    is_flood_zone?: boolean;
    is_heritage_zone?: boolean;
    is_battle_axe_lot?: boolean;
    is_corner_lot?: boolean;
    lot_width?: number | string;
    lot_size?: number | string;
    min_lot_size?: number | string;
    max_building_height?: number | string;
    zone?: string;
    zone_description?: string;
}

const SG_FLAG_KEY = "hasCreatedSecurityGroup";
const AR_FLAG_KEY = "hasCreatedApplicationRecord";

// THIS HOOKS TAKES CARE OF LEFT SIDE PANEL MAPBOX FILLING, REDIRECTION QUERY MAPPING (previously was in dashboard), ENTRA SECURITY GROUP + APPLICATION CREATION
export const useStageContent = (
    stageService: IStageService,
    onStageChange: (stage: StageType) => void
) => {
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showBotNotification, setShowBotNotification] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const hasHandledQueryStageRedirect = useRef(false);
    const { data: securityGroup, createSecurityGroup } = useCreateSecurityGroup();
    const { data: applicantRecord, createApplicationRecord } = useCreateApplicationRecord();
    const { accessToken, anonToken } = useAuthStore();

    const {
        profileData,
        getProfileData,
        setProfileData,
        setCurrentProject,
        updateUserConfig,
        setApplicationCreated,
        isAnonymous,
        currentProject,
    } = useProfileStore();

    const userConfig = profileData?.user_config;
    const project = userConfig?.project;

    const address: string = project?.address ?? '';
    const propId: string | null = project?.prop_id?.toString() ?? null;

    // This should only trigger with accessToken
    // Have a refetchProjects to trigger as soon as we create a new application
    const shouldFetchProjects = !!profileData?.user_config?.org_id && !!accessToken;
    const { projects, refetch: refetchProjects } = useFetchOrgProjects(
        shouldFetchProjects ? profileData?.user_config?.org_id : undefined,
        shouldFetchProjects ? accessToken : undefined
    );

    const projectData: ProjectData = useMemo(() => ({
        address,
        prop_id: propId ?? undefined,
        is_bushfire_zone: project?.is_bushfire_zone,
        is_flood_zone: project?.is_flood_zone,
        is_heritage_zone: project?.is_heritage_zone,
        is_battle_axe_lot: project?.is_battle_axe_lot,
        is_corner_lot: project?.is_corner_lot,
        lot_width: project?.lot_width,
        lot_size: project?.lot_size,
        max_building_height: project?.max_building_height,
        min_lot_size: project?.min_lot_size,
        zone: project?.zone,
        zone_description: project?.zone_description,
    }), [
        address,
        propId,
        project]);

    const propertyReportLink = profileData?.property_report;

    const wasAnonymousRef = useRef<boolean | null>(null);
    useEffect(() => {
        if (wasAnonymousRef.current === null) {
            wasAnonymousRef.current = isAnonymous;
        }
    }, [isAnonymous]);

    // 🚀 Apply query params and stage redirection on mount
    useEffect(() => {
        const hasStageState = !!profileData?.user_config?.state;
        if (!hasStageState || hasHandledQueryStageRedirect.current) return;
        const existingProfile = getProfileData();
        if (!existingProfile || !existingProfile.user_config) return;
        const project = existingProfile.user_config.project;
        const councilName = project?.council_name; // already mapped earlier if needed
        const address = project?.address;
        const propId = project?.prop_id;
        const propertyReport = profileData?.property_report;
        const isAddressUndefined = !address || address === "undefined";
        const isPropIdUndefined = !propId || propId === "undefined";
        const hasPropertyInfo =
            !!address && address !== "undefined" &&
            !!propId && propId !== "undefined" &&
            !!propertyReport;
        // 🌟 Get mapped council info again if needed
        const councilMapping = getCouncilByName(councilName);
        const updatedUserConfig = {
            ...existingProfile.user_config,
            org_id: councilMapping?.entra_id || existingProfile.user_config.org_id,
            state: hasPropertyInfo ? "planning_pathway" : "qa",
        };
        setProfileData({
            ...existingProfile,
            user_config: updatedUserConfig,
        });
        console.log("[StageContent] Apply query params and stage redirection on mount");
        if (isAddressUndefined && isPropIdUndefined) {
            console.log("[StageContent] → Redirected with NO address/propId → 'property'");
            stageService.setStage("property");
            onStageChange("property");
        } else if (hasPropertyInfo) {
            // TODO: Doesn't work - always lands on planning_pathways that is what we want! (resolved)
            const isNowLoggedIn = !isAnonymous;
            if (isNowLoggedIn) {
                console.log("[StageContent] → Was anon and now logged in with full info → 'documents'");
                // stageService.setStage("documents");
                // onStageChange("documents");
            } else {
                console.log("[StageContent] → Redirected with full property info → 'project'");
                stageService.setStage("project");
                onStageChange("project");
            }
        } else {
            console.log("[StageContent] → Redirected with partial info → fallback to 'property'");
            stageService.setStage("property");
            onStageChange("property");
        }
        hasHandledQueryStageRedirect.current = true;
    }, [profileData?.user_config]); // ✅ Waits until profileData is available and in AnonState

    // ⏩ Move stage based on currentProject's user_config.state
    // TODO: Check if it works correctly
    const prevProjectIdRef = useRef<string | null>(null);
    useEffect(() => {
        const projectId = currentProject?.id ?? null;
        const rawState = userConfig?.state;
        const isInitialLoad = prevProjectIdRef.current === null;
        // ✅ Either it's a new project or we’re loading the app after a refresh
        const shouldMapStage = (projectId && (isInitialLoad || projectId !== prevProjectIdRef.current)) && rawState;
        if (!shouldMapStage) return;
        prevProjectIdRef.current = projectId;
        let mappedStage: StageType | null = null;
        switch (rawState) {
            case 'qa': mappedStage = 'property'; break;
            case 'planning_pathways': mappedStage = 'project'; break;
            case 'document_checklist': mappedStage = 'documents'; break;
            case 'application': mappedStage = 'application'; break;
            default:
                console.warn(`[useStageContent] Unknown user_config.state: ${rawState}`);
                return;
        }
        const currentStage = stageService.getStage();
        if (mappedStage && currentStage !== mappedStage) {
            console.log(`[useStageContent] (Initial/Refresh) Switching to '${mappedStage}' based on state=${rawState}`);
            stageService.setStage(mappedStage);
            onStageChange(mappedStage);
        }
    }, [currentProject?.id, userConfig?.state]);

    // 🧠 Bot message banner handler - when a new bot message comes, we show the banner, when the user starts typing, we make it disapper
    useEffect(() => {
        const handlePostMessages = (event: MessageEvent) => {
            if (typeof event.data === 'string') {
                if (event.data === 'newMessageFromChatbot') {
                    setShowBotNotification(true);
                }
                if (event.data === 'userStartedTyping') {
                    setShowBotNotification(false);
                }
            }
        };
        window.addEventListener('message', handlePostMessages);
        return () => window.removeEventListener('message', handlePostMessages);
    }, []);

    // Helper to check if a value is meaningfully present (not undefined, null, or empty string)
    const hasValue = (value: string | number | boolean | object | null | undefined): boolean => {
        if (value === undefined || value === null || value === "") {
            return false;
        }
        // Handle case for objects, assuming non-null/undefined object is considered "having a value"
        if (typeof value === 'object') {
            return true;
        }
        // For strings/numbers/booleans, the initial checks suffice
        return true;
    };

    const state = userConfig?.state;
    // const stage = stageService.getStage();
    const firstName = profileData?.first_name;
    const developmentType = userConfig?.project?.development_type;
    // Add these ref flags to track initialization status - this is for REFRESH
    const securityGroupInitiated = useRef(false);
    const applicationRecordInitiated = useRef(false);
    // Create entra security group + application name - GUARANTEED SINGLE EXECUTION only during DOC-CHECKLIST (runs in background when entering document_checklist)
    useEffect(() => {
        const user_config = getProfileData()?.user_config;
        // #1022
        const alreadyHasProjectInStore = !!currentProject?.id && currentProject.id !== "new-project";   // need to consider when the user clicks new project from dropdown (for this condition we need to trigger shouldTriggerInit)
        const alreadyHasProjectIdAndState =
        !!user_config?.project_id && user_config?.state === "document_checklist";
        // ✅ If this condition is met, mark the application as already created
        if (alreadyHasProjectInStore && alreadyHasProjectIdAndState) {
            console.log("✅ Skipping security group + app creation. Marking hasApplicationBeenCreated = true to call fetch-uploaded / checklist");
            setApplicationCreated(true);
            return; // 🔁 Skip further execution
        }
        // ✅ CHANGED: Trigger background creation when entering document_checklist state
        // Don't block document checklist fetch
        const shouldTriggerInit = (
            (state === "document_checklist") &&
            accessToken &&
            isUserLoggedIn() &&
            !securityGroup &&
            !applicantRecord &&
            !!developmentType?.trim() &&
            !securityGroupInitiated.current &&  // Only if we haven't started the process
            localStorage.getItem(SG_FLAG_KEY) !== "true"
        );
        if (!shouldTriggerInit) return;
        // ✅ CHANGED: Remove the blocking logic, start creation immediately in background
        const initializeInBackground = async () => {
            // Set flag IMMEDIATELY to prevent any possibility of double execution
            securityGroupInitiated.current = true;
            localStorage.setItem(SG_FLAG_KEY, "true"); // 🧠 Persist flag
            const token = accessToken ? accessToken : anonToken;
            // Step 1: Fetch existing project titles
            const existingTitles = projects.map(p => p.title);
            const baseTitle = `${firstName}'s ${developmentType}`;
            const finalTitle = generateUniqueProjectTitle(baseTitle, existingTitles);
            // Update application name ONLY in planning_pathway stage
            if (userConfig?.state === "planning_pathway" && profileData && developmentType) {
                safeUpdateUserConfig(
                    "user_config.project.application_name",
                    finalTitle,
                    profileData,
                    updateUserConfig
                );
            }
            console.log("🔄 Creating security group in background (after document checklist fetch started):", finalTitle);
            // Create Security Group in background with error handling
            createSecurityGroup.mutate({
                token: token || "",
                payload: {
                    title: finalTitle,
                    description: user_config?.org_id || "",
                }
            }, {
                onError: (error) => {
                    console.error("❌ Security group creation failed after all retries:", error);
                    // Reset flags to allow retry if user navigates away and back
                    securityGroupInitiated.current = false;
                    localStorage.removeItem(SG_FLAG_KEY);
                    localStorage.removeItem("documentChecklistFetchStarted");
                }
            });
        };
        initializeInBackground();
    }, [accessToken, state, firstName, developmentType]); // ✅ CHANGED: Simplified dependencies - removed stage

    // Handle security group creation success and trigger application record creation - GUARANTEED SINGLE EXECUTION
    useEffect(() => {
        // Only proceed if we have a security group AND haven't started application record creation
        if (!securityGroup || applicationRecordInitiated.current || localStorage.getItem(AR_FLAG_KEY) === "true") return;
        console.log("Security group created successfully - triggering application record creation:", securityGroup);
        // Set flag IMMEDIATELY to prevent any possibility of double execution
        applicationRecordInitiated.current = true;
        localStorage.setItem(AR_FLAG_KEY, "true"); // 🧠 Persist flag
        const token = accessToken ? accessToken : anonToken;
        // Update user config with security group info
        if (profileData) {
            safeUpdateUserConfig("user_config.project_id", securityGroup.id, profileData, updateUserConfig);
            safeUpdateUserConfig("user_config.project.application_name", securityGroup.title, profileData, updateUserConfig);
            // Update currentProject in store
            const newProject = {
                id: securityGroup.id,
                title: securityGroup.title,
                description: securityGroup.description,
            };
            setCurrentProject(newProject);
            // Refresh the project list
            refetchProjects?.();
        }
        const user_config = getProfileData()?.user_config;
        // Create Application Record with the new security group ID
        if (!user_config) {
            console.warn("❌ Cannot create application record: user_config is undefined.");
            return;
        }
        // Helper function to ensure boolean values
        const ensureBoolean = (value: unknown): boolean => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
            }
            return false; // Default to false if undefined, null, or other types
        };
        // Check and fix boolean fields before making the API call
        const project = user_config.project;
        const needsUpdate = (
            (project?.is_battle_axe_lot !== undefined && typeof project.is_battle_axe_lot !== 'boolean') ||
            (project?.is_corner_lot !== undefined && typeof project.is_corner_lot !== 'boolean') ||
            project?.is_battle_axe_lot === undefined ||
            project?.is_corner_lot === undefined
        );
        if (needsUpdate && profileData) {
            console.log("🔧 Fixing boolean fields before API call...");
            // Fix is_battle_axe_lot
            const battleAxeValue = ensureBoolean(project?.is_battle_axe_lot);
            safeUpdateUserConfig("user_config.project.is_battle_axe_lot", battleAxeValue, profileData, updateUserConfig);
            // Fix is_corner_lot
            const cornerLotValue = ensureBoolean(project?.is_corner_lot);
            safeUpdateUserConfig("user_config.project.is_corner_lot", cornerLotValue, profileData, updateUserConfig);
            // Wait for the updates to be applied before making the API call
            setTimeout(() => {
                const updatedUserConfig = getProfileData()?.user_config;
                if (updatedUserConfig) {
                    console.log("✅ Boolean fields updated, creating application record...");
                    console.log("Updated boolean values:", {
                        is_battle_axe_lot: updatedUserConfig.project?.is_battle_axe_lot,
                        is_corner_lot: updatedUserConfig.project?.is_corner_lot
                    });
                    const createARPayload: CreateApplicationRecordRequest = {
                        user_config: updatedUserConfig,
                    };
                    console.log("Creating application record with security group ID:", securityGroup.id);
                    createApplicationRecord.mutate({ 
                        token: token || '', 
                        payload: createARPayload
                    }, {
                        onError: (error) => {
                            console.error("❌ Application record creation failed after all retries:", error);
                            // Reset flags to allow retry if user navigates away and back
                            applicationRecordInitiated.current = false;
                            localStorage.removeItem(AR_FLAG_KEY);
                        }
                    });
                }
            }, 100); // Small delay to ensure state updates are applied
        } else {
            // Boolean fields are already correct, proceed with API call
            console.log("✅ Boolean fields are correct, creating application record...");
            const createARPayload: CreateApplicationRecordRequest = {
                user_config,
            };
            console.log("Creating application record with security group ID:", securityGroup.id);
            createApplicationRecord.mutate({ 
                token: token || '', 
                payload: createARPayload
            }, {
                onError: (error) => {
                    console.error("❌ Application record creation failed after all retries:", error);
                    // Reset flags to allow retry if user navigates away and back
                    applicationRecordInitiated.current = false;
                    localStorage.removeItem(AR_FLAG_KEY);
                }
            });
        }
    }, [securityGroup]);  // Keep minimal dependencies

    useEffect(() => {
        if (securityGroup) {
            console.log("Security group created successfully:", securityGroup);
            // Update application_name + project_id in user_config
            if (profileData) {
                safeUpdateUserConfig("user_config.project_id", securityGroup.id, profileData, updateUserConfig);
                safeUpdateUserConfig("user_config.project.application_name", securityGroup.title, profileData, updateUserConfig);
            }
            // Also update currentProject in store
            const newProject = {
                id: securityGroup.id,
                title: securityGroup.title,
                description: securityGroup.description,
            };
            setCurrentProject(newProject);
            // ✅ Refresh the project list
            refetchProjects?.();
        }
        if (applicantRecord?.dataverse_application_id) {
            console.log("✅ Application record created, setting hasApplicationBeenCreated = true");
            setApplicationCreated(true);
        }
    }, [securityGroup, applicantRecord]);

    return {
        isAuthenticated,
        instance,
        isSidebarOpen,
        setIsSidebarOpen,
        showBotNotification,
        setShowBotNotification,
        address,
        propId,
        projectData,
        profileData,
        userConfig,
        propertyReportLink,
        hasValue,
        stageService,
        onStageChange,
        PropertyStage,
        PlanningStage,
        DocumentStage,
        SubmissionStage,
        isChatOpen,
        setIsChatOpen,
    };
};