/**
 * useRenderAddressCard - Configurator V2 Component
 *
 * Component useRenderAddressCard from useRenderAddressCard.ts
 *
 * @migrated from DAISY v1
 */

// src/app/(presentation)/hooks/useRenderAddressCard.ts

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IRenderAddressCardUseCase } from "@application/interfaces/IRenderAddressCardUseCase";
import type { RenderAddressCardRequest } from "@application/models/RenderAddressCardRequest";
import type { ChatMessage } from "@domain/entities/ProfileData"; // Use ChatMessage
import { handleApiError } from "./handleApiError";

  /**
   * BUSINESS LOGIC: useRenderAddressCard
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useRenderAddressCard logic
   * 2. Calls helper functions: useState, useMutation, container.resolve, renderAddressCardUseCase.execute, console.log, setData, handleApiError, console.error, setData
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useMutation() - Function call
   * - container.resolve() - Function call
   * - renderAddressCardUseCase.execute() - Function call
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
   * - renderAddressCardUseCase.execute: Required functionality
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
export const useRenderAddressCard = () => {
  const [data, setData] = useState<ChatMessage | null>(null); // State to hold ChatMessage

  const renderAddressCardMutation = useMutation<
    ChatMessage, // Success response type is ChatMessage
    Error,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      const renderAddressCardUseCase = container.resolve<IRenderAddressCardUseCase>(
        "IRenderAddressCardUseCase"
      );
      const payload: RenderAddressCardRequest = { id };
      return await renderAddressCardUseCase.execute(payload);
    },
    onSuccess: (response) => {
      console.log("Address card rendered successfully:", response);
      setData(response); // Update the data state with ChatMessage
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      console.error("Error rendering address card:", error);
      setData(null); // Reset the data state
    },
  });

  return {
    renderAddressCardMutation,
    data,
  };
};