import 'reflect-metadata';
import container from "@presentation/di";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { IEditUserProfileUseCase } from '@application/interfaces/IEditUserProfileUseCase';
import { EditUserProfile } from '@domain/entities/EditUserProfile';
import { handleApiError } from "./handleApiError";

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