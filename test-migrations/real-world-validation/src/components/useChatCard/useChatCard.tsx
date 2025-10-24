/**
 * useChatCard - Configurator V2 Component
 *
 * Component useChatCard from useChatCard.ts
 *
 * @migrated from DAISY v1
 */

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatCardUseCase } from "@application/interfaces/IChatCardUseCase";
import type { ChatCardRequest } from "@application/models/ChatCardRequest";
import type { ChatCardResponse } from "@application/models/ChatCardResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useChatCard
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatCard logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, chatCardUseCase.execute, console.log, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - chatCardUseCase.execute() - Function call
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
   * - chatCardUseCase.execute: Required functionality
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
export const useChatCard = () => {
  const [data, setData] = useState<ChatCardResponse | null>(null);

  const chatCard = useMutation<
    ChatCardResponse,
    Error,
    { token: string; payload: ChatCardRequest }
  >({
    mutationFn: async ({ token, payload }) => {
      const chatCardUseCase = container.resolve<IChatCardUseCase>(
        "IChatCardUseCase"
      );
      return await chatCardUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      console.log("Chat card created successfully:", response);
      setData(response); // Update the data state with the response
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      console.error("Error creating chat card:", error);
      setData(null); // Reset the data state on error
    },
  });

  return {
    chatCard,
    data,
  };
};