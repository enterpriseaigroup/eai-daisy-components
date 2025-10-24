import "reflect-metadata";
import  { useState } from 'react';

import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di'; // Adjust the import path as necessary

import type { IAnonMessageUseCase } from "@application/interfaces/IAnonMessageUseCase";
import type { AnonMessageRequest } from "@application/models/AnonMessageRequest";
import type { AnonMessageResponse } from "@application/models/AnonMessageResponse";
import { handleApiError } from "./handleApiError";

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