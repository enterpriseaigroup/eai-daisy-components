import "reflect-metadata";
import { useState } from 'react';

import type { IUploadDocumentUseCase } from '@application/interfaces/IUploadDocumentUseCase';
import { useMutation } from '@tanstack/react-query';
import type { UploadDocumentResponse } from '@application/models/UploadDocumentResponse';
import container from '@presentation/di';
import { handleApiError } from "./handleApiError";

export const useUploadDocument = () => {
    const [data, setData] = useState<UploadDocumentResponse | null>(null);

    const uploadDocument = useMutation<UploadDocumentResponse, Error, { token: string, payload: FormData }>({
        mutationFn: async ({ token, payload }) => {
            const uploadDocumentUseCase = container.resolve<IUploadDocumentUseCase>(
                'IUploadDocumentUseCase'
            );
            return await uploadDocumentUseCase.execute(token, payload);
        },
        onSuccess: (response) => {
            console.log('Document uploaded successfully:', response);
            setData(response); // Update the data state with the fetched response
            console.log('Response:', data);

        },
        onError: async (error: Error) => {
            await handleApiError(error);
            setData(null); // Reset the data state on error
            console.error('Error uploading document:', error);
        },
    });

    return {
        uploadDocument,
        setData,
        data,
    };
}