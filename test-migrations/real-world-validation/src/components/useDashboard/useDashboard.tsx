/**
 * useDashboard - Configurator V2 Component
 *
 * Component useDashboard from useDashboard.ts
 *
 * @migrated from DAISY v1
 */

// import { monitorLocalStorageClear } from "@presentation/hooks/storageMonitor"; // USE WHEN USING customApiStorage
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import { useProfileData } from "@presentation/hooks/useProfileData";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { createDefaultUserConfig, ProfileData, Project, Policies, UserConfig } from "@domain/entities/ProfileData";
import { useTokenAndProfile } from './useTokenAndProfile';
import { getCouncilByName, getCouncilNameByEntraId } from '../constants/councilMappings';
import pako from 'pako';
import { handleApiError } from "./handleApiError";

const PREV_ORG_ID_STORAGE_KEY = 'previousOrgId';

  /**
   * BUSINESS LOGIC: decompressFromBase64
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements decompressFromBase64 logic
   * 2. Calls helper functions: base64Str.replace, atob, .map, ch.charCodeAt, pako.inflate, JSON.parse, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - base64Str.replace() - Function call
   * - atob() - Function call
   * - .map() - Function call
   * - ch.charCodeAt() - Function call
   * - pako.inflate() - Function call
   * - JSON.parse() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - base64Str.replace: Required functionality
   * - atob: Required functionality
   * - .map: Required functionality
   * - ch.charCodeAt: Required functionality
   * - pako.inflate: Required functionality
   * - JSON.parse: Required functionality
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls base64Str.replace, atob, .map to process data
   * Output: Computed value or side effect
   *
   */
