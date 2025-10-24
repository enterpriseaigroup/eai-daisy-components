/**
 * useNegotiateWebSocket - Configurator V2 Component
 *
 * Component useNegotiateWebSocket from useNegotiateWebSocket.ts
 *
 * @migrated from DAISY v1
 */

import { useQuery } from "@tanstack/react-query";
import container from "@presentation/di";
import type { INegotiateWebSocketUseCase } from "@application/interfaces/INegotiateWebSocketUseCase";
import type { NegotiateWebSocketResponse } from "@application/models/NegotiateWebSocketResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useNegotiateWebSocket
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useNegotiateWebSocket logic
   * 2. Calls helper functions: container.resolve, useQuery, negotiateWebSocketUseCase.execute, handleApiError, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - container.resolve() - Function call
   * - useQuery() - Function call
   * - negotiateWebSocketUseCase.execute() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - container.resolve: Required functionality
   * - useQuery: Required functionality
   * - negotiateWebSocketUseCase.execute: Required functionality
   * - handleApiError: Required functionality
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls container.resolve, useQuery, negotiateWebSocketUseCase.execute to process data
   * Output: Computed value or side effect
   *
   */
export function useNegotiateWebSocket(token: string) {
  const negotiateWebSocketUseCase = container.resolve<INegotiateWebSocketUseCase>(
    "INegotiateWebSocketUseCase"
  );

  const { data, isLoading, isError, error } = useQuery<
    NegotiateWebSocketResponse,  // TQueryFnData
    Error,                       // TError
    NegotiateWebSocketResponse, // TData
    [string, string]            // TQueryKey
  >({
    queryKey: ["negotiate-websocket", token],
    queryFn: async () => {
      if (!token) throw new Error("Authorization token is required");
      try {
        return await negotiateWebSocketUseCase.execute(token);
      } catch (error) {
        await handleApiError(error as Error);
        console.error("[useNegotiateWebSocket] Error:", error);
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, isError, error };
}