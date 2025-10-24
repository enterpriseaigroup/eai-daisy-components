import container from "@presentation/di";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ChatFeedbackRequest } from "@application/models/ChatFeedbackRequest";
import type { ChatFeedbackResponse } from "@application/models/ChatFeedbackResponse";
import type { IChatFeedbackUseCase } from "@application/interfaces/IChatFeedbackUseCase";
import { handleApiError } from "./handleApiError";

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

    const hasSentFeedback = (messageId: string): boolean => {
        return sentFeedbackIds.has(messageId);
    };

    // Get the feedback type
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