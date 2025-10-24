/**
 * useUpdateOrgId - Configurator V2 Component
 *
 * Component useUpdateOrgId from useUpdateOrgId.ts
 *
 * @migrated from DAISY v1
 */

import container from "@presentation/di";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { IUpdateOrgIdUseCase } from "@application/interfaces/IUpdateOrgIdUseCase";
import type { UpdateOrgIdRequest } from "@application/models/UpdateOrgIdRequest";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useUpdateOrgId
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useUpdateOrgId logic
   * 2. Calls helper functions: useState, useMutation, console.log, container.resolve, updateOrgIdUseCase.execute, console.log, setOrgIdStatus, handleApiError, console.error, setOrgIdStatus
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - console.log() - Function call
   * - container.resolve() - Function call
   * - updateOrgIdUseCase.execute() - Function call
   * - console.log() - Function call
   * - setOrgIdStatus() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setOrgIdStatus() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - console.log: Debugging output
   * - container.resolve: Required functionality
   * - updateOrgIdUseCase.execute: Required functionality
   * - console.log: Debugging output
   * - setOrgIdStatus: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setOrgIdStatus: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, console.log to process data
   * Output: Computed value or side effect
   *
   */
export const useUpdateOrgId = () => {
  const [data, setOrgIdStatus] = useState<string | null>(null);

  const updateOrgId = useMutation<void, Error, { token: string; orgId: string }>({
    mutationFn: async ({ token, orgId }) => {
      console.log("[🔄 updateOrgId.mutate called with]", { token, orgId });
      const payload: UpdateOrgIdRequest = { org_id: orgId };
      const updateOrgIdUseCase = container.resolve<IUpdateOrgIdUseCase>("IUpdateOrgIdUseCase");
      return await updateOrgIdUseCase.execute(token, payload);
    },
    onSuccess: () => {
      console.log("[✅ updateOrgId SUCCESS]");
      setOrgIdStatus('Org ID updated successfully');
    },
    onError: async (error) => {
      await handleApiError(error);
      console.error('Error updating Org ID:', error);
      setOrgIdStatus('Failed to update Org ID');
    },
  });

  return {
    updateOrgId,
    data,
  };
};