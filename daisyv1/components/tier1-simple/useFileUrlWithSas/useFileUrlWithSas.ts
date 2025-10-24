import 'reflect-metadata';
import { GetFileUrlWithSasResponse } from '../../application/models/GetFileUrlWithSasResponse';
import { useState } from 'react';
import container from '@presentation/di';
import { IGetFileUrlWithSasUseCase } from '@application/interfaces/IGetFileUrlWithSasUseCase';
import { useMutation } from '@tanstack/react-query';
import { GetFileUrlWithSasRequest } from '@application/models/GetFileUrlWithSasRequest';
import { handleApiError } from "./handleApiError";

export const useFileUrlWithSas = () => {
    const [data, setData] = useState<GetFileUrlWithSasResponse | null>(null);

    const getFileUrlWithSasUseCase = container.resolve<IGetFileUrlWithSasUseCase>(
        'IGetFileUrlWithSasUseCase'
    );

    const getFileUrlWithSas = useMutation<GetFileUrlWithSasResponse, Error, { token: string; payload: GetFileUrlWithSasRequest }>({
        mutationFn: async ({ token, payload }) => {
            return await getFileUrlWithSasUseCase.execute(token, payload);
        },
        onSuccess: (response) => {
            setData(response); // Update the documents state with the fetched response
        },
        onError:  async (error: Error) => {
            await handleApiError(error);
            console.error('Error fetching document checklist:', error);
            setData(null); // Reset the documents state on error
        },
    });

    return {
        getFileUrlWithSas,
        setData,
        data,
    };
}