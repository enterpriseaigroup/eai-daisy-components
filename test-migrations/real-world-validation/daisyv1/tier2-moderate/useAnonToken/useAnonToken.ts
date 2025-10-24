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