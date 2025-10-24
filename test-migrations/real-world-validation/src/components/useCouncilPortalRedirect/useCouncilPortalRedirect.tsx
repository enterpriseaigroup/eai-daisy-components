/**
 * useCouncilPortalRedirect - Configurator V2 Component
 *
 * Component useCouncilPortalRedirect from useCouncilPortalRedirect.ts
 *
 * @migrated from DAISY v1
 */

// hooks/useCouncilPortalRedirect.ts

// PROOF OF TRUTH: ORG_ID (in user_config) / CURRENT_ORG_ID (in profileData) OR ENTRA_ORG_ID (in queryParams) + COUNCIL_NAME (in user_config.project.council_name) is always needed to move to /dashboard
// Once in /dashboard - we can use it both in anon or logged in (once logged in, we need to redirect to /dashboard)

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfileStore } from '@presentation/store/useProfileStore';
import { safeUpdateUserConfig } from '../components/chatbot/utils/safeUpdateUserConfig';
import { getCouncilNameByEntraId } from '../constants/councilMappings';
import { redirectToDashboardIfEligible } from '../store/utils/userProfileHelpers';

  /**
   * BUSINESS LOGIC: useCouncilPortalRedirect
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useCouncilPortalRedirect logic
   * 2. Calls helper functions: useRouter, useSearchParams, useProfileStore, useState, useState, useState, useEffect, searchParams.get, searchParams.get, searchParams.get, searchParams.forEach, setQueryParams, setIsRedirectFromCouncilPortal, getCouncilNameByEntraId, safeUpdateUserConfig, safeUpdateUserConfig, setIsLoading, useEffect, redirectToDashboardIfEligible
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useRouter() - Function call
   * - useSearchParams() - Function call
   * - useProfileStore() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useEffect() - Function call
   * - searchParams.get() - Function call
   * - searchParams.get() - Function call
   * - searchParams.get() - Function call
   * - searchParams.forEach() - Function call
   * - setQueryParams() - Function call
   * - setIsRedirectFromCouncilPortal() - Function call
   * - getCouncilNameByEntraId() - Function call
   * - safeUpdateUserConfig() - Function call
   * - safeUpdateUserConfig() - Function call
   * - setIsLoading() - Function call
   * - useEffect() - Function call
   * - redirectToDashboardIfEligible() - Function call
   *
   * WHY IT CALLS THEM:
   * - useRouter: Required functionality
   * - useSearchParams: Required functionality
   * - useProfileStore: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useEffect: Required functionality
   * - searchParams.get: Required functionality
   * - searchParams.get: Required functionality
   * - searchParams.get: Required functionality
   * - searchParams.forEach: Required functionality
   * - setQueryParams: State update
   * - setIsRedirectFromCouncilPortal: State update
   * - getCouncilNameByEntraId: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - setIsLoading: State update
   * - useEffect: Required functionality
   * - redirectToDashboardIfEligible: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useRouter, useSearchParams, useProfileStore to process data
   * Output: Computed value or side effect
   *
   */
export function useCouncilPortalRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { profileData, updateUserConfig } = useProfileStore();
    const [isRedirectFromCouncilPortal, setIsRedirectFromCouncilPortal] = useState(false);
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors searchParams, profileData for changes
       * 2. Executes searchParams.get, searchParams.get, searchParams.get, searchParams.forEach, setQueryParams, setIsRedirectFromCouncilPortal, getCouncilNameByEntraId, safeUpdateUserConfig, safeUpdateUserConfig, setIsLoading functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - searchParams.get() - Function call
       * - searchParams.get() - Function call
       * - searchParams.get() - Function call
       * - searchParams.forEach() - Function call
       * - setQueryParams() - Function call
       * - setIsRedirectFromCouncilPortal() - Function call
       * - getCouncilNameByEntraId() - Function call
       * - safeUpdateUserConfig() - Function call
       * - safeUpdateUserConfig() - Function call
       * - setIsLoading() - Function call
       *
       * WHY IT CALLS THEM:
       * - searchParams.get: Required functionality
       * - searchParams.get: Required functionality
       * - searchParams.get: Required functionality
       * - searchParams.forEach: Required functionality
       * - setQueryParams: State update
       * - setIsRedirectFromCouncilPortal: State update
       * - getCouncilNameByEntraId: Required functionality
       * - safeUpdateUserConfig: Required functionality
       * - safeUpdateUserConfig: Required functionality
       * - setIsLoading: State update
       *
       * DATA FLOW:
       * Input: searchParams, profileData state/props
       * Processing: Calls searchParams.get, searchParams.get, searchParams.get to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - searchParams: Triggers when searchParams changes
       * - profileData: Triggers when profileData changes
       *
       */
    useEffect(() => {
        if (!searchParams || !profileData) return;
        const isFromCouncil = searchParams.get('councilPortal') === 'true';
        const councilParam = searchParams.get('Council');
        const entraOrgIdParam = searchParams.get('entraOrgID');
        const params: Record<string, string> = {};
            searchParams.forEach((value, key) => {
            params[key] = value;
        });
        setQueryParams(params);
        if (isFromCouncil) {
            setIsRedirectFromCouncilPortal(true);
            const resolvedCouncilName = councilParam || getCouncilNameByEntraId(entraOrgIdParam || '');
            if (resolvedCouncilName) {
                safeUpdateUserConfig(
                    'user_config.project.council_name',
                    resolvedCouncilName,
                    profileData,
                    updateUserConfig
                );
            }
            if (entraOrgIdParam) {
                safeUpdateUserConfig(
                    'user_config.org_id',
                    entraOrgIdParam,
                    profileData,
                    updateUserConfig
                );
            }
        }
        setIsLoading(false);
    }, [searchParams, profileData]);

      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors isRedirectFromCouncilPortal, profileData, queryParams, router for changes
       * 2. Executes redirectToDashboardIfEligible functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - redirectToDashboardIfEligible() - Function call
       *
       * WHY IT CALLS THEM:
       * - redirectToDashboardIfEligible: Required functionality
       *
       * DATA FLOW:
       * Input: isRedirectFromCouncilPortal, profileData, queryParams, router state/props
       * Processing: Calls redirectToDashboardIfEligible to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - isRedirectFromCouncilPortal: Triggers when isRedirectFromCouncilPortal changes
       * - profileData: Triggers when profileData changes
       * - queryParams: Triggers when queryParams changes
       * - router: Triggers when router changes
       *
       */
    useEffect(() => {
        if (isRedirectFromCouncilPortal && profileData) {
            redirectToDashboardIfEligible(profileData, queryParams, router);
        }
    }, [isRedirectFromCouncilPortal, profileData, queryParams, router]);

    return { isRedirectFromCouncilPortal, isLoading, queryParams };
}