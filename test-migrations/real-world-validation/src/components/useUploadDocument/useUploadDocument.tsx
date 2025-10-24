/**
 * useUploadDocument - Configurator V2 Component
 *
 * Component useUploadDocument from useUploadDocument.ts
 *
 * @migrated from DAISY v1
 */

import "reflect-metadata";
import { useState } from 'react';

import type { IUploadDocumentUseCase } from '@application/interfaces/IUploadDocumentUseCase';
import { useMutation } from '@tanstack/react-query';
import type { UploadDocumentResponse } from '@application/models/UploadDocumentResponse';
import container from '@presentation/di';
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useUploadDocument
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useUploadDocument logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, uploadDocumentUseCase.execute, console.log, setData, console.log, handleApiError, setData, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - uploadDocumentUseCase.execute() - Function call
   * - console.log() - Function call
   * - setData() - Function call
   * - console.log() - Function call
   * - handleApiError() - Function call
   * - setData() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - uploadDocumentUseCase.execute: Required functionality
   * - console.log: Debugging output
   * - setData: State update
   * - console.log: Debugging output
   * - handleApiError: Required functionality
   * - setData: State update
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
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