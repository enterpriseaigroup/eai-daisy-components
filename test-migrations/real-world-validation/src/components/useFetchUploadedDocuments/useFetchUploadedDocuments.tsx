/**
 * useFetchUploadedDocuments - Configurator V2 Component
 *
 * Component useFetchUploadedDocuments from useFetchUploadedDocuments.ts
 *
 * @migrated from DAISY v1
 */

import "reflect-metadata";
import { useMutation } from "@tanstack/react-query";
import container from "@presentation/di";

import type { IFetchUploadedDocumentsUseCase } from "@application/interfaces/IFetchUploadedDocumentsUseCase";
import type { FetchUploadedDocumentsRequest } from "@application/models/FetchUploadedDocumentsRequest";
import type { FetchUploadedDocumentsResponse } from "@application/models/FetchUploadedDocumentsResponse";
import { useState } from "react";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useFetchUploadedDocuments
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useFetchUploadedDocuments logic
   * 2. Calls helper functions: useState, container.resolve, useMutation, fetchUploadedDocumentsUseCase.execute, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - container.resolve() - Function call
   * - useMutation() - Function call
   * - fetchUploadedDocumentsUseCase.execute() - Function call
   * - setData() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - container.resolve: Required functionality
   * - useMutation: Required functionality
   * - fetchUploadedDocumentsUseCase.execute: Data fetching
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
export const useFetchUploadedDocuments = () => {
    const [data, setData] = useState<FetchUploadedDocumentsResponse[] | null>(null);
    const fetchUploadedDocumentsUseCase = container.resolve<IFetchUploadedDocumentsUseCase>(
        "IFetchUploadedDocumentsUseCase"
    );

    const fetchUploadedDocuments = useMutation<
        FetchUploadedDocumentsResponse[],
        Error,
        { token: string; payload: FetchUploadedDocumentsRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            return await fetchUploadedDocumentsUseCase.execute(token, payload);
        },
        onSuccess: (response) => {
            setData(response);
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error fetching uploaded documents:", error);
            setData(null);
        },
    });

    return {
        fetchUploadedDocuments,
        data,
    };
};