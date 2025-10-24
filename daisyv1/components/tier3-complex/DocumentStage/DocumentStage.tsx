'use client';

import { UserConfig } from '@domain/entities/ProfileData';
import DocumentChecklistPanel from "@presentation/components/MiddleColumn/DocumentChecklistPanel";
import { useProfileStore } from '@presentation/store/useProfileStore';
import { useEffect } from "react";
import { StageType } from '@domain/entities/ApplicationStage';
import { useStageService } from '../../hooks/useStageService';
import { safeUpdateUserConfig } from '../chatbot/utils/safeUpdateUserConfig';

interface DocumentStageProps {
  onStageChange: (stage: StageType) => void;
}

export default function DocumentStage({ onStageChange }: DocumentStageProps) {
  const stageService = useStageService;

  const { profileData, hasApplicationBeenCreated } = useProfileStore();
  const userConfig: UserConfig = profileData?.user_config ?? {} as UserConfig;

  const goToStage = (stage: StageType) => {
    stageService.setStage(stage);
    onStageChange(stage);
  };

  const handleNext = (updatedUserConfig: UserConfig) => {
    console.log("Updated User Config:", updatedUserConfig);
    goToStage('application');
  };

  // Set state on mount
  useEffect(() => {
    const { getProfileData, updateUserConfig } = useProfileStore.getState();
    const profileData = getProfileData();
    if (profileData) {
      safeUpdateUserConfig("user_config.state", "document_checklist", profileData, updateUserConfig);
    }
  }, []);

  if (!hasApplicationBeenCreated) {
    return (
      <div className="flex items-center justify-center w-full h-[300px] text-gray-700 text-sm sm:text-base">
        Loading your document checklist...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DocumentChecklistPanel
        userConfig={userConfig}
        onNext={handleNext}
        previousStage={stageService.getPreviousStage()}
        goBackToStage={(stage: StageType) => {
          console.log("Going back to:", stage);
          goToStage(stage);
        }}
      />
    </div>
  );
}