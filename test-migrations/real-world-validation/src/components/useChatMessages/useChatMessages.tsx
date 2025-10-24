/**
 * useChatMessages - Configurator V2 Component
 *
 * Component useChatMessages from ChatMessages.tsx
 *
 * @migrated from DAISY v1
 */

/**
 * MIGRATED: CSS imports removed, replaced with Tailwind classes
 * CONVERSION: Automated by CSS-to-Tailwind transformer
 * DATE: 2025-10-24
 */

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

  /**
   * BUSINESS LOGIC: ChatMessages
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements ChatMessages logic
   * 2. Calls helper functions: useRef, useResolvedCouncil, useChatFeedback, useProfileStore, getProfileData, getProfileData, getValidAccessToken, console.warn, getProfileData, messages.find, console.warn, console.warn, sendFeedbackAsync, console.error, useEffect, requestAnimationFrame, .map, .includes, .includes, .endsWith, .endsWith, .includes, hasSentFeedback, getFeedbackType, handleFeedback, handleFeedback, .reverse
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useRef() - Function call
   * - useResolvedCouncil() - Function call
   * - useChatFeedback() - Function call
   * - useProfileStore() - Function call
   * - getProfileData() - Function call
   * - getProfileData() - Function call
   * - getValidAccessToken() - Function call
   * - console.warn() - Function call
   * - getProfileData() - Function call
   * - messages.find() - Function call
   * - console.warn() - Function call
   * - console.warn() - Function call
   * - sendFeedbackAsync() - Function call
   * - console.error() - Function call
   * - useEffect() - Function call
   * - requestAnimationFrame() - Function call
   * - .map() - Function call
   * - .includes() - Function call
   * - .includes() - Function call
   * - .endsWith() - Function call
   * - .endsWith() - Function call
   * - .includes() - Function call
   * - hasSentFeedback() - Function call
   * - getFeedbackType() - Function call
   * - handleFeedback() - Function call
   * - handleFeedback() - Function call
   * - .reverse() - Function call
   *
   * WHY IT CALLS THEM:
   * - useRef: Required functionality
   * - useResolvedCouncil: Required functionality
   * - useChatFeedback: Required functionality
   * - useProfileStore: Required functionality
   * - getProfileData: Required functionality
   * - getProfileData: Required functionality
   * - getValidAccessToken: Required functionality
   * - console.warn: Warning notification
   * - getProfileData: Required functionality
   * - messages.find: Required functionality
   * - console.warn: Warning notification
   * - console.warn: Warning notification
   * - sendFeedbackAsync: Required functionality
   * - console.error: Error logging
   * - useEffect: Required functionality
   * - requestAnimationFrame: Required functionality
   * - .map: Required functionality
   * - .includes: Required functionality
   * - .includes: Required functionality
   * - .endsWith: Required functionality
   * - .endsWith: Required functionality
   * - .includes: Required functionality
   * - hasSentFeedback: Required functionality
   * - getFeedbackType: Required functionality
   * - handleFeedback: Required functionality
   * - handleFeedback: Required functionality
   * - .reverse: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useRef, useResolvedCouncil, useChatFeedback to process data
   * Output: Computed value or side effect
   *
   */
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
      /**
       * BUSINESS LOGIC: handleFeedback
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements handleFeedback logic
       * 2. Calls helper functions: getValidAccessToken, console.warn, getProfileData, messages.find, console.warn, console.warn, sendFeedbackAsync, console.error
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - getValidAccessToken() - Function call
       * - console.warn() - Function call
       * - getProfileData() - Function call
       * - messages.find() - Function call
       * - console.warn() - Function call
       * - console.warn() - Function call
       * - sendFeedbackAsync() - Function call
       * - console.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - getValidAccessToken: Required functionality
       * - console.warn: Warning notification
       * - getProfileData: Required functionality
       * - messages.find: Required functionality
       * - console.warn: Warning notification
       * - console.warn: Warning notification
       * - sendFeedbackAsync: Required functionality
       * - console.error: Error logging
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls getValidAccessToken, console.warn, getProfileData to process data
       * Output: Computed value or side effect
       *
       */
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
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors messages for changes
       * 2. Executes requestAnimationFrame functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - requestAnimationFrame() - Function call
       *
       * WHY IT CALLS THEM:
       * - requestAnimationFrame: Required functionality
       *
       * DATA FLOW:
       * Input: messages state/props
       * Processing: Calls requestAnimationFrame to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - messages: Triggers when messages changes
       *
       */
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
            className="relative flex flex-col-reverse h-full gap-2 px-2 py-4 overflow-y-scroll"
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
                        <div key={item.id} className="mt-1 flex justify-start w-full" data-message-id={item.id}>
                            <div className="rounded-[9px] p-[10px] w-full">
                                {showAvatar && (
                                    <div className="inline-flex items-center">
                                        <Image
                                            src="/images/an-illustration-of-a-daisy.svg"
                                            alt="Bot"
                                            width={32} // or your desired size
                                            height={32}
                                            className="w-[32px] h-[32px] rounded-[50%]"
                                        />
                                        <span className="bot-label">DAISY</span>
                                    </div>
                                )}
                                <div className="text-base leading-relaxed whitespace-pre-wrap text-[var(--Primary, #18181B)]">
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
                        <div key={item.id} className="mt-4 flex justify-end" data-message-id={item.id}>
                            <div className="rounded-[9px] p-[10px] max-w-[80%]">
                                <div className="text-base text-[var(--Primary-Foreground, #FAFAFA)]">
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
                                // <div className="text-[#f0f0f0]">
                                    <GetStartedCard
                                        initialMessage={item}
                                        readOnly={isHistoryLoad}
                                        chatFunctions={{
                                            addBotMessage,
                                            removeMessageById,
                                            updateMessage: updateMessage!   // non‑null assertion if you know it exists
                                        }}
                                        className="text-[#f0f0f0]"
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
  /**
   * BUSINESS LOGIC: useChatMessages
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useChatMessages logic
   * 2. Calls helper functions: useState, useState, useState, useState, useState, useState, setIsTyping, setIsTyping, Date.now, text.trim, .getProfileData, useProfileStore.getState, Date.now, updateMessages, text.trim, .getProfileData, useProfileStore.getState, Date.now, updateMessages, Date.now, updateMessages, Date.now, updateMessages, setShowSuggestionBox, setShowSuggestionBox, setShowFollowUpSuggestions, setShowFollowUpSuggestions, updateMessages, prev.filter, setMessages, updater, localStorage.setItem, JSON.stringify, updateMessages, prev.map, setFollowUpSuggestions, setShowFollowUpSuggestions, Date.now, updateMessages, updateMessages, prevMessages.map, word.startsWith, word.startsWith, word.startsWith, word.startsWith, prevMsg.endsWith, prevMsg.trim, updateMessage
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - setIsTyping() - Function call
   * - setIsTyping() - Function call
   * - Date.now() - Function call
   * - text.trim() - Function call
   * - .getProfileData() - Function call
   * - useProfileStore.getState() - Function call
   * - Date.now() - Function call
   * - updateMessages() - Function call
   * - text.trim() - Function call
   * - .getProfileData() - Function call
   * - useProfileStore.getState() - Function call
   * - Date.now() - Function call
   * - updateMessages() - Function call
   * - Date.now() - Function call
   * - updateMessages() - Function call
   * - Date.now() - Function call
   * - updateMessages() - Function call
   * - setShowSuggestionBox() - Function call
   * - setShowSuggestionBox() - Function call
   * - setShowFollowUpSuggestions() - Function call
   * - setShowFollowUpSuggestions() - Function call
   * - updateMessages() - Function call
   * - prev.filter() - Function call
   * - setMessages() - Function call
   * - updater() - Function call
   * - localStorage.setItem() - Function call
   * - JSON.stringify() - Function call
   * - updateMessages() - Function call
   * - prev.map() - Function call
   * - setFollowUpSuggestions() - Function call
   * - setShowFollowUpSuggestions() - Function call
   * - Date.now() - Function call
   * - updateMessages() - Function call
   * - updateMessages() - Function call
   * - prevMessages.map() - Function call
   * - word.startsWith() - Function call
   * - word.startsWith() - Function call
   * - word.startsWith() - Function call
   * - word.startsWith() - Function call
   * - prevMsg.endsWith() - Function call
   * - prevMsg.trim() - Function call
   * - updateMessage() - Function call
   *
   * WHY IT CALLS THEM:
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - setIsTyping: State update
   * - setIsTyping: State update
   * - Date.now: Required functionality
   * - text.trim: Required functionality
   * - .getProfileData: Required functionality
   * - useProfileStore.getState: Required functionality
   * - Date.now: Required functionality
   * - updateMessages: Required functionality
   * - text.trim: Required functionality
   * - .getProfileData: Required functionality
   * - useProfileStore.getState: Required functionality
   * - Date.now: Required functionality
   * - updateMessages: Required functionality
   * - Date.now: Required functionality
   * - updateMessages: Required functionality
   * - Date.now: Required functionality
   * - updateMessages: Required functionality
   * - setShowSuggestionBox: State update
   * - setShowSuggestionBox: State update
   * - setShowFollowUpSuggestions: State update
   * - setShowFollowUpSuggestions: State update
   * - updateMessages: Required functionality
   * - prev.filter: Required functionality
   * - setMessages: State update
   * - updater: Required functionality
   * - localStorage.setItem: State update
   * - JSON.stringify: Required functionality
   * - updateMessages: Required functionality
   * - prev.map: Required functionality
   * - setFollowUpSuggestions: State update
   * - setShowFollowUpSuggestions: State update
   * - Date.now: Required functionality
   * - updateMessages: Required functionality
   * - updateMessages: Required functionality
   * - prevMessages.map: Required functionality
   * - word.startsWith: Required functionality
   * - word.startsWith: Required functionality
   * - word.startsWith: Required functionality
   * - word.startsWith: Required functionality
   * - prevMsg.endsWith: Required functionality
   * - prevMsg.trim: Required functionality
   * - updateMessage: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useState, useState, useState to process data
   * Output: Computed value or side effect
   *
   */
