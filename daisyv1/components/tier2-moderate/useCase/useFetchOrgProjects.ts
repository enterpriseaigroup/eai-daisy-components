import "reflect-metadata";
import { useQuery } from "@tanstack/react-query";
import { container } from "tsyringe";
import { OrgProject } from "@domain/entities/OrgProject";
import { useProfileStore } from "@presentation/store/useProfileStore";
import { useCallback } from "react";
import { IOrgProjectUseCase } from "@application/interfaces/IOrgProjectUseCase";
import { handleApiError } from "@/app/(presentation)/hooks/handleApiError"; // 🔁 adjust path as needed

export function useFetchOrgProjects(orgId?: string, token?: string) {
  const { setCurrentProject } = useProfileStore();

  const fetchOrgProjects = useCallback(async (): Promise<OrgProject[]> => {
    if (!orgId || !token) {
      throw new Error("orgId and token are required");
    }

    const useCase = container.resolve<IOrgProjectUseCase>("IOrgProjectUseCase");

    try {
      return await useCase.execute(orgId, token);
    } catch (error) {
      await handleApiError(error as Error);
      console.error("[useFetchOrgProjects] Error:", error);
      throw error;
    }
  }, [orgId, token]);

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrgProject[], Error, OrgProject[], [string, string?, string?]>({
    queryKey: ["orgProjects", orgId, token],
    queryFn: fetchOrgProjects,
    enabled: !!orgId && !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    projects,
    loading: isLoading,
    isError,
    error,
    setCurrentProject,
    refetch,
  };
}