/**
 * useChatMigrateHistory - Configurator V2 Component
 *
 * Component useChatMigrateHistory from useChatMigrateHistory.ts
 *
 * @migrated from DAISY v1
 */

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatMigrateHistoryUseCase } from "@application/interfaces/IChatMigrateHistoryUseCase";
import type { ChatMigrateHistoryRequest } from "@application/models/ChatMigrateHistoryRequest";
import type { ChatMigrateHistoryResponse } from "@application/models/ChatMigrateHistoryResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useChatMigrateHistory
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatMigrateHistory logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, chatMigrateHistoryService.execute, console.log, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - chatMigrateHistoryService.execute() - Function call
   * - console.log() - Function call
   * - setData() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - chatMigrateHistoryService.execute: Required functionality
   * - console.log: Debugging output
   * - setData: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setData: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
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