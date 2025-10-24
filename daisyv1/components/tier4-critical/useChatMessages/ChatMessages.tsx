"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@domain/entities/ProfileData';
import GetStartedCard from './GetStartedCard';
import GetAddressCard from './GetAddressCard';
import SuggestionBox from './SuggestionBox';
import FollowUpSuggestionBox from './FollowUpSuggestionBox';
import GetEmailCard from './GetEmailCard';
import { LoggingWrapper } from './LoggingWrapper';
import { useResolvedCouncil } from '../hooks/useResolvedCouncil';
import InnerHTML from './InnerHTML';
import '../eaidev.css';
import { StageType } from '@domain/entities/ApplicationStage';
import Image from 'next/image';
import { useChatFeedback } from '@/app/(presentation)/hooks/useChatFeedback';
import { getValidAccessToken } from '../utils/auth';
import { useProfileStore } from '@/app/(presentation)/store/useProfileStore';

interface ChatMessagesProps {
    messages: ChatMessage[];
    isHistoryLoad: boolean;
    addBotMessage: (text: string, message_type?: string, overrideId?: string, showEmailCard?: boolean) => ChatMessage;
    hideTypingIndicator: () => void;
    createSuggestionBox: () => void;
    showSuggestionBox: boolean;
    onUserResponse: (response: 'yes' | 'no') => void;
    updateMessage: (id: string, fields: Partial<ChatMessage>) => void;
    removeMessageById: (messageId: string) => void;
    showTypingIndicator: () => void;
    onStageChange?: (stage: StageType) => void;
    createFollowUpSuggestionBox: () => void; // ✅ Add this line
    followUpSuggestions: string[];
    showFollowUpSuggestions: boolean;
    handleFollowUpSuggestion: (suggestion: string) => void;
    setGlobalInputDisabled?: (val: boolean) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages = [],
    isHistoryLoad,
    addBotMessage,
    showTypingIndicator,
    hideTypingIndicator,
    createSuggestionBox,
    showSuggestionBox,
    onUserResponse,
    updateMessage,
    removeMessageById,
    onStageChange,
    followUpSuggestions,
    showFollowUpSuggestions,
    handleFollowUpSuggestion,
    setGlobalInputDisabled
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const council = useResolvedCouncil();
    const { sendFeedbackAsync, hasSentFeedback, getFeedbackType } = useChatFeedback();
    const { getProfileData } = useProfileStore();
    // Track current state to compare with message state
    const currentState = getProfileData()?.user_config?.state;
    const councilNameFromProfile = getProfileData()?.user_config?.project?.council_name || "";

    // Send feedback handler
    const handleFeedback = async (messageId: string, value: "good" | "bad") => {
        try {
            const token = await getValidAccessToken(council);
            if (!token) {
                console.warn("Missing token for chat feedback");
                return;
            }
            const currentProfile = getProfileData();
            const item = messages.find(m => m.id === messageId);
            if (!item) {
                console.warn("Message not found for feedback:", messageId);
                return;
            }
            if (!currentProfile?.user_config) {
                console.warn("Missing user configuration for feedback");
                return;
            }
            const payload = {
                message_content: item.message,
                feedback: value,
                user_config: currentProfile.user_config,
            };
            await sendFeedbackAsync(item.id, payload, token);
            // only mark as submitted after success (now handled by useChatFeedback)
        } catch (err) {
            console.error("❌ Failed to send feedback:", err);
        }
    };

