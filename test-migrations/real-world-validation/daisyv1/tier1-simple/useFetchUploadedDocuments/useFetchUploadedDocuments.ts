import "reflect-metadata";
import { useMutation } from "@tanstack/react-query";
import container from "@presentation/di";

import type { IFetchUploadedDocumentsUseCase } from "@application/interfaces/IFetchUploadedDocumentsUseCase";
import type { FetchUploadedDocumentsRequest } from "@application/models/FetchUploadedDocumentsRequest";
import type { FetchUploadedDocumentsResponse } from "@application/models/FetchUploadedDocumentsResponse";
import { useState } from "react";
import { handleApiError } from "./handleApiError";

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