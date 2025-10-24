'use client';

import { StageType } from '@domain/entities/ApplicationStage';
import { IStageService } from '@application/interfaces/IStageService';
import { useIsAuthenticated } from '@azure/msal-react';
import clsx from 'clsx';
// import { useTestContext } from '@presentation/context/TestContext';
// import { Button } from '@/components/ui/button';

interface StageProgressProps {
  currentStage: StageType;
  stageService: IStageService;
  onStageSelect: (stage: StageType) => void;
}

export function StageProgress({ 
  currentStage, 
  stageService, 
  onStageSelect 
}: StageProgressProps) {
  const isAuthenticated = useIsAuthenticated();
  const stages = ['property', 'project', 'documents', 'application'];
  const currentStageIndex = stages.indexOf(currentStage);
  // const { value, setValue } = useTestContext();

  // const handleClick = () => {
  //   setValue("Updated from StageProgress");
  // };

  return (
    <div className="relative z-0 flex w-full px-4 py-3 bg-gray-100">
    {/* <h1>Stage Progress</h1>
    <div className="relative z-0 flex w-full px-4 py-3 bg-gray-100">
      <p>Current Value: {value}</p>
      <Button
        onClick={handleClick}
      >
        Update Progress
      </Button>
    </div> */}
    {stages.map((stage, index) => {
        const isActive = currentStage === stage;
        const isCompleted = currentStageIndex > index;
        const isPreviousOrCurrent = index <= currentStageIndex;
        const isLocked = stageService.isAuthenticationRequired(stage as StageType) && !isAuthenticated;
        // Allow clicking only on previous or current stages, and not locked stages
        const isClickable = isPreviousOrCurrent && !isLocked;

        return (
          <div
            key={stage}
            className={clsx(
              'flex items-center flex-1 relative px-4',
              // Only allow cursor-pointer on the active stage and previous, all future states are non-clickable
              isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
            )}
            // Only call onStageSelect if it's the current / previous stage (essentially making it a no-op)
            onClick={() => isClickable && onStageSelect(stage as StageType)}
          >
            {/* Step Circle */}
            <div
              className="z-10 flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full"
              style={{
                backgroundColor: isCompleted || isActive
                  ? 'rgb(87, 87, 87)'
                  : 'rgb(204, 204, 204)',
                fontSize: 'var(--font-size-h2, 14px)',
                fontFamily: 'var(--font-roboto)',
                lineHeight: '1.25',
                fontWeight: 400
              }}
            >
              {isCompleted ? '✔' : index + 1}
            </div>

            {/* Step Label */}
            <span
              className="ml-2 whitespace-nowrap"
              style={{
                color: isCompleted || isActive ? 'var(--gray-rgb)' : 'rgb(204, 204, 204)',
                fontSize: 'var(--font-size-h2, 14px)',
                fontFamily: 'var(--font-roboto)',
                lineHeight: '1.25',
                fontWeight: 400
              }}
            >
              {`Your ${stage.charAt(0).toUpperCase() + stage.slice(1)}`}
            </span>

            {/* Chevron Line and Arrow */}
            {index < stages.length && (
              <div className="relative flex items-center flex-1 ml-4 mr-2 h-0.5">
                {/* Left Half: active or completed */}
                <div
                  className="h-full"
                  style={{
                    width: '50%',
                    backgroundColor: isCompleted || isActive ? 'rgb(87, 87, 87)' : 'rgb(204, 204, 204)',
                  }}
                />
                {/* Right Half: only completed */}
                <div
                  className="h-full"
                  style={{
                    width: '50%',
                    backgroundColor: isCompleted ? 'rgb(87, 87, 87)' : 'rgb(204, 204, 204)',
                  }}
                />

                {/* Arrow */}
                <div
                  className="absolute"
                  style={{
                    width: '15px',
                    height: '15px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    borderRight: `1.5px solid ${isCompleted ? 'rgb(87, 87, 87)' : 'rgb(204, 204, 204)'}`,
                    borderTop: `1.5px solid ${isCompleted ? 'rgb(87, 87, 87)' : 'rgb(204, 204, 204)'}`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}