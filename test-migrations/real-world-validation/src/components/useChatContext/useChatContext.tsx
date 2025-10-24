/**
 * useChatContext - Configurator V2 Component
 *
 * Component useChatContext from ChatMessagesContext.tsx
 *
 * @migrated from DAISY v1
 */

// context/ChatMessagesContext.tsx
import React, { createContext, useContext } from 'react';
import { useChatMessages } from '@presentation/components/chatbot/cards/ChatMessages';

const ChatMessagesContext = createContext<ReturnType<typeof useChatMessages> | null>(null);

  /**
   * BUSINESS LOGIC: ChatMessagesProvider
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements ChatMessagesProvider logic
   * 2. Calls helper functions: useChatMessages
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useChatMessages() - Function call
   *
   * WHY IT CALLS THEM:
   * - useChatMessages: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useChatMessages to process data
   * Output: Computed value or side effect
   *
   */
export const ChatMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const chat = useChatMessages();
    return (
        <ChatMessagesContext.Provider value={chat}>
        {children}
        </ChatMessagesContext.Provider>
    );
};

  /**
   * BUSINESS LOGIC: useChatContext
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatContext logic
   * 2. Calls helper functions: useContext
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useContext() - Function call
   *
   * WHY IT CALLS THEM:
   * - useContext: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useContext to process data
   * Output: Computed value or side effect
   *
   */
export const useChatContext = () => {
    const context = useContext(ChatMessagesContext);
    if (!context) throw new Error("useChatContext must be used within ChatMessagesProvider");
    return context;
};