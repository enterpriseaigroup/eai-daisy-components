import "reflect-metadata";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di'; // Adjust the import path as necessary

import { IFetchDocumentChecklistUseCase } from "@application/interfaces/IFetchDocumentChecklistUseCase";
import { Document } from "@domain/entities/Document";
import { FetchDocumentChecklistRequest } from "@application/models/FetchDocumentChecklistRequest";
import { handleApiError } from "./handleApiError";

export const useFetchDocumentChecklist = () => {
  const [data, setData] = useState<Document[] | null>(null);

  const fetchDocumentChecklistUseCase = container.resolve<IFetchDocumentChecklistUseCase>(
    "IFetchDocumentChecklistUseCase"
  );

  // Fetch document checklist
  const fetchDocumentChecklist = useMutation<Document[], Error, { token: string; payload: FetchDocumentChecklistRequest }>({
    mutationFn: async ({ token, payload }) => {
      // Wrap the UserConfig object in a FetchDocumentChecklistRequest
      return await fetchDocumentChecklistUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      const mappedDocuments = response.map((doc) => ({
        ...doc,
        ApplicationDocumentId: doc.ApplicationDocumentId || doc.CouncilDocumentId || crypto.randomUUID(),
        infoDescription: doc.Description // Store original description
      }));
      setData(mappedDocuments); // Ensure ApplicationDocumentId is always defined
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      console.error("Error fetching document checklist:", error);
      setData(null); // Reset the documents state on error
    },
  });

  return {
    fetchDocumentChecklist,
    data,
  };
};