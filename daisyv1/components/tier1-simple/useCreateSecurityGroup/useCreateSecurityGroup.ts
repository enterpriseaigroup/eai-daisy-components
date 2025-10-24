import 'reflect-metadata';
import { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di';

import type { CreateSecurityGroupRequest } from "@application/models/CreateSecurityGroupRequest";
import type { CreateSecurityGroupResponse } from "@application/models/CreateSecurityGroupResponse";
import type { ICreateSecurityGroupUseCase } from "@application/interfaces/ICreateSecurityGroupUseCase";
import { handleApiError } from "./handleApiError";

export const useCreateSecurityGroup = () => {
    const [data, setData] = useState<CreateSecurityGroupResponse | null>(null);
    const createSecurityGroupUseCase = container.resolve<ICreateSecurityGroupUseCase>("ICreateSecurityGroupUseCase");

    const createSecurityGroup = useMutation<
        CreateSecurityGroupResponse,
        Error,
        { token: string; payload: CreateSecurityGroupRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            try {
                const response = await createSecurityGroupUseCase.execute(token, payload);

                // Optional: validate response if needed
                if (!response) {
                    throw new Error("Invalid response from createSecurityGroupUseCase");
                }

                return response;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Unknown error occurred during security group creation";
                console.error("createSecurityGroup mutation failed:", message);
                throw new Error(message); // Ensure it's a proper Error for retry to trigger
            }
        },
        onSuccess: (response) => {
            setData(response);
            console.log("Security group created successfully:", response);
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error creating security group:", error);
            setData(null);
        },
        retry: (failureCount, error) => {
            if (failureCount >= 3) {
                console.error(`Security group creation failed after ${failureCount} attempts:`, error);
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
                console.log(`Retrying security group creation (attempt ${failureCount + 1}/3)...`, error.message);
                return true;
            }

            console.error('Security group creation failed with non-retryable error:', error);
            return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 1s, 2s, 4s, ...
    });

    return {
        createSecurityGroup,
        data,
    };
};