function decompressFromBase64<T = unknown>(base64Str: string): T | undefined {
    if (!base64Str) return undefined;
    try {
        const decoded = base64Str.replace(/ /g, '+');
        const binaryString = atob(decoded);
        const binaryArray = new Uint8Array([...binaryString].map((ch) => ch.charCodeAt(0)));
        const decompressed = pako.inflate(binaryArray, { to: 'string' });
        return JSON.parse(decompressed) as T;
    } catch (error) {
        console.error("[useDashboard] Failed to decompress or parse:", error);
        return undefined;
    }
}

  /**
   * BUSINESS LOGIC: safeMergeProject
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements safeMergeProject logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
function safeMergeProject(
    base: Project,
    partial?: Partial<Project>
): Project {
    if (!partial) return base;
    return {
        council_name: partial.council_name && partial.council_name !== '' ? partial.council_name : base.council_name,
        address: partial.address && partial.address !== '' ? partial.address : base.address,
        zone: partial.zone && partial.zone !== '' ? partial.zone : base.zone,
        zone_description: partial.zone_description && partial.zone_description !== '' ? partial.zone_description : base.zone_description,
        prop_id: partial.prop_id && partial.prop_id !== '' ? partial.prop_id : base.prop_id,
        active_precinct: partial.active_precinct && partial.active_precinct !== '' ? partial.active_precinct : base.active_precinct,
        application_name: partial.application_name && partial.application_name !== '' ? partial.application_name : base.application_name,
        development_type: partial.development_type && partial.development_type !== '' ? partial.development_type : base.development_type,
        planning_pathway: partial.planning_pathway && partial.planning_pathway !== '' ? partial.planning_pathway : base.planning_pathway,
        lot_width: partial.lot_width && partial.lot_width !== '' ? partial.lot_width : base.lot_width,
        lot_size: partial.lot_size && partial.lot_size !== '' ? partial.lot_size : base.lot_size,
        project_size: partial.project_size && partial.project_size !== '' ? partial.project_size : base.project_size,
        building_height: partial.building_height && partial.building_height !== '' ? partial.building_height : base.building_height,
        sub_division: partial.sub_division && partial.sub_division !== '' ? partial.sub_division : base.sub_division,
        front_setback: partial.front_setback && partial.front_setback !== '' ? partial.front_setback : base.front_setback,
        side_setback: partial.side_setback && partial.side_setback !== '' ? partial.side_setback : base.side_setback,
        rear_setback: partial.rear_setback && partial.rear_setback !== '' ? partial.rear_setback : base.rear_setback,
        is_bushfire_zone: partial.is_bushfire_zone ?? base.is_bushfire_zone,
        is_flood_zone: partial.is_flood_zone ?? base.is_flood_zone,
        is_heritage_zone: partial.is_heritage_zone ?? base.is_heritage_zone,
        matched_pathways: partial.matched_pathways ?? base.matched_pathways,
        failed_pathways: partial.failed_pathways ?? base.failed_pathways,
        additional_criteria: partial.additional_criteria && partial.additional_criteria !== '' ? partial.additional_criteria : base.additional_criteria,
        child_restraint_barriers: partial.child_restraint_barriers && partial.child_restraint_barriers !== '' ? partial.child_restraint_barriers : base.child_restraint_barriers,
        min_lot_size: partial.min_lot_size && partial.min_lot_size !== '' ? partial.min_lot_size : base.min_lot_size,
        max_building_height: partial.max_building_height && partial.max_building_height !== '' ? partial.max_building_height : base.max_building_height,
        dwelling_density: partial.dwelling_density && partial.dwelling_density !== '' ? partial.dwelling_density : base.dwelling_density,
        is_battle_axe_lot: partial.is_battle_axe_lot ?? base.is_battle_axe_lot,
        is_corner_lot: partial.is_corner_lot ?? base.is_corner_lot,
        documents: partial.documents ?? base.documents,
        uploaded_documents: partial.uploaded_documents ?? base.uploaded_documents,
        flags: partial.flags ?? base.flags,
    };
}

  /**
   * BUSINESS LOGIC: safeMergePolicies
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements safeMergePolicies logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
export function safeMergePolicies(
    base: Policies,
    partial?: Partial<Policies>
): Policies {
    if (!partial) return base;
    return {
        state: {
            SEP: partial.state?.SEP && partial.state.SEP !== '' ? partial.state.SEP : base.state.SEP,
            SEP_public_link: partial.state?.SEP_public_link && partial.state.SEP_public_link !== '' ? partial.state.SEP_public_link : base.state.SEP_public_link,
            pol_min_lot_size: partial.state?.pol_min_lot_size && partial.state.pol_min_lot_size !== '' ? partial.state.pol_min_lot_size : base.state.pol_min_lot_size,
            pol_min_lot_width: partial.state?.pol_min_lot_width && partial.state.pol_min_lot_width !== '' ? partial.state.pol_min_lot_width : base.state.pol_min_lot_width,
            pol_max_FSR: partial.state?.pol_max_FSR && partial.state.pol_max_FSR !== '' ? partial.state.pol_max_FSR : base.state.pol_max_FSR,
            pol_max_building_height: partial.state?.pol_max_building_height && partial.state.pol_max_building_height !== '' ? partial.state.pol_max_building_height : base.state.pol_max_building_height,
            pol_max_building_depth: partial.state?.pol_max_building_depth && partial.state.pol_max_building_depth !== '' ? partial.state.pol_max_building_depth : base.state.pol_max_building_depth,
            pol_max_building_separation: partial.state?.pol_max_building_separation && partial.state.pol_max_building_separation !== '' ? partial.state.pol_max_building_separation : base.state.pol_max_building_separation,
            pol_max_site_coverage: partial.state?.pol_max_site_coverage && partial.state.pol_max_site_coverage !== '' ? partial.state.pol_max_site_coverage : base.state.pol_max_site_coverage,
            pol_allowed_use_types: partial.state?.pol_allowed_use_types && partial.state.pol_allowed_use_types !== '' ? partial.state.pol_allowed_use_types : base.state.pol_allowed_use_types,
            pol_basix_energy_target: partial.state?.pol_basix_energy_target && partial.state.pol_basix_energy_target !== '' ? partial.state.pol_basix_energy_target : base.state.pol_basix_energy_target,
            pol_basix_water_target: partial.state?.pol_basix_water_target && partial.state.pol_basix_water_target !== '' ? partial.state.pol_basix_water_target : base.state.pol_basix_water_target,
            pol_bushfire_attack_level: partial.state?.pol_bushfire_attack_level && partial.state.pol_bushfire_attack_level !== '' ? partial.state.pol_bushfire_attack_level : base.state.pol_bushfire_attack_level,
            pol_coastal_vulnerability: partial.state?.pol_coastal_vulnerability && partial.state.pol_coastal_vulnerability !== '' ? partial.state.pol_coastal_vulnerability : base.state.pol_coastal_vulnerability,
            pol_foreshore_building_line: partial.state?.pol_foreshore_building_line && partial.state.pol_foreshore_building_line !== '' ? partial.state.pol_foreshore_building_line : base.state.pol_foreshore_building_line,
            pol_front_setback: partial.state?.pol_front_setback && partial.state.pol_front_setback !== '' ? partial.state.pol_front_setback : base.state.pol_front_setback,
            pol_gsyd_tree_canopy_2019: partial.state?.pol_gsyd_tree_canopy_2019 && partial.state.pol_gsyd_tree_canopy_2019 !== '' ? partial.state.pol_gsyd_tree_canopy_2019 : base.state.pol_gsyd_tree_canopy_2019,
            pol_gsyd_tree_canopy_2022: partial.state?.pol_gsyd_tree_canopy_2022 && partial.state.pol_gsyd_tree_canopy_2022 !== '' ? partial.state.pol_gsyd_tree_canopy_2022 : base.state.pol_gsyd_tree_canopy_2022,
            pol_housing_prod_contribution: partial.state?.pol_housing_prod_contribution && partial.state.pol_housing_prod_contribution !== '' ? partial.state.pol_housing_prod_contribution : base.state.pol_housing_prod_contribution,
            pol_is_flood_prone: partial.state?.pol_is_flood_prone && partial.state.pol_is_flood_prone !== '' ? partial.state.pol_is_flood_prone : base.state.pol_is_flood_prone,
            pol_is_heritage_item: partial.state?.pol_is_heritage_item && partial.state.pol_is_heritage_item !== '' ? partial.state.pol_is_heritage_item : base.state.pol_is_heritage_item,
            pol_land_reservation_acquisition: partial.state?.pol_land_reservation_acquisition && partial.state.pol_land_reservation_acquisition !== '' ? partial.state.pol_land_reservation_acquisition : base.state.pol_land_reservation_acquisition,
            pol_landscaped_pct: partial.state?.pol_landscaped_pct && partial.state.pol_landscaped_pct !== '' ? partial.state.pol_landscaped_pct : base.state.pol_landscaped_pct,
            pol_privacy_separation: partial.state?.pol_privacy_separation && partial.state.pol_privacy_separation !== '' ? partial.state.pol_privacy_separation : base.state.pol_privacy_separation,
            pol_rear_setback: partial.state?.pol_rear_setback && partial.state.pol_rear_setback !== '' ? partial.state.pol_rear_setback : base.state.pol_rear_setback,
            pol_regional_plan_boundary: partial.state?.pol_regional_plan_boundary && partial.state.pol_regional_plan_boundary !== '' ? partial.state.pol_regional_plan_boundary : base.state.pol_regional_plan_boundary,
            pol_salinity: partial.state?.pol_salinity && partial.state.pol_salinity !== '' ? partial.state.pol_salinity : base.state.pol_salinity,
            pol_side_setback: partial.state?.pol_side_setback && partial.state.pol_side_setback !== '' ? partial.state.pol_side_setback : base.state.pol_side_setback,
            pol_solar_access: partial.state?.pol_solar_access && partial.state.pol_solar_access !== '' ? partial.state.pol_solar_access : base.state.pol_solar_access,
            pol_acid_sulfate_class: partial.state?.pol_acid_sulfate_class && partial.state.pol_acid_sulfate_class !== '' ? partial.state.pol_acid_sulfate_class : base.state.pol_acid_sulfate_class,
        },
        local: {
            DCP: partial.local?.DCP && partial.local.DCP !== '' ? partial.local.DCP : base.local.DCP,
            DCP_public_link: partial.local?.DCP_public_link && partial.local.DCP_public_link !== '' ? partial.local.DCP_public_link : base.local.DCP_public_link,
            LEP: partial.local?.LEP && partial.local.LEP !== '' ? partial.local.LEP : base.local.LEP,
            LEP_public_link: partial.local?.LEP_public_link && partial.local.LEP_public_link !== '' ? partial.local.LEP_public_link : base.local.LEP_public_link,
            pol_min_lot_size: partial.local?.pol_min_lot_size && partial.local.pol_min_lot_size !== '' ? partial.local.pol_min_lot_size : base.local.pol_min_lot_size,
            pol_max_FSR: partial.local?.pol_max_FSR && partial.local.pol_max_FSR !== '' ? partial.local.pol_max_FSR : base.local.pol_max_FSR,
            pol_max_building_depth: partial.local?.pol_max_building_depth && partial.local.pol_max_building_depth !== '' ? partial.local.pol_max_building_depth : base.local.pol_max_building_depth,
            pol_max_building_height: partial.local?.pol_max_building_height && partial.local.pol_max_building_height !== '' ? partial.local.pol_max_building_height : base.local.pol_max_building_height,
            pol_max_building_separation: partial.local?.pol_max_building_separation && partial.local.pol_max_building_separation !== '' ? partial.local.pol_max_building_separation : base.local.pol_max_building_separation,
            pol_max_site_coverage: partial.local?.pol_max_site_coverage && partial.local.pol_max_site_coverage !== '' ? partial.local.pol_max_site_coverage : base.local.pol_max_site_coverage,
            pol_is_heritage_area: partial.local?.pol_is_heritage_area && partial.local.pol_is_heritage_area !== '' ? partial.local.pol_is_heritage_area : base.local.pol_is_heritage_area,
            pol_land_zone: partial.local?.pol_land_zone && partial.local.pol_land_zone !== '' ? partial.local.pol_land_zone : base.local.pol_land_zone,
            pol_landscaped_pct: partial.local?.pol_landscaped_pct && partial.local.pol_landscaped_pct !== '' ? partial.local.pol_landscaped_pct : base.local.pol_landscaped_pct,
            pol_land_council: partial.local?.pol_land_council && partial.local.pol_land_council !== '' ? partial.local.pol_land_council : base.local.pol_land_council,
            pol_provisions: partial.local?.pol_provisions && partial.local.pol_provisions !== '' ? partial.local.pol_provisions : base.local.pol_provisions,
            pol_permitted_use: partial.local?.pol_permitted_use && partial.local.pol_permitted_use !== '' ? partial.local.pol_permitted_use : base.local.pol_permitted_use,
        }
    };
}

  /**
   * BUSINESS LOGIC: parseJwt
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements parseJwt logic
   * 2. Calls helper functions: token.split, .replace, base64Url.replace, decodeURIComponent, .join, .map, .slice, .toString, c.charCodeAt, .split, atob, JSON.parse, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - token.split() - Function call
   * - .replace() - Function call
   * - base64Url.replace() - Function call
   * - decodeURIComponent() - Function call
   * - .join() - Function call
   * - .map() - Function call
   * - .slice() - Function call
   * - .toString() - Function call
   * - c.charCodeAt() - Function call
   * - .split() - Function call
   * - atob() - Function call
   * - JSON.parse() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - token.split: Required functionality
   * - .replace: Required functionality
   * - base64Url.replace: Required functionality
   * - decodeURIComponent: Required functionality
   * - .join: Required functionality
   * - .map: Required functionality
   * - .slice: Required functionality
   * - .toString: Required functionality
   * - c.charCodeAt: Required functionality
   * - .split: Required functionality
   * - atob: Required functionality
   * - JSON.parse: Required functionality
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls token.split, .replace, base64Url.replace to process data
   * Output: Computed value or side effect
   *
   */
