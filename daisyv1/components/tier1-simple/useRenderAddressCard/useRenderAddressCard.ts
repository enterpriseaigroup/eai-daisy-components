// src/app/(presentation)/hooks/useRenderAddressCard.ts

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IRenderAddressCardUseCase } from "@application/interfaces/IRenderAddressCardUseCase";
import type { RenderAddressCardRequest } from "@application/models/RenderAddressCardRequest";
import type { ChatMessage } from "@domain/entities/ProfileData"; // Use ChatMessage
import { handleApiError } from "./handleApiError";

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