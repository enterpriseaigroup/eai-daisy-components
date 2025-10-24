/**
 * DocumentStage - Configurator V2 Component
 *
 * Component DocumentStage from DocumentStage.tsx
 *
 * @migrated from DAISY v1
 */

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

  /**
   * BUSINESS LOGIC: DocumentStage
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements DocumentStage logic
   * 2. Calls helper functions: useProfileStore, stageService.setStage, onStageChange, console.log, goToStage, useEffect, useProfileStore.getState, getProfileData, safeUpdateUserConfig, stageService.getPreviousStage, console.log, goToStage
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - stageService.setStage() - Function call
   * - onStageChange() - Function call
   * - console.log() - Function call
   * - goToStage() - Function call
   * - useEffect() - Function call
   * - useProfileStore.getState() - Function call
   * - getProfileData() - Function call
   * - safeUpdateUserConfig() - Function call
   * - stageService.getPreviousStage() - Function call
   * - console.log() - Function call
   * - goToStage() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - stageService.setStage: State update
   * - onStageChange: Required functionality
   * - console.log: Debugging output
   * - goToStage: Required functionality
   * - useEffect: Required functionality
   * - useProfileStore.getState: Required functionality
   * - getProfileData: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - stageService.getPreviousStage: Required functionality
   * - console.log: Debugging output
   * - goToStage: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, stageService.setStage, onStageChange to process data
   * Output: Computed value or side effect
   *
   */
export default function DocumentStage({ onStageChange }: DocumentStageProps) {
  const stageService = useStageService;

  const { profileData, hasApplicationBeenCreated } = useProfileStore();
  const userConfig: UserConfig = profileData?.user_config ?? {} as UserConfig;

    /**
     * BUSINESS LOGIC: goToStage
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements goToStage logic
     * 2. Calls helper functions: stageService.setStage, onStageChange
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - stageService.setStage() - Function call
     * - onStageChange() - Function call
     *
     * WHY IT CALLS THEM:
     * - stageService.setStage: State update
     * - onStageChange: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls stageService.setStage, onStageChange to process data
     * Output: Computed value or side effect
     *
     */
  const goToStage = (stage: StageType) => {
    stageService.setStage(stage);
    onStageChange(stage);
  };

    /**
     * BUSINESS LOGIC: handleNext
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements handleNext logic
     * 2. Calls helper functions: console.log, goToStage
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - console.log() - Function call
     * - goToStage() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.log: Debugging output
     * - goToStage: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls console.log, goToStage to process data
     * Output: Computed value or side effect
     *
     */
  const handleNext = (updatedUserConfig: UserConfig) => {
    console.log("Updated User Config:", updatedUserConfig);
    goToStage('application');
  };

  // Set state on mount
    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Executes useProfileStore.getState, getProfileData, safeUpdateUserConfig functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - useProfileStore.getState() - Function call
     * - getProfileData() - Function call
     * - safeUpdateUserConfig() - Function call
     *
     * WHY IT CALLS THEM:
     * - useProfileStore.getState: Required functionality
     * - getProfileData: Required functionality
     * - safeUpdateUserConfig: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls useProfileStore.getState, getProfileData, safeUpdateUserConfig to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
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