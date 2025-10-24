/**
 * useGetAlert - Configurator V2 Component
 *
 * Component useGetAlert from useGetAlert.ts
 *
 * @migrated from DAISY v1
 */

import { useQuery } from "@tanstack/react-query";
import container from "@presentation/di";
import type { IGetAlertUseCase } from "@/app/application/interfaces/IGetAlertUseCase";
import type { Alert } from "@domain/entities/Alert";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useGetAlert
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useGetAlert logic
   * 2. Calls helper functions: container.resolve, useQuery, getAlertsUseCase.execute, handleApiError, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - container.resolve() - Function call
   * - useQuery() - Function call
   * - getAlertsUseCase.execute() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - container.resolve: Required functionality
   * - useQuery: Required functionality
   * - getAlertsUseCase.execute: Required functionality
   * - handleApiError: Required functionality
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls container.resolve, useQuery, getAlertsUseCase.execute to process data
   * Output: Computed value or side effect
   *
   */
export const useGetAlert = (token: string) => {
    const getAlertsUseCase = container.resolve<IGetAlertUseCase>("IGetAlertUseCase");

    const { data, isLoading, isError, error } = useQuery<Alert[], Error>({
        queryKey: ["alerts", token],
        queryFn: async () => {
            if (!token) {
                throw new Error("Authorization token is required");
            }
            try {
                return await getAlertsUseCase.execute(token);
            } catch (error) {
                await handleApiError(error as Error);
                console.error("[useGetAlert] Error:", error);
                throw error;
            }
        },
        enabled: !!token, // Ensures the query only runs when the token is available
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 5 * 60 * 1000, // fetch every 5 min
    });

    return { data, isLoading, isError, error };
};