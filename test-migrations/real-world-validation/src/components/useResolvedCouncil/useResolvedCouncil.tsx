/**
 * useResolvedCouncil - Configurator V2 Component
 *
 * Component useResolvedCouncil from useResolvedCouncil.ts
 *
 * @migrated from DAISY v1
 */

// src/app/(presentation)/hooks/useResolvedCouncil.ts
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';          // Next.js App Router
import { useProfileStore } from '@presentation/store/useProfileStore';
import { getCouncilByName } from '@presentation/constants/councilMappings';

  /**
   * BUSINESS LOGIC: useResolvedCouncil
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useResolvedCouncil logic
   * 2. Calls helper functions: useSearchParams, useProfileStore, useMemo, searchParams.get, fromQuery.trim, getCouncilByName
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useSearchParams() - Function call
   * - useProfileStore() - Function call
   * - useMemo() - Function call
   * - searchParams.get() - Function call
   * - fromQuery.trim() - Function call
   * - getCouncilByName() - Function call
   *
   * WHY IT CALLS THEM:
   * - useSearchParams: Required functionality
   * - useProfileStore: Required functionality
   * - useMemo: Required functionality
   * - searchParams.get: Required functionality
   * - fromQuery.trim: Required functionality
   * - getCouncilByName: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useSearchParams, useProfileStore, useMemo to process data
   * Output: Computed value or side effect
   *
   */
export function useResolvedCouncil() {
  // 👉 DO NOT destructure – this hook returns ONE URLSearchParams object
  const searchParams = useSearchParams();
  const { profileData } = useProfileStore();

    /**
     * BUSINESS LOGIC: Memoized Value
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * WHAT IT CALLS:
     * - searchParams.get() - Function call
     * - fromQuery.trim() - Function call
     * - getCouncilByName() - Function call
     *
     * WHY IT CALLS THEM:
     * - searchParams.get: Required functionality
     * - fromQuery.trim: Required functionality
     * - getCouncilByName: Required functionality
     *
     * DATA FLOW:
     * Input: searchParams, profileData state/props
     * Processing: Calls searchParams.get, fromQuery.trim, getCouncilByName to process data
     * Output: Computed value or side effect
     *
     * DEPENDENCIES:
     * - searchParams: Triggers when searchParams changes
     * - profileData: Triggers when profileData changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  return useMemo(() => {
    const fromQuery = searchParams.get('Council');
    if (fromQuery?.trim()) {
      return fromQuery;
    }

    const project = profileData?.user_config?.project;
    const mapping = getCouncilByName(
      project?.council_name,
      profileData?.current_org_id,
    );
    if (mapping?.name) {
      return mapping.name;
    }

    return 'Default';
  }, [searchParams, profileData]);
}