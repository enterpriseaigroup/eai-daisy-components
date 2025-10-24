/**
 * useChatHistory - Configurator V2 Component
 *
 * Component useChatHistory from useChatHistory.ts
 *
 * @migrated from DAISY v1
 */

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatHistoryUseCase } from "@application/interfaces/IChatHistoryUseCase";
import type { ChatHistoryRequest } from "@application/models/ChatHistoryRequest";
import type { ChatHistoryResponse } from "@application/models/ChatHistoryResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useChatHistory
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatHistory logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, chatHistoryUseCase.execute, console.log, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - chatHistoryUseCase.execute() - Function call
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
   * - chatHistoryUseCase.execute: Required functionality
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
export const useChatHistory = () => {
  const [data, setData] = useState<ChatHistoryResponse[] | null>(null);

  const chatHistory = useMutation<
    ChatHistoryResponse[],
    Error,
    { token: string; payload: ChatHistoryRequest }
  >({
    mutationFn: async ({ token, payload }) => {
      const chatHistoryUseCase = container.resolve<IChatHistoryUseCase>(
        "IChatHistoryUseCase"
      );
      return await chatHistoryUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      console.log("Chat history fetched successfully:", response);
      setData(response); // Update the data state with the response
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      console.error("Error fetching chat history:", error);
      setData(null); // Reset the data state on error
    },
  });

  return {
    chatHistory,
    data,
  };
};