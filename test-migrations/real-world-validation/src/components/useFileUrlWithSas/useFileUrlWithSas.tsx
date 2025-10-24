/**
 * useFileUrlWithSas - Configurator V2 Component
 *
 * Component useFileUrlWithSas from useFileUrlWithSas.ts
 *
 * @migrated from DAISY v1
 */

import 'reflect-metadata';
import { GetFileUrlWithSasResponse } from '../../application/models/GetFileUrlWithSasResponse';
import { useState } from 'react';
import container from '@presentation/di';
import { IGetFileUrlWithSasUseCase } from '@application/interfaces/IGetFileUrlWithSasUseCase';
import { useMutation } from '@tanstack/react-query';
import { GetFileUrlWithSasRequest } from '@application/models/GetFileUrlWithSasRequest';
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useFileUrlWithSas
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useFileUrlWithSas logic
   * 2. Calls helper functions: useState, container.resolve, useMutation, getFileUrlWithSasUseCase.execute, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - container.resolve() - Function call
   * - useMutation() - Function call
   * - getFileUrlWithSasUseCase.execute() - Function call
   * - setData() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - container.resolve: Required functionality
   * - useMutation: Required functionality
   * - getFileUrlWithSasUseCase.execute: Required functionality
   * - setData: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setData: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, container.resolve, useMutation to process data
   * Output: Computed value or side effect
   *
   */
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