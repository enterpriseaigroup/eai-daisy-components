'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { StageType } from '@domain/entities/ApplicationStage';
import { StageService } from '@application/usecases/StageServiceUseCase';
import { StageContent } from './StageContent';
import { TestProvider } from '@presentation/context/TestContext';
import { useProfileStore } from '@presentation/store/useProfileStore';
import clarity from '@microsoft/clarity';

// Custom event tracking for Clarity
const trackStageVisit = (stage: StageType, userId?: string) => {
  try {
    // Only track if Clarity ID is configured
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (!clarityId) {
      console.warn(`[Stage Analytics] Clarity not configured, skipping track for stage: ${stage}`);
      return;
    }
    // Track with Microsoft Clarity using the proper API
    clarity.event(`stage_visit_${stage}`);
    // Set custom tags for additional context
    clarity.setTag(`current_stage`, stage);
    clarity.setTag(`user_id`, userId || 'anonymous');
    // Also log for development/debugging
    console.log(`[Stage Analytics] User visited stage: ${stage}`, {
      stage,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track stage visit:', error);
  }
};

const mapStateToStage: Record<string, StageType> = {
  qa: 'property',
  planning_pathway: 'project',
  document_checklist: 'documents',
  application: 'application',
};

export function StageManager() {
  const profileData = useProfileStore((state) => state.profileData);
  // Don't always default to propertyStage onRefresh, look at profileStore state
  const initialStage: StageType = useMemo(() => {
    const storedState = profileData?.user_config?.state;
    return mapStateToStage[storedState as keyof typeof mapStateToStage] ?? 'property';
  }, [profileData?.user_config?.state]);
  const [currentStage, setCurrentStage] = useState<StageType>(initialStage);
  const [isMounted, setIsMounted] = useState(false);
  const stageService = useMemo(() => new StageService(), []);

  useEffect(() => {
    setIsMounted(true);
    console.log("user_config.state on mount:", profileData?.user_config?.state);
    console.log("Resolved initial stage:", initialStage);
    // Track initial stage visit
    if (initialStage) {
      trackStageVisit(initialStage, profileData?.id);
    }
  }, [initialStage, profileData?.user_config?.state, profileData?.id, isMounted]);

  // THIS IS THE MAIN HANDLER THAT CONTROLS CHANGE IN STAGE CONTENT & STAGE PROGRESS
  // TO ENSURE ITS GOING TO HAPPEN, WE NEED TO PASS THIS AS A PROPS ACROSS THE FAMILY TREE
  const handleStageChange = useCallback((newStage: StageType) => {
    setCurrentStage(newStage);
    // Track stage change
    trackStageVisit(newStage, profileData?.id);
  }, [profileData?.id]);
  // if (!isMounted) {
  //   return null; // or return <LoginLoader />;
  // }
  return (
    <TestProvider>
      <div className="flex flex-col w-full h-full overflow-hidden bg-[#F6F6F6]">
        <StageContent
          stage={currentStage}
          onStageChange={handleStageChange}
          stageService={stageService}
        />
      </div>
    </TestProvider>
  );
}