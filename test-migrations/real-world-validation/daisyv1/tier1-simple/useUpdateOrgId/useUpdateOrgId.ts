import container from "@presentation/di";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { IUpdateOrgIdUseCase } from "@application/interfaces/IUpdateOrgIdUseCase";
import type { UpdateOrgIdRequest } from "@application/models/UpdateOrgIdRequest";
import { handleApiError } from "./handleApiError";

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