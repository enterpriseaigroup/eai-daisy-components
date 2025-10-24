import 'reflect-metadata';
import { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di';

import type { CreateApplicationRecordRequest } from "@application/models/CreateApplicationRecordRequest";
import type { CreateApplicationRecordResponse } from "@application/models/CreateApplicationRecordResponse";
import type { ICreateApplicationRecordUseCase } from '@application/interfaces/ICreateApplicationRecordUseCase';
import { handleApiError } from "./handleApiError";

export const useCreateApplicationRecord = () => {
    const [data, setData] = useState<CreateApplicationRecordResponse | null>(null);
    const createApplicationRecordUseCase = container.resolve<ICreateApplicationRecordUseCase>("ICreateApplicationRecordUseCase");

    const createApplicationRecord = useMutation<
        CreateApplicationRecordResponse,
        Error,
        { token: string; payload: CreateApplicationRecordRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            try {
                const response = await createApplicationRecordUseCase.execute(token, payload);

                // Optional: check for missing required data
                if (!response) {
                    throw new Error("Invalid response from createApplicationRecordUseCase");
                }

                return response;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Unknown error occurred during application record creation";
                console.error("createApplicationRecord mutation failed:", message);
                throw new Error(message); // Ensure it's a proper Error for retry to trigger
            }
        },
        onSuccess: (response) => {
            setData(response);
            console.log("Application record created successfully:", response);
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error creating application record:", error);
            setData(null);
        },
        retry: (failureCount, error) => {
            if (failureCount >= 3) {
                console.error(`Application record creation failed after ${failureCount} attempts:`, error);
                return false;
            }
            const errorMessage = error.message.toLowerCase();
            const isRetryableError =
                errorMessage.includes('400') ||
                errorMessage.includes('500') ||
                errorMessage.includes('internal server error') ||
                errorMessage.includes('network') ||
                errorMessage.includes('timeout') ||
                errorMessage.includes('connection') ||
                errorMessage.includes('fetch');
            if (isRetryableError) {
                console.log(`Retrying application record creation (attempt ${failureCount + 1}/3)...`, error.message);
                return true;
            }
            console.error('Application record creation failed with non-retryable error:', error);
            return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 1s, 2s, 4s, ...
    });

    return {
        createApplicationRecord,
        data,
    };
};