    // scroll behavior
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // Use requestAnimationFrame to ensure DOM updates finish first
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }, [messages]);

    return (
        // To enable scrolling within the chatbot
        // GARETH: Reduce gap-4 to gap-2
        <div
            id="chat-messages-container"
            ref={containerRef}
            className="relative flex flex-col-reverse h-full gap-2 px-2 py-4 overflow-y-scroll scrollbar-hide"
            style={{
                overflowAnchor: 'none',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            {[...messages].reverse().map((item, idx, arr) => {
                const isBot = ['Bot','AddressCard','GetStartedCard'].includes(item.name);
                // In the reversed array, the message that came before in time is at idx+1
                const previousMessage = idx < arr.length - 1 ? arr[idx + 1] : null;
                const previousWasBot = previousMessage && ['Bot','AddressCard','GetStartedCard'].includes(previousMessage.name);
                // Show avatar if this is a bot message and the previous wasn't from bot
                const showAvatar = isBot && !previousWasBot;
                switch (item.name) {
                case 'Bot':
                    return (
                        <div key={item.id} className="mt-1 bot-message-container" data-message-id={item.id}>
                            <div className="bot-message-wrapper">
                                {showAvatar && (
                                    <div className="inline-avatar-wrapper">
                                        <Image
                                            src="/images/an-illustration-of-a-daisy.svg"
                                            alt="Bot"
                                            width={32} // or your desired size
                                            height={32}
                                            className="inline-avatar"
                                        />
                                        <span className="bot-label">DAISY</span>
                                    </div>
                                )}
                                <div className="text-base leading-relaxed whitespace-pre-wrap bot-message-text">
                                    <span dangerouslySetInnerHTML={{ __html: item.message }} />
                                    {((item).showEmailCard === true) && (
                                        <div className="mt-10">
                                            <GetEmailCard
                                                initialMessage={item}
                                                councilName={councilNameFromProfile}
                                                chatFunctions={{ addBotMessage, removeMessageById, updateMessage }}
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* Feedback Buttons - enhanced with state change detection */}
                                {(() => {
                                    const isWelcome = item.id.endsWith("-0") || item.id.endsWith("-1");
                                    const isGenesys = ["genesys_user", "genesys_agent", "genesys_bot"].includes(item.message_type ?? "");
                                    const feedbackSent = hasSentFeedback(item.id);
                                    const feedbackType = getFeedbackType(item.id);
                                    const isFromAPI = item.isFromAPI === true;
                                    // NEW: Check if message was created in a different state
                                    const messageState = item.state; // Assuming messages store the state they were created in
                                    const isFromDifferentState = messageState && messageState !== currentState;
                                    // Don't show feedback buttons for:
                                    // - welcome messages, genesys messages, history load, API messages
                                    // - messages from a different state than current
                                    if (isWelcome || isGenesys || isFromAPI || isFromDifferentState) {
                                        return null;
                                    }
                                    return (
                                        <div className="mt-1 flex justify-end gap-1.5">
                                            <button
                                                className={`p-0 transition-all duration-200 ease-in-out border-none ${
                                                    feedbackSent ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                                                } thumb-up bg-none ${feedbackType === 'good' ? 'opacity-100' : feedbackSent ? 'opacity-30' : 'opacity-100'}`}
                                                data-feedback="good"
                                                data-message-id={item.id}
                                                onClick={() => !feedbackSent && handleFeedback(item.id, "good")}
                                                disabled={feedbackSent}
                                            >
                                                <Image
                                                    src="/images/thumb-up.svg"
                                                    alt="Thumbs up"
                                                    width={18}
                                                    height={18}
                                                    className={`transition-all duration-200 ease-in-out ${
                                                        !feedbackSent ? 'hover:brightness-0' : ''
                                                    } ${feedbackType === 'good' ? 'brightness-0' : ''}`}
                                                />
                                            </button>
                                            <button
                                                className={`p-0 transition-all duration-200 ease-in-out border-none ${
                                                    feedbackSent ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                                                } thumb-down bg-none ${feedbackType === 'bad' ? 'opacity-100' : feedbackSent ? 'opacity-30' : 'opacity-100'}`}
                                                data-feedback="bad"
                                                data-message-id={item.id}
                                                onClick={() => !feedbackSent && handleFeedback(item.id, "bad")}
                                                disabled={feedbackSent}
                                            >
                                                <Image
                                                    src="/images/thumb-down.svg"
                                                    alt="Thumbs down"
                                                    width={18}
                                                    height={18}
                                                    className={`transition-all duration-200 ease-in-out ${
                                                        !feedbackSent ? 'hover:brightness-0' : ''
                                                    } ${feedbackType === 'bad' ? 'brightness-0' : ''}`}
                                                />
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                case 'User':
                    return (
                        <div key={item.id} className="mt-4 user-message-container" data-message-id={item.id}>
                            <div className="user-message-wrapper">
                                <div className="text-base user-message-text">
                                    {item.message}
                                </div>
                            </div>
                        </div>
                    );

                // TODO: TO ENSURE CSS IS CONSTANT SO THAT THE END USER DOESN'T SEE THIS PROCESS (resolved)
                // TODO: WHEN THE CARDS ARE TRIGGERED, NEED TO CALL /CARD API (resolved)
                case 'AddressCard': {
                    return (
                    <div
                        key={item.id}
                        className="mt-1"
                        data-message-id={item.id}
                    >
                        {item.message ? (
                            // static branch: we've already captured HTML, so just dump it and logCardAPI
                            <LoggingWrapper
                                message={item}
                                council={council}
                                isHistoryLoad={isHistoryLoad}
                            >
                                {/* <div dangerouslySetInnerHTML={{ __html: item.message }} /> */}
                                <InnerHTML html={item.message} />
                            </LoggingWrapper>
                        ) : (
                            // live branch: mount the real component and give it updateMessage
                            <GetAddressCard
                                initialMessage={item}
                                readOnly={isHistoryLoad}
                                chatFunctions={{
                                    addBotMessage,
                                    showTypingIndicator,
                                    hideTypingIndicator,
                                    createSuggestionBox,
                                    updateMessage: updateMessage!,   // non‑null assertion if you know it exists
                                }}
                                onStageChange={onStageChange}
                                className=""
                                setGlobalInputDisabled={setGlobalInputDisabled}
                            />
                        )}
                    </div>
                    )
                }

                // TODO: TO ENSURE CSS IS CONSTANT SO THAT THE END USER DOESN'T SEE THIS PROCESS (resolved)
                // TODO: WHEN THE CARDS ARE TRIGGERED, NEED TO CALL /CARD API (resolved)
                // TODO: ALSO WHEN THE BUTTON IS CLICKED, WE NEED TO REMOVE THE MESSAGE FROM LOCALCHATHISTORY TRAIL
                // TODO: Fix redundancy of cardAPI getting called everytime (CRUCIAL - resolved)
                case 'GetStartedCard': {
                    return (
                        <div
                            key={item.id}
                            className="mt-1"
                            data-message-id={item.id}
                        >
                            {item.message ? (
                                // static branch: we've already captured HTML, so just dump it and logCardAPI
                                // Make LoggingWrapper use a Fragment or adjust it to not add a div
                                <LoggingWrapper
                                    message={item}
                                    council={council}
                                    isHistoryLoad={isHistoryLoad}
                                >
                                    <InnerHTML html={item.message} />
                                </LoggingWrapper>
                            ) : (
                                // live branch: mount the real component and give it updateMessage
                                // <div className="get-started-card">
                                    <GetStartedCard
                                        initialMessage={item}
                                        readOnly={isHistoryLoad}
                                        chatFunctions={{
                                            addBotMessage,
                                            removeMessageById,
                                            updateMessage: updateMessage!   // non‑null assertion if you know it exists
                                        }}
                                        className="get-started-card"
                                    />
                                // </div>
                            )}
                        </div>
                    )
                }
                default:
                    return null;
                }
            })}
            {showSuggestionBox && (
                <SuggestionBox
                    chatMessagesContainer={containerRef.current}
                    onUserResponse={onUserResponse}
                />
            )}
            {showFollowUpSuggestions && followUpSuggestions.length > 0 && (
                <FollowUpSuggestionBox
                    chatMessagesContainer={containerRef.current}
                    suggestions={followUpSuggestions}
                    onSuggestionSelected={handleFollowUpSuggestion}
                />
            )}
        </div>
    );
};

// Add this at the bottom of your ChatMessages.tsx file
export const useChatMessages = () => {
    // Create a state for messages
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isHistoryLoad, setIsHistoryLoad] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestionBox, setShowSuggestionBox] = useState(false);
    const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
    const [showFollowUpSuggestions, setShowFollowUpSuggestions] = useState(false);
    const showTypingIndicator = () => setIsTyping(true);
    const hideTypingIndicator = () => setIsTyping(false);
    const addBotMessage = (text: string, message_type = "", overrideId?: string, showEmailCard?: boolean): ChatMessage => {
        if (!text.trim()) return { id: overrideId ?? `msg-${Date.now()}-empty`, name: "Bot", message: "", message_type: "empty" };
        // Get current state from profile store
        const currentState = useProfileStore.getState().getProfileData()?.user_config?.state;
        const m: ChatMessage = {
            id: overrideId ?? `msg-${Date.now()}`,
            name: "Bot",
            message: text,
            message_type: message_type,
            state: currentState // Add current state to message
        };
        (m).showEmailCard = showEmailCard === true;
        updateMessages(prev => [...prev, m]);
        return m;
    };
    const addUserMessage = (text: string) => {
        if (!text.trim()) return;
        // Get current state from profile store
        const currentState = useProfileStore.getState().getProfileData()?.user_config?.state;
        const m: ChatMessage = {
            id: `msg-${Date.now()}`,
            name: "User",
            message: text,
            state: currentState // Add current state to message
        };
        updateMessages(prev => [...prev, m]);
        return m;
    };
    const addAddressCard = (html: string, id: string, address?: string, follow_ups?: []) => {
        const m: ChatMessage = {
            id: id || `addressCard-${Date.now()}`,
            name: "AddressCard",
            message: html,
            address: address || "",
            follow_ups: follow_ups || [],
        };
        updateMessages(prev => [...prev, m]);
        return m;
    };
    const addGetStartedCard = (html: string, id: string, url: string) => {
        const m: ChatMessage = {
            id: id || `getStartedCard-${Date.now()}`,
            name: "GetStartedCard",
            message: html,
            url,
        };
        updateMessages(prev => [...prev, m]);
        return m;
    };
    const createSuggestionBox = () => setShowSuggestionBox(true);
    const hideSuggestionBox = () => setShowSuggestionBox(false);
    const createFollowUpSuggestionBox = () => setShowFollowUpSuggestions(true);
    const hideFollowUpSuggestionBox = () => setShowFollowUpSuggestions(false);
    const removeMessageById = (messageId: string) => {
        updateMessages(prev => prev.filter(m => m.id !== messageId));
    };
    // Helper function to update messages and handle side effects
    const updateMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
        setMessages(prev => {
            const updated = updater(prev);
            localStorage.setItem('chatHistory', JSON.stringify(updated));
            return updated;
        });
    };
    const updateMessage = (id: string, fields: Partial<ChatMessage>) => {
        updateMessages(prev =>
            prev.map(m =>
            m.id === id ? { ...m, ...fields } : m
            )
        );
    };
    const createSuggestionBoxForFollowUpQuestions = (suggestions: string[]) => {
        if (!suggestions || suggestions.length === 0) return;
        setFollowUpSuggestions(suggestions);
        setShowFollowUpSuggestions(true);
    };
    // NEW STREAMING FUNCTIONS
    /**
     * Creates an empty bot message for streaming and returns its ID
     * @returns {string} The message ID
     */
    const createStreamingBotMessage = (): string => {
        const messageId = `msg-${Date.now()}`; // Ensure unique ID
        const newMessage: ChatMessage = {
            id: messageId, 
            name: "Bot", 
            message: "", 
            message_type: "streaming" 
        };
        updateMessages(prev => [...prev, newMessage]);
        return messageId;
    };
    /**
     * Updates a streaming bot message with new content
     * @param {string} messageId - The ID of the message to update
     * @param {string} word - The content to append
     */
    const updateStreamingBotMessage = (messageId: string, word: string) => {
        updateMessages(prevMessages =>
            prevMessages.map(m => {
                if (m.id !== messageId) return m;
                const prevMsg = m.message;
                let newMsg: string;
                if (prevMsg.trim().length > 0) {
                    // For newlines or markdown markers, append without extra space
                    if (
                        word.startsWith('\n') ||
                        word.startsWith('#') ||
                        word.startsWith('-') ||
                        word.startsWith('*') ||
                        prevMsg.endsWith('\n')
                    ) {
                        newMsg = prevMsg + word;
                    } else {
                        newMsg = prevMsg + ' ' + word;
                    }
                } else {
                    newMsg = word;
                }
                return { ...m, message: newMsg };
            })
        );
    };
    /**
     * Finalizes a streaming message when complete
     * @param {string} messageId - The ID of the message to finalize
     */
    const finalizeStreamingMessage = (messageId: string) => {
        updateMessage(messageId, { message_type: "" });
    };
    return {
        messages,
        isHistoryLoad,
        isTyping,
        setMessages,
        setIsHistoryLoad,
        addBotMessage,
        addUserMessage,
        addAddressCard,
        addGetStartedCard,
        removeMessageById,
        updateMessages,
        showTypingIndicator,
        hideTypingIndicator,
        createSuggestionBox,
        showSuggestionBox,
        hideSuggestionBox,
        updateMessage,
        // New streaming functions
        createStreamingBotMessage,
        updateStreamingBotMessage,
        finalizeStreamingMessage,
        createFollowUpSuggestionBox,
        hideFollowUpSuggestionBox,
        createSuggestionBoxForFollowUpQuestions,
        followUpSuggestions,
        showFollowUpSuggestions
    };
};