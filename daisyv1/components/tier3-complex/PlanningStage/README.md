# PlanningStage - DAISY v1 Baseline

## Component Information

- **Name**: PlanningStage
- **Type**: functional
- **Complexity**: complex
- **Tier**: 3 (Complex Components)
- **Source**: src/app/(presentation)/components/stages/PlanningStage.tsx

## Migration Status

- **Status**: pending
- **Extracted**: 2025-10-24T05:34:57.078Z

## Extracted Files

- `PlanningStage.tsx` (component, 13075 bytes)

## Component Props

- **onStageChange** ((stage: StageType) => void, required): Prop for PlanningStage

## Business Logic

- **PlanningStage()**: Business logic method in PlanningStage
- **goToStage()**: Business logic method in PlanningStage
- **handlePathwaySelection()**: Business logic method in PlanningStage
- **processLogin()**: Business logic method in PlanningStage
- **handleProceedFromChecklist()**: Business logic method in PlanningStage
- **handleMessage()**: Business logic method in PlanningStage

## Dependencies

- useProfileStore (service)
- MatchedRows (service)
- StaticDocumentChecklist (service)
- ProfileData (service)
- storeHelpers (component)
- LoginLoader (component)
- useClickOutside (component)
- ApplicationStage (service)
- useStageService (component)
- msal-react (external)
- safeUpdateUserConfig (component)
- dialog (service)
- button (service)
- lucide-react (external)
- card (service)

## React Patterns

useState, useEffect, custom-hook, render-props

## Notes

This is the DAISY v1 baseline preservation. Business logic and functionality
must be maintained in the migrated Configurator v2 version.

**DO NOT MODIFY** - This baseline serves as the reference implementation.
