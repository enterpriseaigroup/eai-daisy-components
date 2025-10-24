/**
 * useFetchOrgProjects - Configurator V2 Component
 *
 * Component useFetchOrgProjects from useFetchOrgProjects.ts
 *
 * @migrated from DAISY v1
 */

import "reflect-metadata";
import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";
import { OrgProject } from "@domain/entities/OrgProject";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { useCallback } from "react";
import { IOrgProjectUseCase } from "@application/interfaces/IOrgProjectUseCase";
import { handleApiError } from "@/app/(presentation)/hooks/handleApiError"; // 🔁 adjust path as needed

  /**
   * BUSINESS LOGIC: useFetchOrgProjects
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useFetchOrgProjects logic
   * 2. Calls helper functions: useProfileStore, useCallback, container.resolve, useCase.execute, handleApiError, console.error, useQuery
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - useCallback() - Function call
   * - container.resolve() - Function call
   * - useCase.execute() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - useQuery() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - useCallback: Required functionality
   * - container.resolve: Required functionality
   * - useCase.execute: Required functionality
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - useQuery: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, useCallback, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
export function useFetchOrgProjects(orgId?: string, token?: string) {
  const { setCurrentProject } = useProfileStore();

    /**
     * BUSINESS LOGIC: fetchOrgProjects
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls container.resolve, useCase.execute, handleApiError, console.error functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - container.resolve() - Function call
     * - useCase.execute() - Function call
     * - handleApiError() - Function call
     * - console.error() - Function call
     *
     * WHY IT CALLS THEM:
     * - container.resolve: Required functionality
     * - useCase.execute: Required functionality
     * - handleApiError: Required functionality
     * - console.error: Error logging
     *
     * DATA FLOW:
     * Input: orgId, token state/props
     * Processing: Calls container.resolve, useCase.execute, handleApiError to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - orgId: Triggers when orgId changes
     * - token: Triggers when token changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const fetchOrgProjects = useCallback(async (): Promise<OrgProject[]> => {
    if (!orgId || !token) {
      throw new Error("orgId and token are required");
    }

    const useCase = container.resolve<IOrgProjectUseCase>("IOrgProjectUseCase");

    try {
      return await useCase.execute(orgId, token);
    } catch (error) {
      await handleApiError(error as Error);
      console.error("[useFetchOrgProjects] Error:", error);
      throw error;
    }
  }, [orgId, token]);

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrgProject[], Error, OrgProject[], [string, string?, string?]>({
    queryKey: ["orgProjects", orgId, token],
    queryFn: fetchOrgProjects,
    enabled: !!orgId && !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    projects,
    loading: isLoading,
    isError,
    error,
    setCurrentProject,
    refetch,
  };
}