import { useQuery } from "@tanstack/react-query";
import container from "@presentation/di";
import type { IGetAlertUseCase } from "@/app/application/interfaces/IGetAlertUseCase";
import type { Alert } from "@domain/entities/Alert";
import { handleApiError } from "./handleApiError";

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