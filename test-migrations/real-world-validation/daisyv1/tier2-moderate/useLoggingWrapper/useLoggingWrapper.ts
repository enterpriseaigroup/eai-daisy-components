import { useEffect, useState } from 'react';
import { getValidAccessToken } from '../utils/auth';
import {
    getAuthStoreValue,
    getProfileStoreValue,
    isUserLoggedIn,
} from '../utils/storeHelpers';
import { ChatMessage, Project } from '@domain/entities/ProfileData';
import { useChatCard } from '@presentation/hooks/useChatCard';
import type { ChatCardResponse } from '@application/models/ChatCardResponse';
import type { ChatCardRequest } from '@application/models/ChatCardRequest';
import { useLocalStorage } from 'react-haiku';
import type { ChatHistoryResponse } from '@application/models/ChatHistoryResponse';
import { useApiStatusStore } from '@presentation/store/useApiStatusStore';

async function prepareRequestBody(messageObject: ChatMessage, council: string) {
    const accessToken = await getValidAccessToken(council);
    if (!accessToken) return null;

    const { entraOrgId } = getAuthStoreValue();
    if (!entraOrgId) return null;

    const profileData = getProfileStoreValue();
    const loggedIn = isUserLoggedIn();
    const firstName = loggedIn ? profileData?.first_name : 'Anonymous';
    const lastName = loggedIn ? profileData?.last_name : 'User';
    const email = loggedIn ? profileData?.email_address : '';
    const userId = loggedIn ? profileData?.id : profileData?.user_config?.conversation_id;
    const entraId = loggedIn ? profileData?.current_org_id : entraOrgId;
    const projectDataObject = profileData?.user_config?.project;
    const policiesDataObject = profileData?.user_config?.policies;

    const fallbackProject: Project = {
        council_name: "",
        address: profileData?.user_config?.project?.address ?? "",
        zone: profileData?.user_config?.project?.zone ?? "",
        zone_description: profileData?.user_config?.project?.zone_description ?? "",
        prop_id: profileData?.user_config?.project?.prop_id ?? "",
        lot_width: profileData?.user_config?.project?.lot_width ?? "",
        lot_size: profileData?.user_config?.project?.lot_size ?? "",
        is_bushfire_zone: profileData?.user_config?.project?.is_bushfire_zone ?? false,
        is_flood_zone: profileData?.user_config?.project?.is_flood_zone ?? false,
        is_heritage_zone: profileData?.user_config?.project?.is_heritage_zone ?? false,
        min_lot_size: profileData?.user_config?.project?.min_lot_size ?? "",
        max_building_height: profileData?.user_config?.project?.max_building_height ?? "",
        dwelling_density: profileData?.user_config?.project?.dwelling_density ?? "",
        is_battle_axe_lot: profileData?.user_config?.project?.is_battle_axe_lot ?? false,
        is_corner_lot: profileData?.user_config?.project?.is_corner_lot ?? false,
        active_precinct: profileData?.user_config?.project?.active_precinct ?? "",
        application_name: profileData?.user_config?.project?.application_name ?? "",
        development_type: profileData?.user_config?.project?.development_type ?? "",
        planning_pathway: profileData?.user_config?.project?.planning_pathway ?? "",
        building_height: profileData?.user_config?.project?.building_height ?? "",
        sub_division: profileData?.user_config?.project?.sub_division ?? "",
        front_setback: profileData?.user_config?.project?.front_setback ?? "",
        side_setback: profileData?.user_config?.project?.side_setback ?? "",
        rear_setback: profileData?.user_config?.project?.rear_setback ?? "",
        matched_pathways: profileData?.user_config?.project?.matched_pathways ?? [],
        failed_pathways: profileData?.user_config?.project?.failed_pathways?? [],
        additional_criteria: profileData?.user_config?.project?.additional_criteria ?? "",
        child_restraint_barriers: profileData?.user_config?.project?.child_restraint_barriers ?? "",
        project_size: profileData?.user_config?.project?.project_size ?? "",
        flags: profileData?.user_config?.project?.flags ?? {},
        documents: profileData?.user_config?.project?.documents ?? [],
        uploaded_documents: profileData?.user_config?.project?.uploaded_documents ?? [],
    };

    const payload: ChatCardRequest = {
        requestBody: {
            message: messageObject,
            user_config: {
                org_id: entraId ?? "noOrgId",
                project_id: profileData?.user_config?.project_id ?? "",
                conversation_id: profileData?.user_config?.conversation_id ?? "",
                country: 'Australia',
                first_name: firstName || "",
                last_name: lastName || "",
                email: email || "",
                user_id: userId || "",
                state: profileData?.user_config?.state || 'qa',
                stream: true,
                workflow: {
                    next_action: profileData?.user_config?.workflow?.next_action ?? "",
                    chat_migrated: !!profileData?.user_config?.workflow?.chat_migrated,
                    execution_logs: profileData?.user_config?.workflow?.execution_logs ?? {},
                },
                project: projectDataObject ?? fallbackProject,
                policies: policiesDataObject ?? {
                    state: {
                        SEP: profileData?.user_config?.policies?.state?.SEP ?? "",
                        SEP_public_link: profileData?.user_config?.policies?.state?.SEP_public_link ?? "",
                        pol_min_lot_size: profileData?.user_config?.policies?.state?.pol_min_lot_size ?? "",
                        pol_min_lot_width: profileData?.user_config?.policies?.state?.pol_min_lot_width ?? "",
                        pol_max_FSR: profileData?.user_config?.policies?.state?.pol_max_FSR ?? "",
                        pol_max_building_height: profileData?.user_config?.policies?.state?.pol_max_building_height ?? "",
                        pol_max_building_depth: profileData?.user_config?.policies?.state?.pol_max_building_depth ?? "",
                        pol_max_building_separation: profileData?.user_config?.policies?.state?.pol_max_building_separation ?? "",
                        pol_max_site_coverage: profileData?.user_config?.policies?.state?.pol_max_site_coverage ?? "",
                        pol_allowed_use_types: profileData?.user_config?.policies?.state?.pol_allowed_use_types ?? "",
                        pol_basix_energy_target: profileData?.user_config?.policies?.state?.pol_basix_energy_target ?? "",
                        pol_basix_water_target: profileData?.user_config?.policies?.state?.pol_basix_water_target ?? "",
                        pol_bushfire_attack_level: profileData?.user_config?.policies?.state?.pol_bushfire_attack_level ?? "",
                        pol_coastal_vulnerability: profileData?.user_config?.policies?.state?.pol_coastal_vulnerability ?? "",
                        pol_foreshore_building_line: profileData?.user_config?.policies?.state?.pol_foreshore_building_line ?? "",
                        pol_front_setback: profileData?.user_config?.policies?.state?.pol_front_setback ?? "",
                        pol_gsyd_tree_canopy_2019: profileData?.user_config?.policies?.state?.pol_gsyd_tree_canopy_2019 ?? "",
                        pol_gsyd_tree_canopy_2022: profileData?.user_config?.policies?.state?.pol_gsyd_tree_canopy_2022 ?? "",
                        pol_housing_prod_contribution: profileData?.user_config?.policies?.state?.pol_housing_prod_contribution ?? "",
                        pol_is_flood_prone: profileData?.user_config?.policies?.state?.pol_is_flood_prone ?? "",
                        pol_is_heritage_item: profileData?.user_config?.policies?.state?.pol_is_heritage_item ?? "",
                        pol_land_reservation_acquisition: profileData?.user_config?.policies?.state?.pol_land_reservation_acquisition ?? "",
                        pol_landscaped_pct: profileData?.user_config?.policies?.state?.pol_landscaped_pct ?? "",
                        pol_privacy_separation: profileData?.user_config?.policies?.state?.pol_privacy_separation ?? "",
                        pol_rear_setback: profileData?.user_config?.policies?.state?.pol_rear_setback ?? "",
                        pol_regional_plan_boundary: profileData?.user_config?.policies?.state?.pol_regional_plan_boundary ?? "",
                        pol_salinity: profileData?.user_config?.policies?.state?.pol_salinity ?? "",
                        pol_side_setback: profileData?.user_config?.policies?.state?.pol_side_setback ?? "",
                        pol_solar_access: profileData?.user_config?.policies?.state?.pol_solar_access ?? "",
                        pol_acid_sulfate_class: profileData?.user_config?.policies?.state?.pol_acid_sulfate_class ?? ""
                    },
                    local: {
                        DCP: profileData?.user_config?.policies?.local?.DCP ?? "",
                        DCP_public_link: profileData?.user_config?.policies?.local?.DCP_public_link ?? "",
                        LEP: profileData?.user_config?.policies?.local?.LEP ?? "",
                        LEP_public_link: profileData?.user_config?.policies?.local?.LEP_public_link ?? "",
                        pol_min_lot_size: profileData?.user_config?.policies?.local?.pol_min_lot_size ?? "",
                        pol_max_FSR: profileData?.user_config?.policies?.local?.pol_max_FSR ?? "",
                        pol_max_building_depth: profileData?.user_config?.policies?.local?.pol_max_building_depth ?? "",
                        pol_max_building_height: profileData?.user_config?.policies?.local?.pol_max_building_height ?? "",
                        pol_max_building_separation: profileData?.user_config?.policies?.local?.pol_max_building_separation ?? "",
                        pol_max_site_coverage: profileData?.user_config?.policies?.local?.pol_max_site_coverage ?? "",
                        pol_is_heritage_area: profileData?.user_config?.policies?.local?.pol_is_heritage_area ?? "",
                        pol_land_zone: profileData?.user_config?.policies?.local?.pol_land_zone ?? "",
                        pol_landscaped_pct: profileData?.user_config?.policies?.local?.pol_landscaped_pct ?? "",
                        pol_land_council: profileData?.user_config?.policies?.local?.pol_land_council ?? "",
                        pol_provisions: profileData?.user_config?.policies?.local?.pol_provisions ?? "",
                        pol_permitted_use: profileData?.user_config?.policies?.local?.pol_permitted_use ?? ""
                    }
                }
            }
        }
    };

    return {
        token: accessToken,
        payload
    };
}

