/**
 * useChatFeedbackEmail - Configurator V2 Component
 *
 * Component useChatFeedbackEmail from useChatFeedbackEmail.ts
 *
 * @migrated from DAISY v1
 */

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatFeedbackEmailUseCase } from "@application/interfaces/IChatFeedbackEmailUseCase";
import type { ChatFeedbackEmailRequest } from "@application/models/ChatFeedbackEmailRequest";
import type { ChatFeedbackEmailResponse } from "@application/models/ChatFeedbackEmailResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useChatFeedbackEmail
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatFeedbackEmail logic
   * 2. Calls helper functions: useState, useState, useState, useMutation, container.resolve, ChatFeedbackEmailUseCase.execute, setData, setIsSuccess, setError, handleApiError, setData, setIsSuccess, setError
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - ChatFeedbackEmailUseCase.execute() - Function call
   * - setData() - Function call
   * - setIsSuccess() - Function call
   * - setError() - Function call
   * - handleApiError() - Function call
   * - setData() - Function call
   * - setIsSuccess() - Function call
   * - setError() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - ChatFeedbackEmailUseCase.execute: Required functionality
   * - setData: State update
   * - setIsSuccess: State update
   * - setError: State update
   * - handleApiError: Required functionality
   * - setData: State update
   * - setIsSuccess: State update
   * - setError: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
export const useChatFeedbackEmail = () => {
  const [data, setData] = useState<ChatFeedbackEmailResponse | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const ChatFeedbackEmail = useMutation<
    ChatFeedbackEmailResponse,
    Error,
    { token: string; payload: ChatFeedbackEmailRequest }
  >({
    mutationFn: async ({ token, payload }) => {
      const ChatFeedbackEmailUseCase = container.resolve<IChatFeedbackEmailUseCase>(
        "IChatFeedbackEmailUseCase"
      );
      return await ChatFeedbackEmailUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      setData(response); // Update the data state with the response
      setIsSuccess(true);
      setError(null);
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      setData(null); // Reset the data state on error
      setIsSuccess(false);
      setError(error);
    },
  });

  return {
    ChatFeedbackEmail,
    data,
    isSuccess,
    error,
  };
};