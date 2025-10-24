/**
 * StageManager - Configurator V2 Component
 *
 * Component StageManager from StageManager.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { StageType } from '@domain/entities/ApplicationStage';
import { StageService } from '@application/usecases/StageServiceUseCase';
import { StageContent } from './StageContent';
import { TestProvider } from '@presentation/context/TestContext';
import { useProfileStore } from '@presentation/store/useProfileStore';
import clarity from '@microsoft/clarity';

// Custom event tracking for Clarity
  /**
   * BUSINESS LOGIC: trackStageVisit
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements trackStageVisit logic
   * 2. Calls helper functions: console.warn, clarity.event, clarity.setTag, clarity.setTag, console.log, .toISOString, console.error
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - console.warn() - Function call
   * - clarity.event() - Function call
   * - clarity.setTag() - Function call
   * - clarity.setTag() - Function call
   * - console.log() - Function call
   * - .toISOString() - Function call
   * - console.error() - Function call
   *
   * WHY IT CALLS THEM:
   * - console.warn: Warning notification
   * - clarity.event: Required functionality
   * - clarity.setTag: State update
   * - clarity.setTag: State update
   * - console.log: Debugging output
   * - .toISOString: Required functionality
   * - console.error: Error logging
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls console.warn, clarity.event, clarity.setTag to process data
   * Output: Computed value or side effect
   *
   */
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

  /**
   * BUSINESS LOGIC: StageManager
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements StageManager logic
   * 2. Calls helper functions: useProfileStore, useMemo, useState, useState, useMemo, useEffect, setIsMounted, console.log, console.log, trackStageVisit, useCallback, setCurrentStage, trackStageVisit
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - useMemo() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useMemo() - Function call
   * - useEffect() - Function call
   * - setIsMounted() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - trackStageVisit() - Function call
   * - useCallback() - Function call
   * - setCurrentStage() - Function call
   * - trackStageVisit() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - useMemo: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useMemo: Required functionality
   * - useEffect: Required functionality
   * - setIsMounted: State update
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - trackStageVisit: Analytics tracking
   * - useCallback: Required functionality
   * - setCurrentStage: State update
   * - trackStageVisit: Analytics tracking
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, useMemo, useState to process data
   * Output: Computed value or side effect
   *
   */
export function StageManager() {
  const profileData = useProfileStore((state) => state.profileData);
  // Don't always default to propertyStage onRefresh, look at profileStore state
    /**
     * BUSINESS LOGIC: initialStage
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Processes data and applies business logic
     * Output: Computed value or side effect
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const initialStage: StageType = useMemo(() => {
    const storedState = profileData?.user_config?.state;
    return mapStateToStage[storedState as keyof typeof mapStateToStage] ?? 'property';
  }, [profileData?.user_config?.state]);
  const [currentStage, setCurrentStage] = useState<StageType>(initialStage);
  const [isMounted, setIsMounted] = useState(false);
    /**
     * BUSINESS LOGIC: stageService
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements business logic
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Processes data and applies business logic
     * Output: Computed value or side effect
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const stageService = useMemo(() => new StageService(), []);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors initialStage, isMounted for changes
     * 2. Executes setIsMounted, console.log, console.log, trackStageVisit functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - setIsMounted() - Function call
     * - console.log() - Function call
     * - console.log() - Function call
     * - trackStageVisit() - Function call
     *
     * WHY IT CALLS THEM:
     * - setIsMounted: State update
     * - console.log: Debugging output
     * - console.log: Debugging output
     * - trackStageVisit: Analytics tracking
     *
     * DATA FLOW:
     * Input: initialStage, isMounted state/props
     * Processing: Calls setIsMounted, console.log, console.log to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - initialStage: Triggers when initialStage changes
     * - isMounted: Triggers when isMounted changes
     *
     */
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
    /**
     * BUSINESS LOGIC: handleStageChange
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls setCurrentStage, trackStageVisit functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - setCurrentStage() - Function call
     * - trackStageVisit() - Function call
     *
     * WHY IT CALLS THEM:
     * - setCurrentStage: State update
     * - trackStageVisit: Analytics tracking
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls setCurrentStage, trackStageVisit to process data
     * Output: Event handled, state updated
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
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