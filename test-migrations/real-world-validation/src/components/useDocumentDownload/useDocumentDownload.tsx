/**
 * useDocumentDownload - Configurator V2 Component
 *
 * Component useDocumentDownload from useDocumentDownload.ts
 *
 * @migrated from DAISY v1
 */

import 'reflect-metadata';
import { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di';

import type { DocumentDownloadRequest } from "@application/models/DocumentDownloadRequest";
import { IDocumentDownloadUseCase } from '@application/interfaces/IDocumentDownloadUseCase';
import { handleApiError } from "./handleApiError";

interface CurrentProject {
    id: string;
    title: string;
    description?: string;
}

  /**
   * BUSINESS LOGIC: useDocumentDownload
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useDocumentDownload logic
   * 2. Calls helper functions: useState, container.resolve, useMutation, documentDownloadUseCase.execute, setData, .createObjectURL, document.createElement, .trim, .replace, .replace, .appendChild, a.click, a.remove, .revokeObjectURL, console.log, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - container.resolve() - Function call
   * - useMutation() - Function call
   * - documentDownloadUseCase.execute() - Function call
   * - setData() - Function call
   * - .createObjectURL() - Function call
   * - document.createElement() - Function call
   * - .trim() - Function call
   * - .replace() - Function call
   * - .replace() - Function call
   * - .appendChild() - Function call
   * - a.click() - Function call
   * - a.remove() - Function call
   * - .revokeObjectURL() - Function call
   * - console.log() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - container.resolve: Required functionality
   * - useMutation: Required functionality
   * - documentDownloadUseCase.execute: Required functionality
   * - setData: State update
   * - .createObjectURL: Required functionality
   * - document.createElement: Required functionality
   * - .trim: Required functionality
   * - .replace: Required functionality
   * - .replace: Required functionality
   * - .appendChild: Required functionality
   * - a.click: Required functionality
   * - a.remove: Required functionality
   * - .revokeObjectURL: Required functionality
   * - console.log: Debugging output
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
export const useDocumentDownload = () => {
    const [data, setData] = useState<Blob | null>(null);
    const documentDownloadUseCase = container.resolve<IDocumentDownloadUseCase>("IDocumentDownloadUseCase");

    const downloadDocuments = useMutation<Blob, Error, { 
        token: string; 
        payload: DocumentDownloadRequest;
        currentProject?: CurrentProject;
    }>({
        mutationFn: async ({ token, payload }) => {
            return await documentDownloadUseCase.execute(token, payload);
        },
        onSuccess: (response, variables) => {
            setData(response);
            const url = window.URL.createObjectURL(response);
            const a = document.createElement("a");
            a.href = url;
            // Use current project title for filename, fallback to "documents" if not available
            const sanitizedTitle = variables.currentProject?.title
                ?.replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
                ?.replace(/\s+/g, '_') // Replace spaces with underscores
                ?.trim() || 'documents';
            a.download = `${sanitizedTitle}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            console.log(`Documents downloaded successfully: ${sanitizedTitle}.zip`);
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error downloading documents:", error);
            setData(null);
        },
    });

    return {
        downloadDocuments,
        setData,
        data,
    };
};