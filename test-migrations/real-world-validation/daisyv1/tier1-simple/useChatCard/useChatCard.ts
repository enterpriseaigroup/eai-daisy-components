import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatCardUseCase } from "@application/interfaces/IChatCardUseCase";
import type { ChatCardRequest } from "@application/models/ChatCardRequest";
import type { ChatCardResponse } from "@application/models/ChatCardResponse";
import { handleApiError } from "./handleApiError";

export const useChatCard = () => {
  const [data, setData] = useState<ChatCardResponse | null>(null);

  const chatCard = useMutation<
    ChatCardResponse,
    Error,
    { token: string; payload: ChatCardRequest }
  >({
    mutationFn: async ({ token, payload }) => {
      const chatCardUseCase = container.resolve<IChatCardUseCase>(
        "IChatCardUseCase"
      );
      return await chatCardUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      console.log("Chat card created successfully:", response);
      setData(response); // Update the data state with the response
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      console.error("Error creating chat card:", error);
      setData(null); // Reset the data state on error
    },
  });

  return {
    chatCard,
    data,
  };
};