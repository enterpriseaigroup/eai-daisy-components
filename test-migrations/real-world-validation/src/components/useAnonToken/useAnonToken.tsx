/**
 * useAnonToken - Configurator V2 Component
 *
 * Component useAnonToken from useAnonToken.ts
 *
 * @migrated from DAISY v1
 */

import { AnonTokenResponse } from "@application/models/AnonTokenResponse";

import container from '@presentation/di'; // Adjust the import path as necessary
import type { IAnonTokenUseCase } from "@application/interfaces/IAnonTokenUseCase";
import type { AnonTokenRequest } from '@application/models/AnonTokenRequest';
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { handleApiError } from "./handleApiError";

// export const useAnonToken = (councilValue: string) => {
//     const anonTokenUseCase = container.resolve<IAnonTokenUseCase>("IAnonTokenUseCase");

//     // Fetch anon token
//     const { data, isLoading, isError, error } = useQuery<AnonTokenResponse, Error>({
//         queryKey: ["fetch-anonToken", councilValue],
//         queryFn: async () => {
//             const payload: AnonTokenRequest = {
//                 councilValue: councilValue,
//             };
//             return await anonTokenUseCase.execute(payload);
//         },
//         staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
//         retry: 3, // Retry failed requests up to 3 times
//     });

//     return { data, isLoading, isError, error };
// };

  /**
   * BUSINESS LOGIC: useAnonToken
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useAnonToken logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, anonTokenUseCase.execute, setToken, handleApiError, console.error, setToken
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - anonTokenUseCase.execute() - Function call
   * - setToken() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setToken() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - anonTokenUseCase.execute: Required functionality
   * - setToken: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setToken: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
export const useAnonToken = () => {
    const [data, setToken] = useState<AnonTokenResponse | null>(null);

    // Fetch anon token
    const fetchAnonToken = useMutation<AnonTokenResponse, Error, AnonTokenRequest>({
        mutationFn: async (payload) => {
            const anonTokenUseCase = container.resolve<IAnonTokenUseCase>("IAnonTokenUseCase");

            return await anonTokenUseCase.execute(payload);
        },
        onSuccess: (response) => {
            setToken(response); // Update the token state with the fetched response
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error fetching anon token:", error);
            setToken(null); // Reset the token state on error
        },
    });

    return {
        fetchAnonToken,
        data,
    };
};