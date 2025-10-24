# SubmissionStage - DAISY v1 Baseline

## Component Information

- **Name**: SubmissionStage
- **Type**: functional
- **Complexity**: moderate
- **Tier**: 2 (Moderate Components)
- **Source**: src/app/(presentation)/components/stages/SubmissionStage.tsx

## Migration Status

- **Status**: pending
- **Extracted**: 2025-10-24T05:16:01.151Z

## Extracted Files

- `SubmissionStage.tsx` (component, 2068 bytes)

## Component Props

- **onStageChange** ((stage: StageType) => void, required): Prop for SubmissionStage

## Business Logic

- **SubmissionStage()**: Business logic method in SubmissionStage
- **goToStage()**: Business logic method in SubmissionStage

## Dependencies

- DocumentDownloadPanel (component)
- CouncilSubmissionCards (component)
- useHeader (component)
- useStageService (service)
- ApplicationStage (service)

## React Patterns

useMemo, custom-hook, render-props

## Notes

This is the DAISY v1 baseline preservation. Business logic and functionality
must be maintained in the migrated Configurator v2 version.

**DO NOT MODIFY** - This baseline serves as the reference implementation.
