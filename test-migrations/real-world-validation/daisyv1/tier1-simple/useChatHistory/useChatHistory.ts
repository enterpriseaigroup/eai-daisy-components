import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatHistoryUseCase } from "@application/interfaces/IChatHistoryUseCase";
import type { ChatHistoryRequest } from "@application/models/ChatHistoryRequest";
import type { ChatHistoryResponse } from "@application/models/ChatHistoryResponse";
import { handleApiError } from "./handleApiError";

export const useChatHistory = () => {
  const [data, setData] = useState<ChatHistoryResponse[] | null>(null);

  const chatHistory = useMutation<
    ChatHistoryResponse[],
    Error,
    { token: string; payload: ChatHistoryRequest }
  >({
    mutationFn: async ({ token, payload }) => {
      const chatHistoryUseCase = container.resolve<IChatHistoryUseCase>(
        "IChatHistoryUseCase"
      );
      return await chatHistoryUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      console.log("Chat history fetched successfully:", response);
      setData(response); // Update the data state with the response
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      console.error("Error fetching chat history:", error);
      setData(null); // Reset the data state on error
    },
  });

  return {
    chatHistory,
    data,
  };
};