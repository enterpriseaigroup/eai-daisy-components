// context/ChatMessagesContext.tsx
import React, { createContext, useContext } from 'react';
import { useChatMessages } from '@presentation/components/chatbot/cards/ChatMessages';

const ChatMessagesContext = createContext<ReturnType<typeof useChatMessages> | null>(null);

export const ChatMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const chat = useChatMessages();
    return (
        <ChatMessagesContext.Provider value={chat}>
        {children}
        </ChatMessagesContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatMessagesContext);
    if (!context) throw new Error("useChatContext must be used within ChatMessagesProvider");
    return context;
};