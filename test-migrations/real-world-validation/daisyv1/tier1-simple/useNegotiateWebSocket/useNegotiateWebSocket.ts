import { useQuery } from "@tanstack/react-query";
import container from "@presentation/di";
import type { INegotiateWebSocketUseCase } from "@application/interfaces/INegotiateWebSocketUseCase";
import type { NegotiateWebSocketResponse } from "@application/models/NegotiateWebSocketResponse";
import { handleApiError } from "./handleApiError";

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