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