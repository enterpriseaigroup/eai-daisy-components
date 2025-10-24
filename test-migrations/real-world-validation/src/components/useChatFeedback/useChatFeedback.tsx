/**
 * useChatFeedback - Configurator V2 Component
 *
 * Component useChatFeedback from useChatFeedback.ts
 *
 * @migrated from DAISY v1
 */

import container from "@presentation/di";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ChatFeedbackRequest } from "@application/models/ChatFeedbackRequest";
import type { ChatFeedbackResponse } from "@application/models/ChatFeedbackResponse";
import type { IChatFeedbackUseCase } from "@application/interfaces/IChatFeedbackUseCase";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useChatFeedback
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatFeedback logic
   * 2. Calls helper functions: useState, useState, useMutation, container.resolve, feedbackUseCase.execute, setStatus, setStatus, setSentFeedbackIds, .set, handleApiError, console.error, setStatus, sentFeedbackIds.has, sentFeedbackIds.get, feedbackMutation.mutate, feedbackMutation.mutateAsync
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - feedbackUseCase.execute() - Function call
   * - setStatus() - Function call
   * - setStatus() - Function call
   * - setSentFeedbackIds() - Function call
   * - .set() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setStatus() - Function call
   * - sentFeedbackIds.has() - Function call
   * - sentFeedbackIds.get() - Function call
   * - feedbackMutation.mutate() - Function call
   * - feedbackMutation.mutateAsync() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - feedbackUseCase.execute: Required functionality
   * - setStatus: State update
   * - setStatus: State update
   * - setSentFeedbackIds: State update
   * - .set: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setStatus: State update
   * - sentFeedbackIds.has: Required functionality
   * - sentFeedbackIds.get: Required functionality
   * - feedbackMutation.mutate: Required functionality
   * - feedbackMutation.mutateAsync: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useState, useMutation to process data
   * Output: Computed value or side effect
   *
   */
export const useChatFeedback = () => {
    const [status, setStatus] = useState<string | null>(null);
    // Change to Map to track both messageId and feedback type
    const [sentFeedbackIds, setSentFeedbackIds] = useState<Map<string, 'good' | 'bad'>>(new Map());

    const feedbackMutation = useMutation<
        ChatFeedbackResponse,
        Error,
        { messageId: string; payload: ChatFeedbackRequest; token: string }
    >({
        mutationFn: async ({ payload, token }) => {
            const feedbackUseCase = container.resolve<IChatFeedbackUseCase>("IChatFeedbackUseCase");
            return await feedbackUseCase.execute(payload, token);
        },
        onSuccess: (data, variables) => {
            if (data.success) {
                setStatus("Feedback sent successfully");
                // Store both messageId and feedback type
                setSentFeedbackIds(prev => new Map(prev).set(variables.messageId, variables.payload.feedback as 'good' | 'bad'));
            } else {
                setStatus("Failed to send feedback");
            }
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("[❌ sendFeedback ERROR]:", error);
            setStatus("Failed to send feedback");
        },
    });

      /**
       * BUSINESS LOGIC: hasSentFeedback
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements hasSentFeedback logic
       * 2. Calls helper functions: sentFeedbackIds.has
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - sentFeedbackIds.has() - Function call
       *
       * WHY IT CALLS THEM:
       * - sentFeedbackIds.has: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls sentFeedbackIds.has to process data
       * Output: Computed value or side effect
       *
       */
    const hasSentFeedback = (messageId: string): boolean => {
        return sentFeedbackIds.has(messageId);
    };

    // Get the feedback type
      /**
       * BUSINESS LOGIC: getFeedbackType
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements getFeedbackType logic
       * 2. Calls helper functions: sentFeedbackIds.get
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - sentFeedbackIds.get() - Function call
       *
       * WHY IT CALLS THEM:
       * - sentFeedbackIds.get: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls sentFeedbackIds.get to process data
       * Output: Computed value or side effect
       *
       */
    const getFeedbackType = (messageId: string): 'good' | 'bad' | null => {
        return sentFeedbackIds.get(messageId) || null;
    };

    return {
        sendFeedback: (messageId: string, payload: ChatFeedbackRequest, token: string) => feedbackMutation.mutate({ messageId, payload, token }),
        sendFeedbackAsync: (messageId: string, payload: ChatFeedbackRequest, token: string) => feedbackMutation.mutateAsync({ messageId, payload, token }),
        isLoading: feedbackMutation.isPending,
        isSuccess: feedbackMutation.isSuccess,
        isError: feedbackMutation.isError,
        error: feedbackMutation.error,
        status,
        hasSentFeedback,
        getFeedbackType,
    };
};