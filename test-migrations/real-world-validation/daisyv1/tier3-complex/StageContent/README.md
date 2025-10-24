# StageContent - DAISY v1 Baseline

## Component Information

- **Name**: StageContent
- **Type**: functional
- **Complexity**: complex
- **Tier**: 3 (Complex Components)
- **Source**: src/app/(presentation)/components/dashboard/StageContent.tsx

## Migration Status

- **Status**: pending
- **Extracted**: 2025-10-24T05:10:35.830Z

## Extracted Files

- `StageContent.tsx` (component, 11420 bytes)

## Component Props

- **stage** (StageType, required): Prop for StageContent
- **stageService** (IStageService, required): Prop for StageContent
- **onStageChange** ((stage: StageType) => void, required): Prop for StageContent

## Business Logic

- **StageContent()**: Business logic method in StageContent
- **handleNewMessage()**: Business logic method in StageContent

## Dependencies

- react (external)
- ApplicationStage (service)
- PropertyStage (component)
- PlanningStage (component)
- DocumentStage (component)
- SubmissionStage (component)
- Daisy (component)
- useStageContent (component)
- useProfileStore (component)
- PropertyReportModal (component)
- StageProgress (component)
- DevelopmentSummaryCard (component)
- PropertyInfoCard (component)
- lucide-react (external)
- useIsMobile (component)

## React Patterns

useState, useEffect, useMemo, useCallback, custom-hook, render-props

## Notes

This is the DAISY v1 baseline preservation. Business logic and functionality
must be maintained in the migrated Configurator v2 version.

**DO NOT MODIFY** - This baseline serves as the reference implementation.
