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

export default function SubmissionStage({ onStageChange }: SubmissionStageProps) {
  const stageService = useStageService;
  const { profileData, isAuthenticated } = useHeader();
  const planningPathway = profileData?.user_config?.project?.planning_pathway;

  const showCouncilCard = useMemo(() => {
    return (
      isAuthenticated &&
      (planningPathway === "Complying Development" || planningPathway === "Exempt Development")
    );
  }, [isAuthenticated, planningPathway]);
  
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