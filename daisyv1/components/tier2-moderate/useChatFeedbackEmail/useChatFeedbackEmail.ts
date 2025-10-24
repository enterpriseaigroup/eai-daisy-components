import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import container from "@presentation/di";

import type { IChatFeedbackEmailUseCase } from "@application/interfaces/IChatFeedbackEmailUseCase";
import type { ChatFeedbackEmailRequest } from "@application/models/ChatFeedbackEmailRequest";
import type { ChatFeedbackEmailResponse } from "@application/models/ChatFeedbackEmailResponse";
import { handleApiError } from "./handleApiError";

export const useChatFeedbackEmail = () => {
  const [data, setData] = useState<ChatFeedbackEmailResponse | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const ChatFeedbackEmail = useMutation<
    ChatFeedbackEmailResponse,
    Error,
    { token: string; payload: ChatFeedbackEmailRequest }
  >({
    mutationFn: async ({ token, payload }) => {
      const ChatFeedbackEmailUseCase = container.resolve<IChatFeedbackEmailUseCase>(
        "IChatFeedbackEmailUseCase"
      );
      return await ChatFeedbackEmailUseCase.execute(token, payload);
    },
    onSuccess: (response) => {
      setData(response); // Update the data state with the response
      setIsSuccess(true);
      setError(null);
    },
    onError: async (error: Error) => {
      await handleApiError(error);
      setData(null); // Reset the data state on error
      setIsSuccess(false);
      setError(error);
    },
  });

  return {
    ChatFeedbackEmail,
    data,
    isSuccess,
    error,
  };
};