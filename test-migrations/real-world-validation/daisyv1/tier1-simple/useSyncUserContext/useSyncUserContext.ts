import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { ISyncUserContextUseCase } from "@application/interfaces/ISyncUserContextUseCase";
import type { SyncUserContextRequest } from "@application/models/SyncUserContextRequest";
import type { SyncUserContextResponse } from "@application/models/SyncUserContextResponse";
import { handleApiError } from "./handleApiError";

export const useSyncUserContext = () => {
    const [data, setData] = useState<SyncUserContextResponse | null>(null);

    const syncUserContext = useMutation<
        SyncUserContextResponse,
        Error,
        { token: string; payload: SyncUserContextRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            const syncUserContextService = container.resolve<ISyncUserContextUseCase>(
                "ISyncUserContextUseCase"
            );
            return await syncUserContextService.execute(token, payload);
        },
        onSuccess: (response) => {
            console.log("User Config migrated successfully:", response);
            setData(response); // Update the data state with the response
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error migrating user config:", error);
            setData(null); // Reset the data state on error
        },
    });

    return {
        syncUserContext,
        data,
    };
};