import container from "@presentation/di";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SendEmailDocumentChecklistRequest } from "@application/models/SendEmailDocumentChecklistRequest";
import type { SendEmailDocumentChecklistResponse } from "@application/models/SendEmailDocumentChecklistResponse";
import type { ISendEmailDocumentChecklistUseCase } from "@application/interfaces/ISendEmailDocumentChecklistUseCase";
import { handleApiError } from "./handleApiError";

export const useSendEmailDocumentChecklist = (trackEmailAction?: (action: string, userId?: string, isLoggedIn?: boolean) => void) => {
    const [status, setStatus] = useState<string | null>(null);
    const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

    const emailMutation = useMutation<
        SendEmailDocumentChecklistResponse,
        Error,
        { payload: SendEmailDocumentChecklistRequest; token: string; userId?: string; isLoggedIn?: boolean }
    >({
        mutationFn: async ({ payload, token }) => {
            const emailUseCase = container.resolve<ISendEmailDocumentChecklistUseCase>("ISendEmailDocumentChecklistUseCase");
            return await emailUseCase.execute(payload, token);
        },
        onSuccess: (data, variables) => {
            // Check if the response indicates success - either by success field or by having a message
            if (data.success || data.message) {
                setStatus("Email sent successfully");
                setEmailSentTo(data.email_sent_to || variables.payload.user_config.email);
                toast.success('Email sent successfully!', {
                    description: `Document checklist sent to ${data.email_sent_to || variables.payload.user_config.email}`
                });
                // Track successful email send
                trackEmailAction?.('send_success', variables.userId, variables.isLoggedIn);
            } else {
                setStatus("Failed to send email");
                setEmailSentTo(null);
                toast.error('Email Error', {
                    description: 'Failed to send email. Please try again.'
                });
                // Track email send error for API success but business logic failure
                trackEmailAction?.('send_error', variables.userId, variables.isLoggedIn);
            }
        },
        onError: async (error: Error, variables) => {
            await handleApiError(error);
            console.error("[❌ sendEmailDocumentChecklist ERROR]:", error);
            setStatus("Failed to send email");
            setEmailSentTo(null);
            toast.error('Email Error', {
                description: 'Failed to send email. Please try again.'
            });
            // Track email send error
            trackEmailAction?.('send_error', variables.userId, variables.isLoggedIn);
        },
    });

    const resetStatus = () => {
        setStatus(null);
        setEmailSentTo(null);
    };

    return {
        sendEmailDocumentChecklist: (payload: SendEmailDocumentChecklistRequest, token: string, userId?: string, isLoggedIn?: boolean) => {
            // Track email send attempt
            trackEmailAction?.('send_attempted', userId, isLoggedIn);
            emailMutation.mutate({ payload, token, userId, isLoggedIn });
        },
        sendEmailDocumentChecklistAsync: (payload: SendEmailDocumentChecklistRequest, token: string, userId?: string, isLoggedIn?: boolean) => {
            // Track email send attempt
            trackEmailAction?.('send_attempted', userId, isLoggedIn);
            return emailMutation.mutateAsync({ payload, token, userId, isLoggedIn });
        },
        isLoading: emailMutation.isPending,
        isSuccess: emailMutation.isSuccess,
        isError: emailMutation.isError,
        error: emailMutation.error,
        status,
        emailSentTo,
        resetStatus,
    };
};