export const useChatMessages = () => {
    // Create a state for messages
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isHistoryLoad, setIsHistoryLoad] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestionBox, setShowSuggestionBox] = useState(false);
    const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
    const [showFollowUpSuggestions, setShowFollowUpSuggestions] = useState(false);
      /**
       * BUSINESS LOGIC: showTypingIndicator
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements showTypingIndicator logic
       * 2. Calls helper functions: setIsTyping
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setIsTyping() - Function call
       *
       * WHY IT CALLS THEM:
       * - setIsTyping: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setIsTyping to process data
       * Output: Computed value or side effect
       *
       */
    const showTypingIndicator = () => setIsTyping(true);
      /**
       * BUSINESS LOGIC: hideTypingIndicator
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements hideTypingIndicator logic
       * 2. Calls helper functions: setIsTyping
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setIsTyping() - Function call
       *
       * WHY IT CALLS THEM:
       * - setIsTyping: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setIsTyping to process data
       * Output: Computed value or side effect
       *
       */
    const hideTypingIndicator = () => setIsTyping(false);
      /**
       * BUSINESS LOGIC: addBotMessage
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements addBotMessage logic
       * 2. Calls helper functions: Date.now, text.trim, .getProfileData, useProfileStore.getState, Date.now, updateMessages
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - Date.now() - Function call
       * - text.trim() - Function call
       * - .getProfileData() - Function call
       * - useProfileStore.getState() - Function call
       * - Date.now() - Function call
       * - updateMessages() - Function call
       *
       * WHY IT CALLS THEM:
       * - Date.now: Required functionality
       * - text.trim: Required functionality
       * - .getProfileData: Required functionality
       * - useProfileStore.getState: Required functionality
       * - Date.now: Required functionality
       * - updateMessages: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls Date.now, text.trim, .getProfileData to process data
       * Output: Computed value or side effect
       *
       */
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
      /**
       * BUSINESS LOGIC: addUserMessage
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements addUserMessage logic
       * 2. Calls helper functions: text.trim, .getProfileData, useProfileStore.getState, Date.now, updateMessages
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - text.trim() - Function call
       * - .getProfileData() - Function call
       * - useProfileStore.getState() - Function call
       * - Date.now() - Function call
       * - updateMessages() - Function call
       *
       * WHY IT CALLS THEM:
       * - text.trim: Required functionality
       * - .getProfileData: Required functionality
       * - useProfileStore.getState: Required functionality
       * - Date.now: Required functionality
       * - updateMessages: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls text.trim, .getProfileData, useProfileStore.getState to process data
       * Output: Computed value or side effect
       *
       */
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
      /**
       * BUSINESS LOGIC: addAddressCard
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements addAddressCard logic
       * 2. Calls helper functions: Date.now, updateMessages
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - Date.now() - Function call
       * - updateMessages() - Function call
       *
       * WHY IT CALLS THEM:
       * - Date.now: Required functionality
       * - updateMessages: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls Date.now, updateMessages to process data
       * Output: Computed value or side effect
       *
       */
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
      /**
       * BUSINESS LOGIC: addGetStartedCard
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements addGetStartedCard logic
       * 2. Calls helper functions: Date.now, updateMessages
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - Date.now() - Function call
       * - updateMessages() - Function call
       *
       * WHY IT CALLS THEM:
       * - Date.now: Required functionality
       * - updateMessages: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls Date.now, updateMessages to process data
       * Output: Computed value or side effect
       *
       */
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
      /**
       * BUSINESS LOGIC: createSuggestionBox
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements createSuggestionBox logic
       * 2. Calls helper functions: setShowSuggestionBox
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setShowSuggestionBox() - Function call
       *
       * WHY IT CALLS THEM:
       * - setShowSuggestionBox: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setShowSuggestionBox to process data
       * Output: Computed value or side effect
       *
       */
    const createSuggestionBox = () => setShowSuggestionBox(true);
      /**
       * BUSINESS LOGIC: hideSuggestionBox
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements hideSuggestionBox logic
       * 2. Calls helper functions: setShowSuggestionBox
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setShowSuggestionBox() - Function call
       *
       * WHY IT CALLS THEM:
       * - setShowSuggestionBox: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setShowSuggestionBox to process data
       * Output: Computed value or side effect
       *
       */
    const hideSuggestionBox = () => setShowSuggestionBox(false);
      /**
       * BUSINESS LOGIC: createFollowUpSuggestionBox
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements createFollowUpSuggestionBox logic
       * 2. Calls helper functions: setShowFollowUpSuggestions
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setShowFollowUpSuggestions() - Function call
       *
       * WHY IT CALLS THEM:
       * - setShowFollowUpSuggestions: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setShowFollowUpSuggestions to process data
       * Output: Computed value or side effect
       *
       */
    const createFollowUpSuggestionBox = () => setShowFollowUpSuggestions(true);
      /**
       * BUSINESS LOGIC: hideFollowUpSuggestionBox
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements hideFollowUpSuggestionBox logic
       * 2. Calls helper functions: setShowFollowUpSuggestions
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setShowFollowUpSuggestions() - Function call
       *
       * WHY IT CALLS THEM:
       * - setShowFollowUpSuggestions: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setShowFollowUpSuggestions to process data
       * Output: Computed value or side effect
       *
       */
    const hideFollowUpSuggestionBox = () => setShowFollowUpSuggestions(false);
      /**
       * BUSINESS LOGIC: removeMessageById
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements removeMessageById logic
       * 2. Calls helper functions: updateMessages, prev.filter
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - updateMessages() - Function call
       * - prev.filter() - Function call
       *
       * WHY IT CALLS THEM:
       * - updateMessages: Required functionality
       * - prev.filter: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls updateMessages, prev.filter to process data
       * Output: Computed value or side effect
       *
       */
    const removeMessageById = (messageId: string) => {
        updateMessages(prev => prev.filter(m => m.id !== messageId));
    };
    // Helper function to update messages and handle side effects
      /**
       * BUSINESS LOGIC: updateMessages
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements updateMessages logic
       * 2. Calls helper functions: setMessages, updater, localStorage.setItem, JSON.stringify
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setMessages() - Function call
       * - updater() - Function call
       * - localStorage.setItem() - Function call
       * - JSON.stringify() - Function call
       *
       * WHY IT CALLS THEM:
       * - setMessages: State update
       * - updater: Required functionality
       * - localStorage.setItem: State update
       * - JSON.stringify: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setMessages, updater, localStorage.setItem to process data
       * Output: Computed value or side effect
       *
       */
    const updateMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
        setMessages(prev => {
            const updated = updater(prev);
            localStorage.setItem('chatHistory', JSON.stringify(updated));
            return updated;
        });
    };
      /**
       * BUSINESS LOGIC: updateMessage
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements updateMessage logic
       * 2. Calls helper functions: updateMessages, prev.map
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - updateMessages() - Function call
       * - prev.map() - Function call
       *
       * WHY IT CALLS THEM:
       * - updateMessages: Required functionality
       * - prev.map: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls updateMessages, prev.map to process data
       * Output: Computed value or side effect
       *
       */
    const updateMessage = (id: string, fields: Partial<ChatMessage>) => {
        updateMessages(prev =>
            prev.map(m =>
            m.id === id ? { ...m, ...fields } : m
            )
        );
    };
      /**
       * BUSINESS LOGIC: createSuggestionBoxForFollowUpQuestions
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements createSuggestionBoxForFollowUpQuestions logic
       * 2. Calls helper functions: setFollowUpSuggestions, setShowFollowUpSuggestions
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - setFollowUpSuggestions() - Function call
       * - setShowFollowUpSuggestions() - Function call
       *
       * WHY IT CALLS THEM:
       * - setFollowUpSuggestions: State update
       * - setShowFollowUpSuggestions: State update
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls setFollowUpSuggestions, setShowFollowUpSuggestions to process data
       * Output: Computed value or side effect
       *
       */
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
      /**
       * BUSINESS LOGIC: createStreamingBotMessage
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements createStreamingBotMessage logic
       * 2. Calls helper functions: Date.now, updateMessages
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - Date.now() - Function call
       * - updateMessages() - Function call
       *
       * WHY IT CALLS THEM:
       * - Date.now: Required functionality
       * - updateMessages: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls Date.now, updateMessages to process data
       * Output: Computed value or side effect
       *
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
      /**
       * BUSINESS LOGIC: updateStreamingBotMessage
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements updateStreamingBotMessage logic
       * 2. Calls helper functions: updateMessages, prevMessages.map, word.startsWith, word.startsWith, word.startsWith, word.startsWith, prevMsg.endsWith, prevMsg.trim
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - updateMessages() - Function call
       * - prevMessages.map() - Function call
       * - word.startsWith() - Function call
       * - word.startsWith() - Function call
       * - word.startsWith() - Function call
       * - word.startsWith() - Function call
       * - prevMsg.endsWith() - Function call
       * - prevMsg.trim() - Function call
       *
       * WHY IT CALLS THEM:
       * - updateMessages: Required functionality
       * - prevMessages.map: Required functionality
       * - word.startsWith: Required functionality
       * - word.startsWith: Required functionality
       * - word.startsWith: Required functionality
       * - word.startsWith: Required functionality
       * - prevMsg.endsWith: Required functionality
       * - prevMsg.trim: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls updateMessages, prevMessages.map, word.startsWith to process data
       * Output: Computed value or side effect
       *
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
      /**
       * BUSINESS LOGIC: finalizeStreamingMessage
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements finalizeStreamingMessage logic
       * 2. Calls helper functions: updateMessage
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - updateMessage() - Function call
       *
       * WHY IT CALLS THEM:
       * - updateMessage: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls updateMessage to process data
       * Output: Computed value or side effect
       *
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