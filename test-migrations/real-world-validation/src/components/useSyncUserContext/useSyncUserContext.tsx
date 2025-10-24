/**
 * useSyncUserContext - Configurator V2 Component
 *
 * Component useSyncUserContext from useSyncUserContext.ts
 *
 * @migrated from DAISY v1
 */

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { ISyncUserContextUseCase } from "@application/interfaces/ISyncUserContextUseCase";
import type { SyncUserContextRequest } from "@application/models/SyncUserContextRequest";
import type { SyncUserContextResponse } from "@application/models/SyncUserContextResponse";
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useSyncUserContext
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useSyncUserContext logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, syncUserContextService.execute, console.log, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - syncUserContextService.execute() - Function call
   * - console.log() - Function call
   * - setData() - Function call
   * - handleApiError() - Function call
   * - console.error() - Function call
   * - setData() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useMutation: Required functionality
   * - container.resolve: Required functionality
   * - syncUserContextService.execute: Required functionality
   * - console.log: Debugging output
   * - setData: State update
   * - handleApiError: Required functionality
   * - console.error: Error logging
   * - setData: State update
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useMutation, container.resolve to process data
   * Output: Computed value or side effect
   *
   */
export const useSyncUserContext = () => {
    const [data, setData] = useState<SyncUserContextResponse | null>(null);

    const syncUserContext = useMutation<
        SyncUserContextResponse,
        Error,
        { token: string; payload: SyncUserContextRequest }
    >({
        mutationFn: async ({ token, payload }) => {
            const syncUserContextService = container.resolve<ISyncUserContextUseCase>(
                "ISyncUserContextUseCase"
            );
            return await syncUserContextService.execute(token, payload);
        },
        onSuccess: (response) => {
            console.log("User Config migrated successfully:", response);
            setData(response); // Update the data state with the response
        },
        onError: async (error: Error) => {
            await handleApiError(error);
            console.error("Error migrating user config:", error);
            setData(null); // Reset the data state on error
        },
    });

    return {
        syncUserContext,
        data,
    };
};