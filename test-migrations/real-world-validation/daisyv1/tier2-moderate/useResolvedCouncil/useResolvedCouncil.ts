// src/app/(presentation)/hooks/useResolvedCouncil.ts
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';          // Next.js App Router
import { useProfileStore } from '@presentation/store/useProfileStore';
import { getCouncilByName } from '@presentation/constants/councilMappings';

export function useResolvedCouncil() {
  // 👉 DO NOT destructure – this hook returns ONE URLSearchParams object
  const searchParams = useSearchParams();
  const { profileData } = useProfileStore();

  return useMemo(() => {
    const fromQuery = searchParams.get('Council');
    if (fromQuery?.trim()) {
      return fromQuery;
    }

    const project = profileData?.user_config?.project;
    const mapping = getCouncilByName(
      project?.council_name,
      profileData?.current_org_id,
    );
    if (mapping?.name) {
      return mapping.name;
    }

    return 'Default';
  }, [searchParams, profileData]);
}