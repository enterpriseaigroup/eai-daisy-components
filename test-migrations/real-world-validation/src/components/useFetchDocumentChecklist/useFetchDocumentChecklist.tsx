/**
 * useFetchDocumentChecklist - Configurator V2 Component
 *
 * Component useFetchDocumentChecklist from useFetchDocumentChecklist.ts
 *
 * @migrated from DAISY v1
 */

import "reflect-metadata";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import container from '@presentation/di'; // Adjust the import path as necessary

import { IFetchDocumentChecklistUseCase } from "@application/interfaces/IFetchDocumentChecklistUseCase";
import { Document } from "@domain/entities/Document";
import { FetchDocumentChecklistRequest } from "@application/models/FetchDocumentChecklistRequest";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useFetchDocumentChecklist
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useFetchDocumentChecklist logic
   * 2. Calls helper functions: useState, container.resolve, useMutation, fetchDocumentChecklistUseCase.execute, response.map, crypto.randomUUID, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - container.resolve() - Function call
   * - useMutation() - Function call
   * - fetchDocumentChecklistUseCase.execute() - Function call
   * - response.map() - Function call
   * - crypto.randomUUID() - Function call
   * - setData() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - container.resolve: Required functionality
   * - useMutation: Required functionality
   * - fetchDocumentChecklistUseCase.execute: Data fetching
   * - response.map: Required functionality
   * - crypto.randomUUID: Required functionality
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