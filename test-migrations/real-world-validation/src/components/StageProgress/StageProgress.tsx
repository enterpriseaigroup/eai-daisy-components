/**
 * StageProgress - Configurator V2 Component
 *
 * Component StageProgress from StageProgress.tsx
 *
 * @migrated from DAISY v1
 */

'use client';

import { ApplicationStage, StageType } from '@domain/entities/ApplicationStage';
import { IStageService } from '@application/interfaces/IStageService';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { useCallback } from 'react';

interface StageProgressProps {
  currentStage: StageType;
  stageService: IStageService;
  onStageSelect: (stage: StageType) => void;
}

  /**
   * BUSINESS LOGIC: StageProgress
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements StageProgress logic
   * 2. Calls helper functions: useCallback, onStageSelect, STAGE_DEFINITIONS.map, STAGE_DEFINITIONS.findIndex, clsx, clsx, clsx, handleClick
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useCallback() - Function call
   * - onStageSelect() - Function call
   * - STAGE_DEFINITIONS.map() - Function call
   * - STAGE_DEFINITIONS.findIndex() - Function call
   * - clsx() - Function call
   * - clsx() - Function call
   * - clsx() - Function call
   * - handleClick() - Function call
   *
   * WHY IT CALLS THEM:
   * - useCallback: Required functionality
   * - onStageSelect: Required functionality
   * - STAGE_DEFINITIONS.map: Required functionality
   * - STAGE_DEFINITIONS.findIndex: Required functionality
   * - clsx: Required functionality
   * - clsx: Required functionality
   * - clsx: Required functionality
   * - handleClick: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useCallback, onStageSelect, STAGE_DEFINITIONS.map to process data
   * Output: Computed value or side effect
   *
   */
export function StageProgress({ currentStage, onStageSelect }: StageProgressProps) {
  const STAGE_DEFINITIONS: ApplicationStage[] = [
    { id: 'property', title: 'Property', description: 'Enter your property details', requiresAuth: false, order: 1 },
    { id: 'project', title: 'Identification', description: 'Explore planning options', requiresAuth: false, order: 2 },
    { id: 'documents', title: 'Documents', description: 'Upload required documents', requiresAuth: true, order: 3 },
    { id: 'application', title: 'Review', description: 'Review and submit application', requiresAuth: true, order: 4 }
  ];

    /**
     * BUSINESS LOGIC: handleClick
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Handles user interaction or event
     * 2. Calls onStageSelect functions
     * 3. Updates state or triggers effects
     *
     * WHAT IT CALLS:
     * - onStageSelect() - Function call
     *
     * WHY IT CALLS THEM:
     * - onStageSelect: Required functionality
     *
     * DATA FLOW:
     * Input: onStageSelect state/props
     * Processing: Calls onStageSelect to process data
     * Output: Event handled, state updated
     *
     * DEPENDENCIES:
     * - onStageSelect: Triggers when onStageSelect changes
     *
     * SPECIAL BEHAVIOR:
     * - Memoized for performance optimization
     *
     */
  const handleClick = useCallback(
    (stage: StageType, isActive?: boolean) => {
      if (isActive) {
        onStageSelect(stage);
      }
    },
    [onStageSelect]
  );

  return (
    <div
      className="relative flex items-center justify-center w-full"
      style={{
        zIndex: 9999,
        position: 'relative',
        isolation: 'isolate'
      }}
    >
      {STAGE_DEFINITIONS.map((stageObj, index) => {
        const stage = stageObj.id;
        const isActive = currentStage === stage;
        const isCompleted = STAGE_DEFINITIONS.findIndex(s => s.id === currentStage) > index;

        return (
          <div
            key={stage}
            className={clsx(
              'relative flex-1 flex flex-col items-center',
              isActive ? 'cursor-pointer' : 'cursor-not-allowed'
            )}
            onClick={() => handleClick(stage as StageType, isActive)}
            style={{
              zIndex: 9999,
              position: 'relative',
              isolation: 'isolate'
            }}
          >
            {/* Circle + Connector */}
            <div
              className="relative flex items-center justify-center w-full"
              style={{
                zIndex: 9999,
                position: 'relative',
                isolation: 'isolate'
              }}
            >
              {/* Step Circle */}
              <div 
                className="flex items-center justify-center w-8 h-8"
                style={{
                  zIndex: 10000,
                  position: 'relative',
                  isolation: 'isolate'
                }}
              >
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    isCompleted ? 'bg-black border-none' : 'border-2',
                    isActive && !isCompleted ? 'border-black' : !isCompleted ? 'border-gray-300' : '',
                    !isCompleted ? 'bg-white' : ''
                  )}
                  style={{
                    zIndex: 10000,
                    position: 'relative',
                    isolation: 'isolate'
                  }}
                >
                  {isCompleted ? (
                    <Check size={14} color="white" strokeWidth={3} />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-black rounded-full" />
                  ) : null}
                </div>
              </div>

              {/* Connector Line - Isolated and Protected */}
              {index < STAGE_DEFINITIONS.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    height: '2px',
                    transform: 'translateY(-50%) translateX(50%)',
                    left: '0%',
                    width: '100%',
                    zIndex: 9998,
                    backgroundColor: isCompleted ? '#000000' : '#d1d5db',
                    pointerEvents: 'none',
                    isolation: 'isolate',
                    // Prevent FormBricks interference
                    contain: 'layout style paint',
                    willChange: 'auto'
                  }}
                  className="!important"
                />
              )}
            </div>

            {/* Stage Label */}
            <span
              className={clsx(
                'mt-2 text-center whitespace-nowrap text-sm font-medium',
                isCompleted || isActive ? 'text-black' : 'text-gray-400'
              )}
              style={{
                zIndex: 9999,
                position: 'relative',
                isolation: 'isolate'
              }}
            >
              {stageObj.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}