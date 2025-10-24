/**
 * SubmissionStage - Configurator V2 Component
 *
 * Component SubmissionStage from SubmissionStage.tsx
 *
 * @migrated from DAISY v1
 */

"use client";

import React, { useMemo } from "react";
import DocumentDownloadPanel from "../DownloadDocuments/DocumentDownloadPanel";
import CouncilSubmissionCards from "../councilSubmissionCards/CouncilSubmissionCards";
import { useHeader } from "../Headers/Header/useHeader";
import { useStageService } from "@presentation/hooks/useStageService";
import { StageType } from "@domain/entities/ApplicationStage";

interface SubmissionStageProps {
  onStageChange: (stage: StageType) => void;
}

  /**
   * BUSINESS LOGIC: SubmissionStage
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements SubmissionStage logic
   * 2. Calls helper functions: useHeader, useMemo, stageService.setStage, onStageChange, stageService.getPreviousStage, console.log, goToStage, stageService.getPreviousStage, console.log, goToStage
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useHeader() - Function call
   * - useMemo() - Function call
   * - stageService.setStage() - Function call
   * - onStageChange() - Function call
   * - stageService.getPreviousStage() - Function call
   * - console.log() - Function call
   * - goToStage() - Function call
   * - stageService.getPreviousStage() - Function call
   * - console.log() - Function call
   * - goToStage() - Function call
   *
   * WHY IT CALLS THEM:
   * - useHeader: Required functionality
   * - useMemo: Required functionality
   * - stageService.setStage: State update
   * - onStageChange: Required functionality
   * - stageService.getPreviousStage: Required functionality
   * - console.log: Debugging output
   * - goToStage: Required functionality
   * - stageService.getPreviousStage: Required functionality
   * - console.log: Debugging output
   * - goToStage: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useHeader, useMemo, stageService.setStage to process data
   * Output: Computed value or side effect
   *
   */
export default function SubmissionStage({ onStageChange }: SubmissionStageProps) {
  const stageService = useStageService;
  const { profileData, isAuthenticated } = useHeader();
  const planningPathway = profileData?.user_config?.project?.planning_pathway;

    /**
     * BUSINESS LOGIC: showCouncilCard
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * DATA FLOW:
     * Input: isAuthenticated, planningPathway state/props
     * Processing: Processes data and applies business logic
     * Output: Computed value or side effect
     *
     * DEPENDENCIES:
     * - isAuthenticated: Triggers when isAuthenticated changes
     * - planningPathway: Triggers when planningPathway changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const showCouncilCard = useMemo(() => {
    return (
      isAuthenticated &&
      (planningPathway === "Complying Development" || planningPathway === "Exempt Development")
    );
  }, [isAuthenticated, planningPathway]);
  
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
    stageService.setStage(stage);  // ✅ Tracks previous internally
    onStageChange(stage);          // ✅ Updates application state
  };

  return (
    <div className="flex flex-col gap-4">
      {!showCouncilCard && (
        <DocumentDownloadPanel
          userConfig={profileData?.user_config ?? null}
          previousStage={stageService.getPreviousStage()}
          goBackToStage={(stage) => {
            console.log("Going back to:", stage);
            goToStage(stage); // ✅ use goToStage instead of setStage directly
          }}
        />
      )}

      {showCouncilCard && (
        <CouncilSubmissionCards
          activeCard={
            planningPathway === "Complying Development" ? "CDC" :
            planningPathway === "Exempt Development" ? "EXEMPT" :
            null
          }
          previousStage={stageService.getPreviousStage()}
          goBackToStage={(stage) => {
            console.log("Going back to:", stage);
            goToStage(stage);
          }}
        />
      )}
    </div>
  );
}