function parseJwt(token: string): { exp?: number } {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("[useDashboard] Failed to parse JWT:", e);
        return {};
    }
}

  /**
   * BUSINESS LOGIC: createAnonymousProfile
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements createAnonymousProfile logic
   * 2. Returns computed result
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Processes data and applies business logic
   * Output: Computed value or side effect
   *
   */
const createAnonymousProfile = (): ProfileData => ({
    id: "AnonymousUser",
    first_name: "Anonymous",
    last_name: "User",
    email_address: "",
    current_org_id: "",
    historic_org_ids: [],
    role: "applicant",
    security_groups_owned: [],
    security_groups_member_of: [],
});

  /**
   * BUSINESS LOGIC: useDashboard
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useDashboard logic
   * 2. Calls helper functions: useSearchParams, useIsAuthenticated, useState, useProfileStore.getState, useMemo, decodeURIComponent, searchParams.entries, useProfileData, useTokenAndProfile, console.log, handleApiError, console.error, useEffect, getProfileData, console.log, createAnonymousProfile, params.forEach, decodeURIComponent, console.log, getCouncilByName, String, getCouncilNameByEntraId, parseJwt, console.warn, isValidParam, createDefaultUserConfig, isValidParam, isValidParam, isValidParam, isValidParam, isValidParam, isValidParam, isValidParam, decompressFromBase64, safeMergeProject, isValidParam, decompressFromBase64, safeMergePolicies, isValidParam, setNewProfileData, console.log, useEffect, setProfileData, useEffect, localStorage.getItem, console.log, localStorage.removeItem, localStorage.setItem
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useSearchParams() - Function call
   * - useIsAuthenticated() - Function call
   * - useState() - Function call
   * - useProfileStore.getState() - Function call
   * - useMemo() - Function call
   * - decodeURIComponent() - Function call
   * - searchParams.entries() - Function call
   * - useProfileData() - Function call
   * - useTokenAndProfile() - Function call
   * - console.log() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - useEffect() - Function call
   * - getProfileData() - Function call
   * - console.log() - Function call
   * - createAnonymousProfile() - Function call
   * - params.forEach() - Function call
   * - decodeURIComponent() - Function call
   * - console.log() - Function call
   * - getCouncilByName() - Function call
   * - String() - Function call
   * - getCouncilNameByEntraId() - Function call
   * - parseJwt() - Function call
   * - console.warn() - Function call
   * - isValidParam() - Function call
   * - createDefaultUserConfig() - Function call
   * - isValidParam() - Function call
   * - isValidParam() - Function call
   * - isValidParam() - Function call
   * - isValidParam() - Function call
   * - isValidParam() - Function call
   * - isValidParam() - Function call
   * - isValidParam() - Function call
   * - decompressFromBase64() - Function call
   * - safeMergeProject() - Function call
   * - isValidParam() - Function call
   * - decompressFromBase64() - Function call
   * - safeMergePolicies() - Function call
   * - isValidParam() - Function call
   * - setNewProfileData() - Function call
   * - console.log() - Function call
   * - useEffect() - Function call
   * - setProfileData() - Function call
   * - useEffect() - Function call
   * - localStorage.getItem() - Function call
   * - console.log() - Function call
   * - localStorage.removeItem() - Function call
   * - localStorage.setItem() - Function call
   *
   * WHY IT CALLS THEM:
   * - useSearchParams: Required functionality
   * - useIsAuthenticated: Required functionality
   * - useState: Required functionality
   * - useProfileStore.getState: Required functionality
   * - useMemo: Required functionality
   * - decodeURIComponent: Required functionality
   * - searchParams.entries: Required functionality
   * - useProfileData: Required functionality
   * - useTokenAndProfile: State update
   * - console.log: Debugging output
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - useEffect: Required functionality
   * - getProfileData: Required functionality
   * - console.log: Debugging output
   * - createAnonymousProfile: Required functionality
   * - params.forEach: Required functionality
   * - decodeURIComponent: Required functionality
   * - console.log: Debugging output
   * - getCouncilByName: Required functionality
   * - String: Required functionality
   * - getCouncilNameByEntraId: Required functionality
   * - parseJwt: Required functionality
   * - console.warn: Warning notification
   * - isValidParam: Required functionality
   * - createDefaultUserConfig: Required functionality
   * - isValidParam: Required functionality
   * - isValidParam: Required functionality
   * - isValidParam: Required functionality
   * - isValidParam: Required functionality
   * - isValidParam: Required functionality
   * - isValidParam: Required functionality
   * - isValidParam: Required functionality
   * - decompressFromBase64: Required functionality
   * - safeMergeProject: Required functionality
   * - isValidParam: Required functionality
   * - decompressFromBase64: Required functionality
   * - safeMergePolicies: Required functionality
   * - isValidParam: Required functionality
   * - setNewProfileData: State update
   * - console.log: Debugging output
   * - useEffect: Required functionality
   * - setProfileData: State update
   * - useEffect: Required functionality
   * - localStorage.getItem: Required functionality
   * - console.log: Debugging output
   * - localStorage.removeItem: Required functionality
   * - localStorage.setItem: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useSearchParams, useIsAuthenticated, useState to process data
   * Output: Computed value or side effect
   *
   */
