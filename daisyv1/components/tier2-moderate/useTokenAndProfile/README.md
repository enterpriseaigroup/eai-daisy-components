# useTokenAndProfile - DAISY v1 Baseline

## Component Information

- **Name**: useTokenAndProfile
- **Type**: hook
- **Complexity**: moderate
- **Tier**: 2 (Moderate Components)
- **Source**: src/app/(presentation)/hooks/useTokenAndProfile.ts

## Migration Status

- **Status**: pending
- **Extracted**: 2025-10-24T05:34:57.448Z

## Extracted Files

- `useTokenAndProfile.ts` (component, 9385 bytes)

## Component Props



## Business Logic

- **handleChatMigration()**: Business logic method in useTokenAndProfile

## Dependencies

- react (external)
- msal-react (external)
- useProfileData (service)
- useUpdateOrgId (service)
- useProfileStore (service)
- useAuthStore (component)
- useChatMigrateHistory (service)
- ChatMigrateHistoryRequest (service)
- councilMappings (component)
- safeUpdateUserConfig (component)
- handleApiError (component)

## React Patterns

useEffect, useCallback, custom-hook

## Notes

This is the DAISY v1 baseline preservation. Business logic and functionality
must be maintained in the migrated Configurator v2 version.

**DO NOT MODIFY** - This baseline serves as the reference implementation.
