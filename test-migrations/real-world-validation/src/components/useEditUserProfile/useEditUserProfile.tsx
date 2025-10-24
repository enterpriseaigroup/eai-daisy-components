/**
 * useEditUserProfile - Configurator V2 Component
 *
 * Component useEditUserProfile from useEditUserProfile.ts
 *
 * @migrated from DAISY v1
 */

import 'reflect-metadata';
import container from "@presentation/di";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { IEditUserProfileUseCase } from '@application/interfaces/IEditUserProfileUseCase';
import { EditUserProfile } from '@domain/entities/EditUserProfile';
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useEditUserProfile
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useEditUserProfile logic
   * 2. Calls helper functions: useState, useMutation, console.log, container.resolve, useCase.execute, console.log, setStatusMessage, handleApiError, console.error, setStatusMessage
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - console.log() - Function call
   * - container.resolve() - Function call
   * - useCase.execute() - Function call
   * - console.log() - Function call
   * - setStatusMessage() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setStatusMessage() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - console.log: Debugging output
   * - container.resolve: Required functionality
   * - useCase.execute: Required functionality
   * - console.log: Debugging output
   * - setStatusMessage: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setStatusMessage: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, console.log to process data
   * Output: Computed value or side effect
   *
   */
export const useEditUserProfile = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const editUserProfile = useMutation<void, Error, { token: string; data: EditUserProfile }>({
    mutationFn: async ({ token, data }) => {
      console.log("[🔄 useEditUserProfile.mutate called with]", data);
      const useCase = container.resolve<IEditUserProfileUseCase>("IEditUserProfileUseCase");
      return await useCase.execute(data, token);
    },
    onSuccess: () => {
      console.log("[✅ editUserProfile SUCCESS]");
      setStatusMessage("Your updates were saved successfully!");
    },
    onError: async (error) => {
      await handleApiError(error);
      console.error("[❌ editUserProfile ERROR]", error);
      setStatusMessage("Failed to submit user request");
    },
  });

  return {
    editUserProfile,
    statusMessage,
  };
};