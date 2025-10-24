# useChatMessages - DAISY v1 Baseline

## Component Information

- **Name**: useChatMessages
- **Type**: hook
- **Complexity**: critical
- **Tier**: 4 (Critical Components)
- **Source**: src/app/(presentation)/components/chatbot/cards/ChatMessages.tsx

## Migration Status

- **Status**: pending
- **Extracted**: 2025-10-24T05:34:57.351Z

## Extracted Files

- `ChatMessages.tsx` (component, 23987 bytes)

## Component Props



## Business Logic

- **useChatMessages()**: Business logic method in useChatMessages
- **addUserMessage()**: Business logic method in useChatMessages
- **addAddressCard()**: Business logic method in useChatMessages
- **addGetStartedCard()**: Business logic method in useChatMessages
- **removeMessageById()**: Business logic method in useChatMessages
- **updateMessage()**: Business logic method in useChatMessages
- **createSuggestionBoxForFollowUpQuestions()**: Business logic method in useChatMessages
- **updateStreamingBotMessage()**: Business logic method in useChatMessages
- **finalizeStreamingMessage()**: Business logic method in useChatMessages

## Dependencies

- ProfileData (service)
- GetStartedCard (component)
- GetAddressCard (component)
- SuggestionBox (component)
- FollowUpSuggestionBox (component)
- GetEmailCard (component)
- LoggingWrapper (component)
- useResolvedCouncil (component)
- InnerHTML (component)
- ApplicationStage (service)
- image (service)
- useChatFeedback (service)
- auth (component)
- useProfileStore (service)

## React Patterns

useState, useEffect, custom-hook, render-props

## Notes

This is the DAISY v1 baseline preservation. Business logic and functionality
must be maintained in the migrated Configurator v2 version.

**DO NOT MODIFY** - This baseline serves as the reference implementation.