export const useDashboard = () => {
    const searchParams = useSearchParams();
    const isAuthenticated = useIsAuthenticated();
    const [newProfileData, setNewProfileData] = useState<ProfileData | null>(null);
    const {
        setProfileData,
        getProfileData,
    } = useProfileStore.getState();
      /**
       * BUSINESS LOGIC: queryParams
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements business logic
       *
       * WHAT IT CALLS:
       * - decodeURIComponent() - Function call
       * - searchParams.entries() - Function call
       *
       * WHY IT CALLS THEM:
       * - decodeURIComponent: Required functionality
       * - searchParams.entries: Required functionality
       *
       * DATA FLOW:
       * Input: searchParams state/props
       * Processing: Calls decodeURIComponent, searchParams.entries to process data
       * Output: Computed value or side effect
       *
       * DEPENDENCIES:
       * - searchParams: Triggers when searchParams changes
       *
       * SPECIAL BEHAVIOR:
       * - Memoized for performance optimization
       *
       */
    const queryParams = useMemo(() => {
        const decoded: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            decoded[key] = decodeURIComponent(value);
        }
        return decoded;
    }, [searchParams]);
    // Handles token & profile retrieval + merging
    const { data, fetchUserProfile } = useProfileData();
    const { profile, isLoading, error } = useTokenAndProfile({
        autoFetch: isAuthenticated,
        queryParams,
        onProfileFetched: (profileData) => {
            console.log("[useDashboard] Profile fetched successfully", profileData);
        },
        onError: async (error) => {
            await handleApiError(error as Error);
            console.error('Error in token/profile fetch:', error);
        },
    });

    // TAKES CARE OF QUERY PARSING AND CREATION OF DEFAULT PROFILE (MANUALLY WITHOUT USING PROFILE-STORE's FUNCTION)
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors getProfileData for changes
       * 2. Executes getProfileData, console.log, createAnonymousProfile, params.forEach, decodeURIComponent, console.log, getCouncilByName, String, getCouncilNameByEntraId, parseJwt, console.warn, isValidParam, createDefaultUserConfig, isValidParam, isValidParam, isValidParam, isValidParam, isValidParam, isValidParam, isValidParam, decompressFromBase64, safeMergeProject, isValidParam, decompressFromBase64, safeMergePolicies, isValidParam, setNewProfileData, console.log functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - getProfileData() - Function call
       * - console.log() - Function call
       * - createAnonymousProfile() - Function call
       * - params.forEach() - Function call
       * - decodeURIComponent() - Function call
       * - console.log() - Function call
       * - getCouncilByName() - Function call
       * - String() - Function call
       * - getCouncilNameByEntraId() - Function call
       * - parseJwt() - Function call
       * - console.warn() - Function call
       * - isValidParam() - Function call
       * - createDefaultUserConfig() - Function call
       * - isValidParam() - Function call
       * - isValidParam() - Function call
       * - isValidParam() - Function call
       * - isValidParam() - Function call
       * - isValidParam() - Function call
       * - isValidParam() - Function call
       * - isValidParam() - Function call
       * - decompressFromBase64() - Function call
       * - safeMergeProject() - Function call
       * - isValidParam() - Function call
       * - decompressFromBase64() - Function call
       * - safeMergePolicies() - Function call
       * - isValidParam() - Function call
       * - setNewProfileData() - Function call
       * - console.log() - Function call
       *
       * WHY IT CALLS THEM:
       * - getProfileData: Required functionality
       * - console.log: Debugging output
       * - createAnonymousProfile: Required functionality
       * - params.forEach: Required functionality
       * - decodeURIComponent: Required functionality
       * - console.log: Debugging output
       * - getCouncilByName: Required functionality
       * - String: Required functionality
       * - getCouncilNameByEntraId: Required functionality
       * - parseJwt: Required functionality
       * - console.warn: Warning notification
       * - isValidParam: Required functionality
       * - createDefaultUserConfig: Required functionality
       * - isValidParam: Required functionality
       * - isValidParam: Required functionality
       * - isValidParam: Required functionality
       * - isValidParam: Required functionality
       * - isValidParam: Required functionality
       * - isValidParam: Required functionality
       * - isValidParam: Required functionality
       * - decompressFromBase64: Required functionality
       * - safeMergeProject: Required functionality
       * - isValidParam: Required functionality
       * - decompressFromBase64: Required functionality
       * - safeMergePolicies: Required functionality
       * - isValidParam: Required functionality
       * - setNewProfileData: State update
       * - console.log: Debugging output
       *
       * DATA FLOW:
       * Input: getProfileData state/props
       * Processing: Calls getProfileData, console.log, createAnonymousProfile to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - getProfileData: Triggers when getProfileData changes
       *
       */
    useEffect(() => {
        const existingProfile = getProfileData();
        if (!existingProfile) {
            console.log("[useDashboard] No existing profile found, creating default...");
            const anonymousProfile = createAnonymousProfile();
            // 🛠 Get query params immediately via URL instead of next/navigation hydration
            const urlParams: Record<string, string> = {};
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                params.forEach((value, key) => {
                    urlParams[key] = decodeURIComponent(value);
                });
            }
            console.log("[useDashboard] URL query params:", urlParams);
            // Helper to validate
              /**
               * BUSINESS LOGIC: isValidParam
               *
               * WHY THIS EXISTS:
               * - Implements business logic requirement
               *
               * WHAT IT DOES:
               * 1. Implements isValidParam logic
               * 2. Returns computed result
               *
               * DATA FLOW:
               * Input: Component state and props
               * Processing: Processes data and applies business logic
               * Output: Computed value or side effect
               *
               */
            const isValidParam = (param: string | null | undefined) => {
                return param && param !== 'undefined' && param !== 'null';
            };
            // Extract known fields
            const project_id = urlParams['applicationId'];
            const conversation_id = urlParams['conversationId'];
            const council_name = urlParams['Council'];
            const entraOrgIdFromQuery = urlParams['entraOrgID'];
            // 🌟 Get mapped council info
            const councilMapping = getCouncilByName(council_name);
            const mappedOrgId = String(
                councilMapping?.entra_id ?? entraOrgIdFromQuery ?? ''
            );
            const resolvedCouncilName = council_name || getCouncilNameByEntraId(entraOrgIdFromQuery);
            const address = urlParams['address'];
            const propertyReport = urlParams['propertyReport'];
            const propId = urlParams['propId'];
            const councilPortal = urlParams['councilPortal'] === 'true';
            const projectDataString = urlParams['projectData'];
            const policiesDataString = urlParams['policiesData'];
            const socialLogin = urlParams['socialLogin'];
            const directLineTokenString = urlParams['directLineToken'];
            let directLineTokenObject: { token: string; expiration: number } | undefined = undefined;
            if (isValidParam(directLineTokenString)) {
                const parsedJwt = parseJwt(directLineTokenString!);
                if (parsedJwt.exp) {
                    directLineTokenObject = {
                        token: directLineTokenString!,
                        expiration: parsedJwt.exp * 1000, // JWT exp is in seconds, JS expects ms
                    };
                } else {
                    console.warn("[useDashboard] No exp field found in directLineToken");
                }
            }
            const defaultUserConfig = createDefaultUserConfig(anonymousProfile);
            const newFinalUserConfig: UserConfig = {
                ...defaultUserConfig,
                org_id: mappedOrgId,
                project_id: isValidParam(project_id) ? project_id! : defaultUserConfig.project_id,
                conversation_id: isValidParam(conversation_id) ? conversation_id! : defaultUserConfig.conversation_id,
                project: {
                    ...defaultUserConfig.project!,
                    address: isValidParam(address) ? address! : '',
                    prop_id: isValidParam(propId) ? propId! : '',
                    council_name: isValidParam(resolvedCouncilName) ? resolvedCouncilName! : '',
                },
            };
            const newProfileData = new ProfileData(
                anonymousProfile.id,
                anonymousProfile.first_name,
                anonymousProfile.last_name,
                anonymousProfile.email_address,
                mappedOrgId,
                anonymousProfile.historic_org_ids,
                anonymousProfile.security_groups_owned,
                anonymousProfile.security_groups_member_of,
                newFinalUserConfig,
                anonymousProfile.role,
                isValidParam(socialLogin) ? socialLogin : undefined,
                directLineTokenObject, // <-- correctly parsed token + expiration
                isValidParam(propertyReport) ? propertyReport! : undefined,
                councilPortal ? "true" : undefined,
                undefined, // heritage_property_more_info_url
                undefined, // council_website_url
                undefined  // heritage_item_id
            );
            // If projectData or policiesData exists, patch them manually
            if (isValidParam(projectDataString)) {
                const parsedProjectData = decompressFromBase64<Partial<Project>>(projectDataString!);
                if (parsedProjectData && newProfileData.user_config?.project) {
                    newProfileData.user_config.project = safeMergeProject(
                        newProfileData.user_config.project,
                        parsedProjectData
                    );
                }
            }
            if (isValidParam(policiesDataString)) {
                const parsedPoliciesData = decompressFromBase64<Partial<Policies>>(policiesDataString!);
                if (parsedPoliciesData && newProfileData.user_config?.policies) {
                    newProfileData.user_config.policies = safeMergePolicies(
                        newProfileData.user_config.policies,
                        parsedPoliciesData
                    );
                }
            }
            setNewProfileData(newProfileData);
            console.log("[useDashboard] Initializing profile with:", newProfileData);
        }
    }, [getProfileData]);

    // ✅ Actually apply the profile
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors newProfileData for changes
       * 2. Executes setProfileData functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - setProfileData() - Function call
       *
       * WHY IT CALLS THEM:
       * - setProfileData: State update
       *
       * DATA FLOW:
       * Input: newProfileData state/props
       * Processing: Calls setProfileData to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - newProfileData: Triggers when newProfileData changes
       *
       */
    useEffect(() => {
        if (newProfileData) {
            setProfileData(newProfileData);
        }
    }, [newProfileData]);

    // 🧹 Reset chat history when org changes & project changes from dropdown
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes localStorage.getItem, console.log, localStorage.removeItem, localStorage.setItem functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - localStorage.getItem() - Function call
       * - console.log() - Function call
       * - localStorage.removeItem() - Function call
       * - localStorage.setItem() - Function call
       *
       * WHY IT CALLS THEM:
       * - localStorage.getItem: Required functionality
       * - console.log: Debugging output
       * - localStorage.removeItem: Required functionality
       * - localStorage.setItem: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls localStorage.getItem, console.log, localStorage.removeItem to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const currentOrgId = profile?.current_org_id || null;
        const storedPrevOrgId = localStorage.getItem(PREV_ORG_ID_STORAGE_KEY);
        if (currentOrgId) {
            if (storedPrevOrgId && storedPrevOrgId !== currentOrgId) {
                console.log(`[useDashboard] Detected org switch → clearing chatHistory`);
                localStorage.removeItem('chatHistory');
            }
            localStorage.setItem(PREV_ORG_ID_STORAGE_KEY, currentOrgId);
        }
    }, [profile?.current_org_id]);

    // USE WHEN USING customApiStorage
    // useEffect(() => {
    //     const stopMonitoring = monitorLocalStorageClear(() => {
    //         console.log('LocalStorage was cleared!');
    //         clearProfileData();
    //     }, 'chatHistory');

    //     return () => stopMonitoring();
    // }, [clearProfileData]);

    // useEffect(() => {
    //     const handleStorageChange = (event: StorageEvent) => {
    //         if (event.key === 'profile-store' && event.newValue === null) {
    //             console.log('Detected localStorage clear for profile-store');
    //             clearProfileData();
    //         }
    //     };
    //     window.addEventListener('storage', handleStorageChange);
    //     return () => window.removeEventListener('storage', handleStorageChange);
    // }, [clearProfileData]);

    return {
        isLoadingProfile: isAuthenticated && !data,
        isError: fetchUserProfile.isError,
        isSuccess: fetchUserProfile.isSuccess,
        isPending: fetchUserProfile.isPending,
        isLoading,
        error,
        data,
    };
};