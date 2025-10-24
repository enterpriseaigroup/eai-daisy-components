/**
 * useAnonMessage - Configurator V2 Component
 *
 * Component useAnonMessage from useAnonMessage.ts
 *
 * @migrated from DAISY v1
 */

import "reflect-metadata";
import  { useState } from 'react';

import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di'; // Adjust the import path as necessary

import type { IAnonMessageUseCase } from "@application/interfaces/IAnonMessageUseCase";
import type { AnonMessageRequest } from "@application/models/AnonMessageRequest";
import type { AnonMessageResponse } from "@application/models/AnonMessageResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useAnonMessage
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useAnonMessage logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, anonMessageUseCase.execute, setMessage, handleApiError, console.error, setMessage
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - anonMessageUseCase.execute() - Function call
   * - setMessage() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setMessage() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - anonMessageUseCase.execute: Required functionality
   * - setMessage: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setMessage: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
export const useAnonMessage = () => {
    const [data, setMessage] = useState<string | null>(null);

    // Fetch anon message
    const fetchAnonMessage = useMutation<AnonMessageResponse, Error, { token: string; payload: AnonMessageRequest }>({
        mutationFn: async ({ token, payload }) => {
            const anonMessageUseCase = container.resolve<IAnonMessageUseCase>("IAnonMessageUseCase");
            return await anonMessageUseCase.execute(token, payload);
        },
        onSuccess: (response) => {
            setMessage(response.reply); // Update the message state with the fetched reply
        },
        onError: async (error) => {
            await handleApiError(error);
            console.error('Error fetching anon message:', error);
            setMessage('Failed to fetch anon message.');
        },
    });

    return {
        fetchAnonMessage,
        data
    };
};