// TODO: isRefresh is not being triggered on page reload. Need to check if this is a bug in the library or if we need to handle it differently. (resolved)
export const useLoggingWrapper = (messageObject: ChatMessage, council: string, shouldLog: boolean) => {
    const { data: chatCardData, chatCard } = useChatCard();
    const { isError } = chatCard;
    const [value] = useLocalStorage<ChatHistoryResponse[]>('chatHistory', []);
    const [message, setLogMessage] = useState<ChatCardResponse | null>(null);
    const { apiStatuses, setApiStatus } = useApiStatusStore();
    const [request, setRequest] = useState<{ token: string, payload: ChatCardRequest }>({} as { token: string, payload: ChatCardRequest });
    // 1. Parse out whatever's already in LS
    // 2. Check the Navigation API (only)
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const navType = navEntries[0]?.type;
    const legacyNav = (performance as Performance & { navigation: PerformanceNavigation }).navigation?.type === PerformanceNavigation.TYPE_RELOAD;
    // 3. We only treat it as a "refresh" if we already had LS data and the browser really reloaded.
    const isRefresh = !!value && (navType === 'reload' || legacyNav);

    useEffect(() => {
        if (!shouldLog) return;
        const fetchData = async () => {
            const requestBody = await prepareRequestBody(messageObject, council);
            if (requestBody) setRequest(requestBody);
        };
        fetchData();
    }, [shouldLog, messageObject, council]);

    // useEffect(() => {
    //     const historyLoad = async (token: string, payload: ChatCardRequest) => {

    //         try {
    //             if (!apiStatuses?.['chat-card']?.status) {
    //                 setApiStatus("chat-card", { status: "loading" }); // Set the ref to true to prevent multiple calls
    //                 const response = await chatCard.mutateAsync({ token, payload },
    //                     {
    //                         onSuccess: (response) => {
    //                             console.log("Logging message successfully:", response);
    //                             setLogMessage(response); // Update the logMessage state with the response
    //                             setApiStatus("chat-card", { status: "success" }); // Update the API status to success
    //                         },
    //                         onError: (error: Error) => {
    //                             console.error("Error logging message:", error);
    //                             setLogMessage(null); // Reset the logMessage state on error
    //                             setApiStatus("chat-card", { status: "error" }); // Update the API status to error
    //                         },
    //                     });

    //                 return response;
    //             }
    //         } catch (error) {
    //             console.error("Error logging message:", error);
    //             setApiStatus("chat-card", { status: "error" }); // Update the API status to error
    //             return null;
    //         }
    //     };

    //     const isChatHistory = value?.some((item: ChatHistoryResponse) => item.name === 'GetStartedCard' || item.name === 'AddressCard');

    //     console.log("isChatHistory:", isChatHistory);
    //     console.log("isRefresh:", isRefresh);
    //     console.log("apiStatuses:", apiStatuses);
    //     if (isChatHistory && request.token && request.payload && !isPending && !isSuccess && !isError) {
    //         // TODO: Introduce refresh logic
    //         historyLoad(request.token, request.payload);
    //     }
    // }, [value, request.token, request.payload, isRefresh, apiStatuses, isPending, isSuccess, isError, chatCard, setApiStatus]); // <-- Add messageObject and council to dependencies

    // Effects on chatCard.mutateAsync when !apiStatuses?.['chat-card']?.status
    useEffect(() => {
        if (!apiStatuses?.['chat-card']?.status && request.token && request.payload) {
            chatCard.mutate({ token: request.token, payload: request.payload });
        }
    } , [isRefresh, request.token, request.payload, apiStatuses?.['chat-card']?.status]); // <-- Add messageObject and council to dependencies

    // Effects on setLogMessage and SetApiStatus when chatCardData is updated
    useEffect(() => {
        if (chatCardData) {
            setLogMessage(chatCardData); // Update the logMessage state with the response
            setApiStatus("chat-card", { status: "success" }); // Update the API status to success
        }
    } , [chatCardData, setApiStatus]); // <-- Add messageObject and council to dependencies

    useEffect(() => {
        if (isError) {
            console.error("Error logging message:", isError);
            setLogMessage(null); // Reset the logMessage state on error
            setApiStatus("chat-card", { status: "error" }); // Update the API status to error
        }
    }, [isError, setApiStatus]); // <-- Add messageObject and council to dependencies

    return { message };
}