/**
 * useSendEmailDocumentChecklist - Configurator V2 Component
 *
 * Component useSendEmailDocumentChecklist from useSendEmailDocumentChecklist.ts
 *
 * @migrated from DAISY v1
 */

import container from "@presentation/di";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SendEmailDocumentChecklistRequest } from "@application/models/SendEmailDocumentChecklistRequest";
import type { SendEmailDocumentChecklistResponse } from "@application/models/SendEmailDocumentChecklistResponse";
import type { ISendEmailDocumentChecklistUseCase } from "@application/interfaces/ISendEmailDocumentChecklistUseCase";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useSendEmailDocumentChecklist
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useSendEmailDocumentChecklist logic
   * 2. Calls helper functions: useState, useState, useMutation, container.resolve, emailUseCase.execute, setStatus, setEmailSentTo, toast.error, trackEmailAction, setStatus, setEmailSentTo, toast.success, trackEmailAction, handleApiError, console.error, setStatus, setEmailSentTo, toast.error, trackEmailAction, setStatus, setEmailSentTo, trackEmailAction, emailMutation.mutate, trackEmailAction, emailMutation.mutateAsync
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - emailUseCase.execute() - Function call
   * - setStatus() - Function call
   * - setEmailSentTo() - Function call
   * - toast.error() - Function call
   * - trackEmailAction() - Function call
   * - setStatus() - Function call
   * - setEmailSentTo() - Function call
   * - toast.success() - Function call
   * - trackEmailAction() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setStatus() - Function call
   * - setEmailSentTo() - Function call
   * - toast.error() - Function call
   * - trackEmailAction() - Function call
   * - setStatus() - Function call
   * - setEmailSentTo() - Function call
   * - trackEmailAction() - Function call
   * - emailMutation.mutate() - Function call
   * - trackEmailAction() - Function call
   * - emailMutation.mutateAsync() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - emailUseCase.execute: Required functionality
   * - setStatus: State update
   * - setEmailSentTo: State update
   * - toast.error: Required functionality
   * - trackEmailAction: Analytics tracking
   * - setStatus: State update
   * - setEmailSentTo: State update
   * - toast.success: Required functionality
   * - trackEmailAction: Analytics tracking
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setStatus: State update
   * - setEmailSentTo: State update
   * - toast.error: Required functionality
   * - trackEmailAction: Analytics tracking
   * - setStatus: State update
   * - setEmailSentTo: State update
   * - trackEmailAction: Analytics tracking
   * - emailMutation.mutate: Required functionality
   * - trackEmailAction: Analytics tracking
   * - emailMutation.mutateAsync: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useState, useMutation to process data
   * Output: Computed value or side effect
   *
   */
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

      /**
       * BUSINESS LOGIC: resetStatus
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements resetStatus logic
       * 2. Calls helper functions: setStatus, setEmailSentTo
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setStatus() - Function call
       * - setEmailSentTo() - Function call
       *
       * WHY IT CALLS THEM:
       * - setStatus: State update
       * - setEmailSentTo: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setStatus, setEmailSentTo to process data
       * Output: Computed value or side effect
       *
       */
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