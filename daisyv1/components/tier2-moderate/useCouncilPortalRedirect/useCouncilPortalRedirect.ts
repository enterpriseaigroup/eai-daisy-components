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

export function useCouncilPortalRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { profileData, updateUserConfig } = useProfileStore();
    const [isRedirectFromCouncilPortal, setIsRedirectFromCouncilPortal] = useState(false);
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        if (isRedirectFromCouncilPortal && profileData) {
            redirectToDashboardIfEligible(profileData, queryParams, router);
        }
    }, [isRedirectFromCouncilPortal, profileData, queryParams, router]);

    return { isRedirectFromCouncilPortal, isLoading, queryParams };
}