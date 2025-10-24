import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatMigrateHistoryUseCase } from "@application/interfaces/IChatMigrateHistoryUseCase";
import type { ChatMigrateHistoryRequest } from "@application/models/ChatMigrateHistoryRequest";
import type { ChatMigrateHistoryResponse } from "@application/models/ChatMigrateHistoryResponse";
import { handleApiError } from "./handleApiError";

export const useChatMigrateHistory = () => {
    const [data, setData] = useState<ChatMigrateHistoryResponse | null>(null);

    const chatMigrateHistory = useMutation<
        ChatMigrateHistoryResponse,
        Error,
        { token: string; payload: ChatMigrateHistoryRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            const chatMigrateHistoryService = container.resolve<IChatMigrateHistoryUseCase>(
                "IChatMigrateHistoryUseCase"
            );
            return await chatMigrateHistoryService.execute(token, payload);
        },
        onSuccess: (response) => {
            console.log("Chat history migrated successfully:", response);
            setData(response); // Update the data state with the response
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error migrating chat history:", error);
            setData(null); // Reset the data state on error
        },
    });

    return {
        chatMigrateHistory,
        data,
    };
};