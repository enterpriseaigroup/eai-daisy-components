/**
 * ChatSetup - Configurator V2 Component
 *
 * Component ChatSetup from ChatSetup.tsx
 *
 * @migrated from DAISY v1
 */

// components/ChatSetup.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { useProfileStore } from '../../store/useProfileStore';
import { useResolvedCouncil } from './hooks/useResolvedCouncil';
import { getValidAccessToken } from './utils/auth';
import { ChatMessage } from '@domain/entities/ProfileData';
import { useChatHistory } from '@presentation/hooks/useChatHistory';
import { safeUpdateUserConfig } from './utils/safeUpdateUserConfig';
import { normalizeAddressCardHTML, normalizeGetStartedCardHTML } from './utils/normalizeCardHTML';
// import { resolveConversationId } from '../../store/utils/userProfileHelpers';

const msalConfig = {
    auth: {
        clientId: process.env.NEXT_PUBLIC_ANON_MSAL_CLIENT_ID!,
        authority: process.env.NEXT_PUBLIC_ANON_MSAL_AUTHORITY!,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
};

const SECRET_KEY = process.env.NEXT_PUBLIC_DLT_SECRET_KEY!;
const BOT_ID = process.env.NEXT_PUBLIC_DLT_BOT_ID!;
const SITE_ID = process.env.NEXT_PUBLIC_DLT_SITE_ID!;
const DIRECT_LINE_ISSUER = process.env.NEXT_PUBLIC_DLT_ISS!;
const DIRECT_LINE_AUDIENCE = process.env.NEXT_PUBLIC_DLT_AUD!;

  /**
   * BUSINESS LOGIC: ChatSetup
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements ChatSetup logic
   * 2. Calls helper functions: useProfileStore, useResolvedCouncil, useChatHistory, useState, useState, useRef, useRef, useRef, useRef, useState, crypto.randomUUID, useEffect, useEffect, updates.push, getProfileData, console.log, console.log, updates.push, generateId, updates.push, generateId, updates.forEach, safeUpdateUserConfig, useEffect, .getAllAccounts, .substring, .toString, Math.random, Date.now, .substring, .substring, email.trim, setUserId, useEffect, .catch, getValidAccessToken, getValidAccessToken, setToken, setConversationId, console.error, useEffect, chatHistory.mutate, useEffect, levenshteinDistance, Array.from, Math.min, str2.charAt, str1.charAt, localStorage.getItem, JSON.parse, current.forEach, existingIds.add, .replace, .toLowerCase, .trim, existingContentMap.add, .map, normalizeAddressCardHTML, normalizeGetStartedCardHTML, .filter, existingIds.has, .replace, .toLowerCase, .trim, existingContentMap.has, existingKey.slice, calculateSimilarity, existingKey.startsWith, existingContentMap.add, allMessages.sort, .match, parseInt, getTimestamp, getTimestamp, allMessages.filter, .pop, .split, seenWelcome.has, seenWelcome.add, .includes, console.log, localStorage.setItem, JSON.stringify, onInitialLoad, localStorage.getItem, JSON.parse, performance.getEntriesByType, onInitialLoad, Date.now, Date.now, localStorage.setItem, JSON.stringify, onInitialLoad, fetchChatHistoryFromAPI, window.clearInterval, window.setInterval, fetchChatHistoryFromAPI, isTabActive, window.clearInterval, sessionStorage.removeItem, safeUpdateUserConfig, safeUpdateUserConfig, Date.now, .replace, .replace, .replace, btoa, unescape, encodeURIComponent, Date.now, crypto.randomUUID, .substr, .toString, Math.random, Math.floor, Date.now, Math.floor, base64urlEncode, JSON.stringify, base64urlEncode, JSON.stringify, .importKey, encoder.encode, .sign, encoder.encode, String.fromCharCode, .replace, .replace, .replace, btoa, useEffect, getStoredDLToken, safeUpdateUserConfig, safeUpdateUserConfig, isExpired, fetchNewDLToken, isExpired, storeDLToken, window.setInterval, getStoredDLToken, fetchNewDLToken, storeDLToken, Date.now, window.clearInterval, useEffect, .reload, safeUpdateUserConfig, safeUpdateUserConfig, localStorage.clear, sessionStorage.clear, window.addEventListener, window.addEventListener, window.removeEventListener, window.removeEventListener, useEffect, loadChatHistory, startPeriodicSync, window.addEventListener, window.removeEventListener, window.clearInterval, useEffect, fetchChatHistoryFromAPI
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - useProfileStore() - Function call
   * - useResolvedCouncil() - Function call
   * - useChatHistory() - Function call
   * - useState() - Function call
   * - useState() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useState() - Function call
   * - crypto.randomUUID() - Function call
   * - useEffect() - Function call
   * - useEffect() - Function call
   * - updates.push() - Function call
   * - getProfileData() - Function call
   * - console.log() - Function call
   * - console.log() - Function call
   * - updates.push() - Function call
   * - generateId() - Function call
   * - updates.push() - Function call
   * - generateId() - Function call
   * - updates.forEach() - Function call
   * - safeUpdateUserConfig() - Function call
   * - useEffect() - Function call
   * - .getAllAccounts() - Function call
   * - .substring() - Function call
   * - .toString() - Function call
   * - Math.random() - Function call
   * - Date.now() - Function call
   * - .substring() - Function call
   * - .substring() - Function call
   * - email.trim() - Function call
   * - setUserId() - Function call
   * - useEffect() - Function call
   * - .catch() - Function call
   * - getValidAccessToken() - Function call
   * - getValidAccessToken() - Function call
   * - setToken() - Function call
   * - setConversationId() - Function call
   * - console.error() - Function call
   * - useEffect() - Function call
   * - chatHistory.mutate() - Function call
   * - useEffect() - Function call
   * - levenshteinDistance() - Function call
   * - Array.from() - Function call
   * - Math.min() - Function call
   * - str2.charAt() - Function call
   * - str1.charAt() - Function call
   * - localStorage.getItem() - Function call
   * - JSON.parse() - Function call
   * - current.forEach() - Function call
   * - existingIds.add() - Function call
   * - .replace() - Function call
   * - .toLowerCase() - Function call
   * - .trim() - Function call
   * - existingContentMap.add() - Function call
   * - .map() - Function call
   * - normalizeAddressCardHTML() - Function call
   * - normalizeGetStartedCardHTML() - Function call
   * - .filter() - Function call
   * - existingIds.has() - Function call
   * - .replace() - Function call
   * - .toLowerCase() - Function call
   * - .trim() - Function call
   * - existingContentMap.has() - Function call
   * - existingKey.slice() - Function call
   * - calculateSimilarity() - Function call
   * - existingKey.startsWith() - Function call
   * - existingContentMap.add() - Function call
   * - allMessages.sort() - Function call
   * - .match() - Function call
   * - parseInt() - Function call
   * - getTimestamp() - Function call
   * - getTimestamp() - Function call
   * - allMessages.filter() - Function call
   * - .pop() - Function call
   * - .split() - Function call
   * - seenWelcome.has() - Function call
   * - seenWelcome.add() - Function call
   * - .includes() - Function call
   * - console.log() - Function call
   * - localStorage.setItem() - Function call
   * - JSON.stringify() - Function call
   * - onInitialLoad() - Function call
   * - localStorage.getItem() - Function call
   * - JSON.parse() - Function call
   * - performance.getEntriesByType() - Function call
   * - onInitialLoad() - Function call
   * - Date.now() - Function call
   * - Date.now() - Function call
   * - localStorage.setItem() - Function call
   * - JSON.stringify() - Function call
   * - onInitialLoad() - Function call
   * - fetchChatHistoryFromAPI() - Function call
   * - window.clearInterval() - Function call
   * - window.setInterval() - Function call
   * - fetchChatHistoryFromAPI() - Function call
   * - isTabActive() - Function call
   * - window.clearInterval() - Function call
   * - sessionStorage.removeItem() - Function call
   * - safeUpdateUserConfig() - Function call
   * - safeUpdateUserConfig() - Function call
   * - Date.now() - Function call
   * - .replace() - Function call
   * - .replace() - Function call
   * - .replace() - Function call
   * - btoa() - Function call
   * - unescape() - Function call
   * - encodeURIComponent() - Function call
   * - Date.now() - Function call
   * - crypto.randomUUID() - Function call
   * - .substr() - Function call
   * - .toString() - Function call
   * - Math.random() - Function call
   * - Math.floor() - Function call
   * - Date.now() - Function call
   * - Math.floor() - Function call
   * - base64urlEncode() - Function call
   * - JSON.stringify() - Function call
   * - base64urlEncode() - Function call
   * - JSON.stringify() - Function call
   * - .importKey() - Function call
   * - encoder.encode() - Function call
   * - .sign() - Function call
   * - encoder.encode() - Function call
   * - String.fromCharCode() - Function call
   * - .replace() - Function call
   * - .replace() - Function call
   * - .replace() - Function call
   * - btoa() - Function call
   * - useEffect() - Function call
   * - getStoredDLToken() - Function call
   * - safeUpdateUserConfig() - Function call
   * - safeUpdateUserConfig() - Function call
   * - isExpired() - Function call
   * - fetchNewDLToken() - Function call
   * - isExpired() - Function call
   * - storeDLToken() - Function call
   * - window.setInterval() - Function call
   * - getStoredDLToken() - Function call
   * - fetchNewDLToken() - Function call
   * - storeDLToken() - Function call
   * - Date.now() - Function call
   * - window.clearInterval() - Function call
   * - useEffect() - Function call
   * - .reload() - Function call
   * - safeUpdateUserConfig() - Function call
   * - safeUpdateUserConfig() - Function call
   * - localStorage.clear() - Function call
   * - sessionStorage.clear() - Function call
   * - window.addEventListener() - Function call
   * - window.addEventListener() - Function call
   * - window.removeEventListener() - Function call
   * - window.removeEventListener() - Function call
   * - useEffect() - Function call
   * - loadChatHistory() - Function call
   * - startPeriodicSync() - Function call
   * - window.addEventListener() - Function call
   * - window.removeEventListener() - Function call
   * - window.clearInterval() - Function call
   * - useEffect() - Function call
   * - fetchChatHistoryFromAPI() - Function call
   *
   * WHY IT CALLS THEM:
   * - useProfileStore: Required functionality
   * - useResolvedCouncil: Required functionality
   * - useChatHistory: Required functionality
   * - useState: Required functionality
   * - useState: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useState: Required functionality
   * - crypto.randomUUID: Required functionality
   * - useEffect: Required functionality
   * - useEffect: Required functionality
   * - updates.push: Required functionality
   * - getProfileData: Required functionality
   * - console.log: Debugging output
   * - console.log: Debugging output
   * - updates.push: Required functionality
   * - generateId: Required functionality
   * - updates.push: Required functionality
   * - generateId: Required functionality
   * - updates.forEach: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - useEffect: Required functionality
   * - .getAllAccounts: Required functionality
   * - .substring: Required functionality
   * - .toString: Required functionality
   * - Math.random: Required functionality
   * - Date.now: Required functionality
   * - .substring: Required functionality
   * - .substring: Required functionality
   * - email.trim: Required functionality
   * - setUserId: State update
   * - useEffect: Required functionality
   * - .catch: Required functionality
   * - getValidAccessToken: Required functionality
   * - getValidAccessToken: Required functionality
   * - setToken: State update
   * - setConversationId: State update
   * - console.error: Error logging
   * - useEffect: Required functionality
   * - chatHistory.mutate: Required functionality
   * - useEffect: Required functionality
   * - levenshteinDistance: Required functionality
   * - Array.from: Required functionality
   * - Math.min: Required functionality
   * - str2.charAt: Required functionality
   * - str1.charAt: Required functionality
   * - localStorage.getItem: Required functionality
   * - JSON.parse: Required functionality
   * - current.forEach: Required functionality
   * - existingIds.add: Required functionality
   * - .replace: Required functionality
   * - .toLowerCase: Required functionality
   * - .trim: Required functionality
   * - existingContentMap.add: Required functionality
   * - .map: Required functionality
   * - normalizeAddressCardHTML: Required functionality
   * - normalizeGetStartedCardHTML: Required functionality
   * - .filter: Required functionality
   * - existingIds.has: Required functionality
   * - .replace: Required functionality
   * - .toLowerCase: Required functionality
   * - .trim: Required functionality
   * - existingContentMap.has: Required functionality
   * - existingKey.slice: Required functionality
   * - calculateSimilarity: Required functionality
   * - existingKey.startsWith: Required functionality
   * - existingContentMap.add: Required functionality
   * - allMessages.sort: Required functionality
   * - .match: Required functionality
   * - parseInt: Required functionality
   * - getTimestamp: Required functionality
   * - getTimestamp: Required functionality
   * - allMessages.filter: Required functionality
   * - .pop: Required functionality
   * - .split: Required functionality
   * - seenWelcome.has: Required functionality
   * - seenWelcome.add: Required functionality
   * - .includes: Required functionality
   * - console.log: Debugging output
   * - localStorage.setItem: State update
   * - JSON.stringify: Required functionality
   * - onInitialLoad: Required functionality
   * - localStorage.getItem: Required functionality
   * - JSON.parse: Required functionality
   * - performance.getEntriesByType: Required functionality
   * - onInitialLoad: Required functionality
   * - Date.now: Required functionality
   * - Date.now: Required functionality
   * - localStorage.setItem: State update
   * - JSON.stringify: Required functionality
   * - onInitialLoad: Required functionality
   * - fetchChatHistoryFromAPI: Data fetching
   * - window.clearInterval: Required functionality
   * - window.setInterval: State update
   * - fetchChatHistoryFromAPI: Data fetching
   * - isTabActive: Required functionality
   * - window.clearInterval: Required functionality
   * - sessionStorage.removeItem: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - Date.now: Required functionality
   * - .replace: Required functionality
   * - .replace: Required functionality
   * - .replace: Required functionality
   * - btoa: Required functionality
   * - unescape: Required functionality
   * - encodeURIComponent: Required functionality
   * - Date.now: Required functionality
   * - crypto.randomUUID: Required functionality
   * - .substr: Required functionality
   * - .toString: Required functionality
   * - Math.random: Required functionality
   * - Math.floor: Required functionality
   * - Date.now: Required functionality
   * - Math.floor: Required functionality
   * - base64urlEncode: Required functionality
   * - JSON.stringify: Required functionality
   * - base64urlEncode: Required functionality
   * - JSON.stringify: Required functionality
   * - .importKey: Required functionality
   * - encoder.encode: Required functionality
   * - .sign: Required functionality
   * - encoder.encode: Required functionality
   * - String.fromCharCode: Required functionality
   * - .replace: Required functionality
   * - .replace: Required functionality
   * - .replace: Required functionality
   * - btoa: Required functionality
   * - useEffect: Required functionality
   * - getStoredDLToken: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - isExpired: Required functionality
   * - fetchNewDLToken: Data fetching
   * - isExpired: Required functionality
   * - storeDLToken: Required functionality
   * - window.setInterval: State update
   * - getStoredDLToken: Required functionality
   * - fetchNewDLToken: Data fetching
   * - storeDLToken: Required functionality
   * - Date.now: Required functionality
   * - window.clearInterval: Required functionality
   * - useEffect: Required functionality
   * - .reload: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - safeUpdateUserConfig: Required functionality
   * - localStorage.clear: Required functionality
   * - sessionStorage.clear: Required functionality
   * - window.addEventListener: Required functionality
   * - window.addEventListener: Required functionality
   * - window.removeEventListener: Required functionality
   * - window.removeEventListener: Required functionality
   * - useEffect: Required functionality
   * - loadChatHistory: Required functionality
   * - startPeriodicSync: Required functionality
   * - window.addEventListener: Required functionality
   * - window.removeEventListener: Required functionality
   * - window.clearInterval: Required functionality
   * - useEffect: Required functionality
   * - fetchChatHistoryFromAPI: Data fetching
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls useProfileStore, useResolvedCouncil, useChatHistory to process data
   * Output: Computed value or side effect
   *
   */
export const ChatSetup = ({
    onInitialLoad,
}: {
    onInitialLoad: (messages: ChatMessage[], isHistoryLoad: boolean) => void;
}) => {
    const { profileData, updateUserConfig, getProfileData } = useProfileStore();
    const council = useResolvedCouncil();
    const { chatHistory, data } = useChatHistory();
    const [token, setToken] = useState<string | null>(null);
    const [conversation_id, setConversationId] = useState<string | null>(null);

    const msalAppRef = useRef<PublicClientApplication>();
    const syncRef = useRef<number>();
    const refreshRef = useRef<number>();
    const wasOffline = useRef(false);

    const [userId, setUserId] = useState<string>('');
    // Helper to gen a UUID-based ID
      /**
       * BUSINESS LOGIC: generateId
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements generateId logic
       * 2. Calls helper functions: crypto.randomUUID
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - crypto.randomUUID() - Function call
       *
       * WHY IT CALLS THEM:
       * - crypto.randomUUID: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls crypto.randomUUID to process data
       * Output: Computed value or side effect
       *
       */
    const generateId = (prefix = 'temp') => `${prefix}_${crypto.randomUUID()}`;
    // Helpers to detect active tab
      /**
       * BUSINESS LOGIC: isTabActive
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements isTabActive logic
       * 2. Returns computed result
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Processes data and applies business logic
       * Output: Computed value or side effect
       *
       */
    const isTabActive = () => document.visibilityState === 'visible';

    // 1) Initialize MSAL once
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Runs side effect logic
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Processes data and applies business logic
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        msalAppRef.current = new PublicClientApplication(msalConfig);
    }, []);

    // 2) Initialize session IDs (project_id & conversation_id) if missing
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes updates.push, getProfileData, console.log, console.log, updates.push, generateId, updates.push, generateId, updates.forEach, safeUpdateUserConfig functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - updates.push() - Function call
       * - getProfileData() - Function call
       * - console.log() - Function call
       * - console.log() - Function call
       * - updates.push() - Function call
       * - generateId() - Function call
       * - updates.push() - Function call
       * - generateId() - Function call
       * - updates.forEach() - Function call
       * - safeUpdateUserConfig() - Function call
       *
       * WHY IT CALLS THEM:
       * - updates.push: Required functionality
       * - getProfileData: Required functionality
       * - console.log: Debugging output
       * - console.log: Debugging output
       * - updates.push: Required functionality
       * - generateId: Required functionality
       * - updates.push: Required functionality
       * - generateId: Required functionality
       * - updates.forEach: Required functionality
       * - safeUpdateUserConfig: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls updates.push, getProfileData, console.log to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        if (!profileData) return;
        const updates: { path: string; value: unknown }[] = [];
        if (!profileData.user_config) {
            updates.push({ path: 'user_config', value: {} });
        }
        const existing = getProfileData()?.user_config;
        console.log('[Existing User Config]', existing);
        console.log('[Fetched User Config]', profileData?.user_config);
        if (!existing?.project_id) {
            updates.push({
                path: 'user_config.project_id',
                value: generateId('app'),
            });
        }
        if (!existing?.conversation_id) {
            updates.push({
                path: 'user_config.conversation_id',
                value: generateId('conv'),
            });
        }
        // Apply all updates in batch
        if (updates.length && profileData) {
            // apply to Zustand
            updates.forEach(u => {
                safeUpdateUserConfig(u.path, u.value, profileData, updateUserConfig);
            });
        }
    }, [profileData?.user_config?.project_id, profileData?.user_config?.conversation_id]);

    // 3) Pick userId based on login state
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors profileData for changes
       * 2. Executes .getAllAccounts, .substring, .toString, Math.random, Date.now, .substring, .substring, email.trim, setUserId functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - .getAllAccounts() - Function call
       * - .substring() - Function call
       * - .toString() - Function call
       * - Math.random() - Function call
       * - Date.now() - Function call
       * - .substring() - Function call
       * - .substring() - Function call
       * - email.trim() - Function call
       * - setUserId() - Function call
       *
       * WHY IT CALLS THEM:
       * - .getAllAccounts: Required functionality
       * - .substring: Required functionality
       * - .toString: Required functionality
       * - Math.random: Required functionality
       * - Date.now: Required functionality
       * - .substring: Required functionality
       * - .substring: Required functionality
       * - email.trim: Required functionality
       * - setUserId: State update
       *
       * DATA FLOW:
       * Input: profileData state/props
       * Processing: Calls .getAllAccounts, .substring, .toString to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - profileData: Triggers when profileData changes
       *
       */
    useEffect(() => {
        const email = profileData?.email_address || '';
        let id: string;
        if (email.trim() && profileData?.id) {
            id = `user_${profileData?.id}`.substring(0, 64);
        } else {
            const accounts = msalAppRef.current?.getAllAccounts() || [];
            if (accounts.length) {
                id = `user_${(accounts[0] as AccountInfo).homeAccountId}`.substring(0, 64);
            } else {
                id = `${Math.random().toString()}${Date.now()}`.substring(0, 64);
            }
        }
        setUserId(id);
    }, [profileData]);

    // 4) Preload anon token
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors council for changes
       * 2. Executes .catch, getValidAccessToken functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - .catch() - Function call
       * - getValidAccessToken() - Function call
       *
       * WHY IT CALLS THEM:
       * - .catch: Required functionality
       * - getValidAccessToken: Required functionality
       *
       * DATA FLOW:
       * Input: council state/props
       * Processing: Calls .catch, getValidAccessToken to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - council: Triggers when council changes
       *
       */
    useEffect(() => {
        getValidAccessToken(council).catch(console.error);
    }, [council]);

    // 5) Fetch and merge chat history
    // TODO: convert to our repo api structure (resolved)
    // Fetch chat history using useChatHistory
      /**
       * BUSINESS LOGIC: fetchChatHistoryFromAPI
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements fetchChatHistoryFromAPI logic
       * 2. Calls helper functions: getValidAccessToken, setToken, setConversationId, console.error
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - getValidAccessToken() - Function call
       * - setToken() - Function call
       * - setConversationId() - Function call
       * - console.error() - Function call
       *
       * WHY IT CALLS THEM:
       * - getValidAccessToken: Required functionality
       * - setToken: State update
       * - setConversationId: State update
       * - console.error: Error logging
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls getValidAccessToken, setToken, setConversationId to process data
       * Output: Computed value or side effect
       *
       */
    const fetchChatHistoryFromAPI = async () => {
        try {
            const token = await getValidAccessToken(council);
            // In AnonState use conversation_id, in loggedInState use user_id
            const conversation_id = profileData?.user_config?.conversation_id;
            // const conversation_id = resolveConversationId(profileData, !profileData?.email_address);
            if (!token || !conversation_id) return;

            setToken(token);
            setConversationId(conversation_id);
            // chatHistory.mutate({
            //     token,
            //     payload: { user_config: { conversation_id } },
            // });
        } catch (e) {
            console.error('Error fetching chat history:', e);
        }
    };

    // trigger chat history fetch when token and conversation_id are available
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors token, conversation_id for changes
       * 2. Executes chatHistory.mutate functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - chatHistory.mutate() - Function call
       *
       * WHY IT CALLS THEM:
       * - chatHistory.mutate: Required functionality
       *
       * DATA FLOW:
       * Input: token, conversation_id state/props
       * Processing: Calls chatHistory.mutate to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - token: Triggers when token changes
       * - conversation_id: Triggers when conversation_id changes
       *
       */
    useEffect(() => {
        if (token && conversation_id) {
            chatHistory.mutate({
                token,
                payload: { user_config: { conversation_id } },
            });
        }
    }
    , [token, conversation_id]);

    // async function fetchChatHistoryFromAPI() {
    //     try {
    //         const token = await getValidAccessToken(council);
    //         const convId = profileData?.user_config?.conversation_id;
    //         if (!token || !convId) return;
    //         const res = await fetch(process.env.NEXT_PUBLIC_CHAT_HISTORY_API_URL!, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${token}`,
    //             },
    //             body: JSON.stringify({ user_config: { conversation_id: convId } }),
    //         });
    //         if (!res.ok) throw new Error(`Status ${res.status}`);
    //         // tell TS these are ChatMessage[]
    //         const apiMessages = (await res.json()) as ChatMessage[];
    //         mergeChatHistory(apiMessages);
    //     } catch (e) {
    //         console.error('Error fetching chat history', e);
    //     }
    // }

    // TODO: See if welcome messages are getting added to the chat history
    // TODO: When redirecting back to DAISY, chatHistory API handling to be fixed (extra addressCard added and address field not getting populated correctly)
    // Merge chat history when data is updated
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors data for changes
       * 2. Executes levenshteinDistance, Array.from, Math.min, str2.charAt, str1.charAt, localStorage.getItem, JSON.parse, current.forEach, existingIds.add, .replace, .toLowerCase, .trim, existingContentMap.add, .map, normalizeAddressCardHTML, normalizeGetStartedCardHTML, .filter, existingIds.has, .replace, .toLowerCase, .trim, existingContentMap.has, existingKey.slice, calculateSimilarity, existingKey.startsWith, existingContentMap.add, allMessages.sort, .match, parseInt, getTimestamp, getTimestamp, allMessages.filter, .pop, .split, seenWelcome.has, seenWelcome.add, .includes, console.log, localStorage.setItem, JSON.stringify, onInitialLoad functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - levenshteinDistance() - Function call
       * - Array.from() - Function call
       * - Math.min() - Function call
       * - str2.charAt() - Function call
       * - str1.charAt() - Function call
       * - localStorage.getItem() - Function call
       * - JSON.parse() - Function call
       * - current.forEach() - Function call
       * - existingIds.add() - Function call
       * - .replace() - Function call
       * - .toLowerCase() - Function call
       * - .trim() - Function call
       * - existingContentMap.add() - Function call
       * - .map() - Function call
       * - normalizeAddressCardHTML() - Function call
       * - normalizeGetStartedCardHTML() - Function call
       * - .filter() - Function call
       * - existingIds.has() - Function call
       * - .replace() - Function call
       * - .toLowerCase() - Function call
       * - .trim() - Function call
       * - existingContentMap.has() - Function call
       * - existingKey.slice() - Function call
       * - calculateSimilarity() - Function call
       * - existingKey.startsWith() - Function call
       * - existingContentMap.add() - Function call
       * - allMessages.sort() - Function call
       * - .match() - Function call
       * - parseInt() - Function call
       * - getTimestamp() - Function call
       * - getTimestamp() - Function call
       * - allMessages.filter() - Function call
       * - .pop() - Function call
       * - .split() - Function call
       * - seenWelcome.has() - Function call
       * - seenWelcome.add() - Function call
       * - .includes() - Function call
       * - console.log() - Function call
       * - localStorage.setItem() - Function call
       * - JSON.stringify() - Function call
       * - onInitialLoad() - Function call
       *
       * WHY IT CALLS THEM:
       * - levenshteinDistance: Required functionality
       * - Array.from: Required functionality
       * - Math.min: Required functionality
       * - str2.charAt: Required functionality
       * - str1.charAt: Required functionality
       * - localStorage.getItem: Required functionality
       * - JSON.parse: Required functionality
       * - current.forEach: Required functionality
       * - existingIds.add: Required functionality
       * - .replace: Required functionality
       * - .toLowerCase: Required functionality
       * - .trim: Required functionality
       * - existingContentMap.add: Required functionality
       * - .map: Required functionality
       * - normalizeAddressCardHTML: Required functionality
       * - normalizeGetStartedCardHTML: Required functionality
       * - .filter: Required functionality
       * - existingIds.has: Required functionality
       * - .replace: Required functionality
       * - .toLowerCase: Required functionality
       * - .trim: Required functionality
       * - existingContentMap.has: Required functionality
       * - existingKey.slice: Required functionality
       * - calculateSimilarity: Required functionality
       * - existingKey.startsWith: Required functionality
       * - existingContentMap.add: Required functionality
       * - allMessages.sort: Required functionality
       * - .match: Required functionality
       * - parseInt: Required functionality
       * - getTimestamp: Required functionality
       * - getTimestamp: Required functionality
       * - allMessages.filter: Required functionality
       * - .pop: Required functionality
       * - .split: Required functionality
       * - seenWelcome.has: Required functionality
       * - seenWelcome.add: Required functionality
       * - .includes: Required functionality
       * - console.log: Debugging output
       * - localStorage.setItem: State update
       * - JSON.stringify: Required functionality
       * - onInitialLoad: Required functionality
       *
       * DATA FLOW:
       * Input: data state/props
       * Processing: Calls levenshteinDistance, Array.from, Math.min to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - data: Triggers when data changes
       *
       */
    useEffect(() => {
        if (!data) return;
          /**
           * BUSINESS LOGIC: calculateSimilarity
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements calculateSimilarity logic
           * 2. Calls helper functions: levenshteinDistance
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - levenshteinDistance() - Function call
           *
           * WHY IT CALLS THEM:
           * - levenshteinDistance: Required functionality
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls levenshteinDistance to process data
           * Output: Computed value or side effect
           *
           */
        const calculateSimilarity = (str1: string, str2: string): number => {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0) return 1.0;
            const distance = levenshteinDistance(longer, shorter);
            return (longer.length - distance) / longer.length;
        };
          /**
           * BUSINESS LOGIC: levenshteinDistance
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements levenshteinDistance logic
           * 2. Calls helper functions: Array.from, Math.min, str2.charAt, str1.charAt
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - Array.from() - Function call
           * - Math.min() - Function call
           * - str2.charAt() - Function call
           * - str1.charAt() - Function call
           *
           * WHY IT CALLS THEM:
           * - Array.from: Required functionality
           * - Math.min: Required functionality
           * - str2.charAt: Required functionality
           * - str1.charAt: Required functionality
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls Array.from, Math.min, str2.charAt to process data
           * Output: Computed value or side effect
           *
           */
        const levenshteinDistance = (str1: string, str2: string): number => {
            const matrix = Array.from({ length: str2.length + 1 }, (_, i) => [i]);
            for (let j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }
            for (let i = 1; i <= str2.length; i++) {
                for (let j = 1; j <= str1.length; j++) {
                    matrix[i][j] = str2.charAt(i - 1) === str1.charAt(j - 1)
                        ? matrix[i - 1][j - 1]
                        : Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                }
            }
            return matrix[str2.length][str1.length];
        };
        const stored = localStorage.getItem("chatHistory");
        const current: ChatMessage[] = stored ? JSON.parse(stored) : [];
        // Step 1: Setup lookup maps
        const existingIds = new Set<string>();
        const existingContentMap = new Set<string>();
        current.forEach(msg => {
            existingIds.add(msg.id);
            if (msg.message && msg.name) {
                const normalized = msg.message.trim().toLowerCase().replace(/\s+/g, ' ');
                existingContentMap.add(`${msg.name}|${normalized}`);
            }
        });
        // Step 2: Filter new unique messages from API
        const newMessages: ChatMessage[] = (data as ChatMessage[]).filter(msg => {
            if (existingIds.has(msg.id)) return false;
            if (msg.message && msg.name) {
                const normalized = msg.message.trim().toLowerCase().replace(/\s+/g, ' ');
                const key = `${msg.name}|${normalized}`;
                if (existingContentMap.has(key)) return false;

                for (const existingKey of existingContentMap) {
                    if (existingKey.startsWith(`${msg.name}|`)) {
                        const existingMessage = existingKey.slice(msg.name.length + 1);
                        if (calculateSimilarity(normalized, existingMessage) > 0.9) {
                            return false;
                        }
                    }
                }
                existingContentMap.add(key);
            }
            return true;
        }).map(msg => {
            if (msg.name === 'Bot') {
                // Mark as from API - this is needed for chat feedback, user can give feedback for current session messages only
                return { ...msg, isFromAPI: true };
            }
            if (msg.name === 'AddressCard' && msg.message) {
                return {
                    ...msg,
                    message: normalizeAddressCardHTML(msg.message, msg.address),
                    isFromAPI: true
                };
            }
            if (msg.name === 'GetStartedCard' && msg.message) {
                return {
                    ...msg,
                    message: normalizeGetStartedCardHTML(msg.message),
                    isFromAPI: true
                };
            }
            return msg;
        });
        // Step 3: Combine and sort all messages
        const allMessages = [...current, ...newMessages];
        allMessages.sort((a, b) => {
              /**
               * BUSINESS LOGIC: getTimestamp
               *
               * WHY THIS EXISTS:
               * - Implements business logic requirement
               *
               * WHAT IT DOES:
               * 1. Implements getTimestamp logic
               * 2. Calls helper functions: .match, parseInt
               * 3. Returns computed result
               *
               * WHAT IT CALLS:
               * - .match() - Function call
               * - parseInt() - Function call
               *
               * WHY IT CALLS THEM:
               * - .match: Required functionality
               * - parseInt: Required functionality
               *
               * DATA FLOW:
               * Input: Component state and props
               * Processing: Calls .match, parseInt to process data
               * Output: Computed value or side effect
               *
               */
            const getTimestamp = (msg: ChatMessage) => {
                const match = msg.id.match(/(\d+)$/);
                return match ? parseInt(match[0], 10) : 0;
            };
            return getTimestamp(a) - getTimestamp(b);
        });
        // Step 4: Remove duplicate welcome messages with -0, -1, -2, -3 suffix
        const seenWelcome = new Set();
        const filteredMessages = allMessages.filter(msg => {
            const suffix = msg.id.split("-").pop();
            if (['0', '1', '2', '3'].includes(suffix!)) {
                if (seenWelcome.has(suffix)) return false;
                seenWelcome.add(suffix);
            }
            return true;
        });
        // Step 5: Store and update
        console.log("set chatHistory", filteredMessages);
        localStorage.setItem("chatHistory", JSON.stringify(filteredMessages));
        onInitialLoad(filteredMessages, false);
    }, [data]);

      /**
       * BUSINESS LOGIC: loadChatHistory
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements loadChatHistory logic
       * 2. Calls helper functions: localStorage.getItem, JSON.parse, performance.getEntriesByType, onInitialLoad, Date.now, Date.now, localStorage.setItem, JSON.stringify, onInitialLoad, fetchChatHistoryFromAPI
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - localStorage.getItem() - Function call
       * - JSON.parse() - Function call
       * - performance.getEntriesByType() - Function call
       * - onInitialLoad() - Function call
       * - Date.now() - Function call
       * - Date.now() - Function call
       * - localStorage.setItem() - Function call
       * - JSON.stringify() - Function call
       * - onInitialLoad() - Function call
       * - fetchChatHistoryFromAPI() - Function call
       *
       * WHY IT CALLS THEM:
       * - localStorage.getItem: Required functionality
       * - JSON.parse: Required functionality
       * - performance.getEntriesByType: Required functionality
       * - onInitialLoad: Required functionality
       * - Date.now: Required functionality
       * - Date.now: Required functionality
       * - localStorage.setItem: State update
       * - JSON.stringify: Required functionality
       * - onInitialLoad: Required functionality
       * - fetchChatHistoryFromAPI: Data fetching
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls localStorage.getItem, JSON.parse, performance.getEntriesByType to process data
       * Output: Computed value or side effect
       *
       */
    function loadChatHistory() {
        // 1. Parse out whatever's already in LS
        const stored = localStorage.getItem('chatHistory');
        const parsed: ChatMessage[] = stored ? JSON.parse(stored) : [];
        // 2. Check the Navigation API (only)
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const navType = navEntries[0]?.type;
        const legacyNav = (performance as Performance & { navigation: PerformanceNavigation }).navigation?.type === PerformanceNavigation.TYPE_RELOAD;
        // 3. We only treat it as a "refresh" if we already had LS data and the browser really reloaded.
        const isRefresh = !!stored && (navType === 'reload' || legacyNav);

        if (isRefresh) {
            // real reload → hit your API
            fetchChatHistoryFromAPI();
        }
        else if (!stored || parsed.length === 0) {
            // very first‑ever mount → trigger welcome messages + AddressCard
            const welcomeMessages: ChatMessage[] = [
                {
                    id: `msg-${Date.now()}-0`,
                    name: "Bot",
                    message: "Hi, I’m DAISY. Ask me anything about the development process or your property. If you click <i><b>Login</b></i>, you can use my application identification tool, my document checklist tool and, receive your documents in a package that is ready for submission on the NSW Planning Portal."
                },
                {
                    id: `msg-${Date.now()}-1`,
                    name: "Bot",
                    message: "Please enter your address below to get started."
                },
                // {
                //     id: `msg-${Date.now()}-2`,
                //     name: "Bot",
                //     message: "Or, please input your address so that I can answer specific questions."
                // }
            ];
            localStorage.setItem('chatHistory', JSON.stringify(welcomeMessages));
            onInitialLoad(welcomeMessages, true);
        }
        else {
            // normal open with existing history
            onInitialLoad(parsed, true);
        }
    }

    /*** Periodic sync ***/
      /**
       * BUSINESS LOGIC: startPeriodicSync
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements startPeriodicSync logic
       * 2. Calls helper functions: window.clearInterval, window.setInterval, fetchChatHistoryFromAPI, isTabActive
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - window.clearInterval() - Function call
       * - window.setInterval() - Function call
       * - fetchChatHistoryFromAPI() - Function call
       * - isTabActive() - Function call
       *
       * WHY IT CALLS THEM:
       * - window.clearInterval: Required functionality
       * - window.setInterval: State update
       * - fetchChatHistoryFromAPI: Data fetching
       * - isTabActive: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls window.clearInterval, window.setInterval, fetchChatHistoryFromAPI to process data
       * Output: Computed value or side effect
       *
       */
    function startPeriodicSync() {
        if (syncRef.current) window.clearInterval(syncRef.current);
        syncRef.current = window.setInterval(() => {
            if (isTabActive()) fetchChatHistoryFromAPI();
        }, 300_000);
    }

    /*** Cleanup ***/
      /**
       * BUSINESS LOGIC: onPageUnload
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements onPageUnload logic
       * 2. Calls helper functions: window.clearInterval, sessionStorage.removeItem
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - window.clearInterval() - Function call
       * - sessionStorage.removeItem() - Function call
       *
       * WHY IT CALLS THEM:
       * - window.clearInterval: Required functionality
       * - sessionStorage.removeItem: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls window.clearInterval, sessionStorage.removeItem to process data
       * Output: Computed value or side effect
       *
       */
    function onPageUnload() {
        if (syncRef.current) window.clearInterval(syncRef.current);
        sessionStorage.removeItem('pageReloaded');
    }

    // Helpers for Direct Line token
      /**
       * BUSINESS LOGIC: getStoredDLToken
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements getStoredDLToken logic
       * 2. Returns computed result
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Processes data and applies business logic
       * Output: Computed value or side effect
       *
       */
    function getStoredDLToken() {
        const raw = profileData?.direct_line_token;
        return raw?.token && raw.expiration ? raw : null;
    }
      /**
       * BUSINESS LOGIC: storeDLToken
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements storeDLToken logic
       * 2. Calls helper functions: safeUpdateUserConfig, safeUpdateUserConfig
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - safeUpdateUserConfig() - Function call
       * - safeUpdateUserConfig() - Function call
       *
       * WHY IT CALLS THEM:
       * - safeUpdateUserConfig: Required functionality
       * - safeUpdateUserConfig: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls safeUpdateUserConfig, safeUpdateUserConfig to process data
       * Output: Computed value or side effect
       *
       */
    function storeDLToken(token: string, expiration: number) {
        const current = profileData?.direct_line_token;
        if (profileData) {
            if (current?.token !== token) {
                safeUpdateUserConfig('direct_line_token.token', token, profileData, updateUserConfig);
            }
            if (current?.expiration !== expiration) {
                safeUpdateUserConfig('direct_line_token.expiration', expiration, profileData, updateUserConfig);
            }
        }
    }
      /**
       * BUSINESS LOGIC: isExpired
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements isExpired logic
       * 2. Calls helper functions: Date.now
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - Date.now() - Function call
       *
       * WHY IT CALLS THEM:
       * - Date.now: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls Date.now to process data
       * Output: Computed value or side effect
       *
       */
    function isExpired(exp?: number) {
        return !exp || Date.now() > exp;
    }
      /**
       * BUSINESS LOGIC: base64urlEncode
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements base64urlEncode logic
       * 2. Calls helper functions: .replace, .replace, .replace, btoa, unescape, encodeURIComponent
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - .replace() - Function call
       * - .replace() - Function call
       * - .replace() - Function call
       * - btoa() - Function call
       * - unescape() - Function call
       * - encodeURIComponent() - Function call
       *
       * WHY IT CALLS THEM:
       * - .replace: Required functionality
       * - .replace: Required functionality
       * - .replace: Required functionality
       * - btoa: Required functionality
       * - unescape: Required functionality
       * - encodeURIComponent: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls .replace, .replace, .replace to process data
       * Output: Computed value or side effect
       *
       */
    function base64urlEncode(str: string): string {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
      /**
       * BUSINESS LOGIC: fetchNewDLToken
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Implements fetchNewDLToken logic
       * 2. Calls helper functions: Date.now, crypto.randomUUID, .substr, .toString, Math.random, Math.floor, Date.now, Math.floor, base64urlEncode, JSON.stringify, base64urlEncode, JSON.stringify, .importKey, encoder.encode, .sign, encoder.encode, String.fromCharCode, .replace, .replace, .replace, btoa
       * 3. Returns computed result
       *
       * WHAT IT CALLS:
       * - Date.now() - Function call
       * - crypto.randomUUID() - Function call
       * - .substr() - Function call
       * - .toString() - Function call
       * - Math.random() - Function call
       * - Math.floor() - Function call
       * - Date.now() - Function call
       * - Math.floor() - Function call
       * - base64urlEncode() - Function call
       * - JSON.stringify() - Function call
       * - base64urlEncode() - Function call
       * - JSON.stringify() - Function call
       * - .importKey() - Function call
       * - encoder.encode() - Function call
       * - .sign() - Function call
       * - encoder.encode() - Function call
       * - String.fromCharCode() - Function call
       * - .replace() - Function call
       * - .replace() - Function call
       * - .replace() - Function call
       * - btoa() - Function call
       *
       * WHY IT CALLS THEM:
       * - Date.now: Required functionality
       * - crypto.randomUUID: Required functionality
       * - .substr: Required functionality
       * - .toString: Required functionality
       * - Math.random: Required functionality
       * - Math.floor: Required functionality
       * - Date.now: Required functionality
       * - Math.floor: Required functionality
       * - base64urlEncode: Required functionality
       * - JSON.stringify: Required functionality
       * - base64urlEncode: Required functionality
       * - JSON.stringify: Required functionality
       * - .importKey: Required functionality
       * - encoder.encode: Required functionality
       * - .sign: Required functionality
       * - encoder.encode: Required functionality
       * - String.fromCharCode: Required functionality
       * - .replace: Required functionality
       * - .replace: Required functionality
       * - .replace: Required functionality
       * - btoa: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls Date.now, crypto.randomUUID, .substr to process data
       * Output: Computed value or side effect
       *
       */
    async function fetchNewDLToken() {
        const expiration = Date.now() + 3600 * 1000; // 1 hour
        const convId = crypto.randomUUID?.() || Math.random().toString(36).substr(2, 12);
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            bot: BOT_ID,
            site: SITE_ID,
            conv: convId,
            user: userId,
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(expiration / 1000),
            iss: DIRECT_LINE_ISSUER,
            aud: DIRECT_LINE_AUDIENCE
        };
        const encoder = new TextEncoder();
        const encodedHeader = base64urlEncode(JSON.stringify(header));
        const encodedPayload = base64urlEncode(JSON.stringify(payload));
        const dataToSign = `${encodedHeader}.${encodedPayload}`;
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(SECRET_KEY),
            { name: 'HMAC', hash: { name: 'SHA-256' } },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
        const signatureBytes = new Uint8Array(signature);
        const signatureStr = String.fromCharCode(...signatureBytes);
        const encodedSignature = btoa(signatureStr)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        const token = `${dataToSign}.${encodedSignature}`;
        return { token, expiration };
    }

    // 6) Initialize & refresh Direct Line token
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Monitors userId for changes
       * 2. Executes getStoredDLToken, safeUpdateUserConfig, safeUpdateUserConfig, isExpired, fetchNewDLToken, isExpired, storeDLToken, window.setInterval, getStoredDLToken, fetchNewDLToken, storeDLToken, Date.now, window.clearInterval functions
       * 3. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - getStoredDLToken() - Function call
       * - safeUpdateUserConfig() - Function call
       * - safeUpdateUserConfig() - Function call
       * - isExpired() - Function call
       * - fetchNewDLToken() - Function call
       * - isExpired() - Function call
       * - storeDLToken() - Function call
       * - window.setInterval() - Function call
       * - getStoredDLToken() - Function call
       * - fetchNewDLToken() - Function call
       * - storeDLToken() - Function call
       * - Date.now() - Function call
       * - window.clearInterval() - Function call
       *
       * WHY IT CALLS THEM:
       * - getStoredDLToken: Required functionality
       * - safeUpdateUserConfig: Required functionality
       * - safeUpdateUserConfig: Required functionality
       * - isExpired: Required functionality
       * - fetchNewDLToken: Data fetching
       * - isExpired: Required functionality
       * - storeDLToken: Required functionality
       * - window.setInterval: State update
       * - getStoredDLToken: Required functionality
       * - fetchNewDLToken: Data fetching
       * - storeDLToken: Required functionality
       * - Date.now: Required functionality
       * - window.clearInterval: Required functionality
       *
       * DATA FLOW:
       * Input: userId state/props
       * Processing: Calls getStoredDLToken, safeUpdateUserConfig, safeUpdateUserConfig to process data
       * Output: Side effects executed, cleanup registered
       *
       * DEPENDENCIES:
       * - userId: Triggers when userId changes
       *
       */
    useEffect(() => {
        let alive = true;
        (async () => {
            const stored = getStoredDLToken();
            if (!stored || isExpired(stored.expiration)) {
                // HAD TO REMOVE: localStorage.removeItem('chatHistory');
                const currentToken = profileData?.direct_line_token?.token;
                const currentExp = profileData?.direct_line_token?.expiration;
                if (profileData && (currentToken !== '' || currentExp !== 0)) {
                    safeUpdateUserConfig('direct_line_token.token', '', profileData, updateUserConfig);
                    safeUpdateUserConfig('direct_line_token.expiration', 0, profileData, updateUserConfig);
                }
            }
            const fresh = stored && !isExpired(stored.expiration)
                ? stored
                : await fetchNewDLToken();
            if (!alive) return;
            storeDLToken(fresh.token, fresh.expiration);
            refreshRef.current = window.setInterval(async () => {
                const cur = getStoredDLToken();
                if (cur && cur.expiration - Date.now() <= 10 * 60 * 1000) {
                    const fn = await fetchNewDLToken();
                    storeDLToken(fn.token, fn.expiration);
                }
            }, 60 * 1000);
        })();
        return () => {
            alive = false;
            if (refreshRef.current) window.clearInterval(refreshRef.current);
        };
    }, [userId]);

    // 7) Connectivity status
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes .reload, safeUpdateUserConfig, safeUpdateUserConfig, localStorage.clear, sessionStorage.clear, window.addEventListener, window.addEventListener, window.removeEventListener, window.removeEventListener functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - .reload() - Function call
       * - safeUpdateUserConfig() - Function call
       * - safeUpdateUserConfig() - Function call
       * - localStorage.clear() - Function call
       * - sessionStorage.clear() - Function call
       * - window.addEventListener() - Function call
       * - window.addEventListener() - Function call
       * - window.removeEventListener() - Function call
       * - window.removeEventListener() - Function call
       *
       * WHY IT CALLS THEM:
       * - .reload: Required functionality
       * - safeUpdateUserConfig: Required functionality
       * - safeUpdateUserConfig: Required functionality
       * - localStorage.clear: Required functionality
       * - sessionStorage.clear: Required functionality
       * - window.addEventListener: Required functionality
       * - window.addEventListener: Required functionality
       * - window.removeEventListener: Required functionality
       * - window.removeEventListener: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls .reload, safeUpdateUserConfig, safeUpdateUserConfig to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
          /**
           * BUSINESS LOGIC: onOnline
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements onOnline logic
           * 2. Calls helper functions: .reload
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - .reload() - Function call
           *
           * WHY IT CALLS THEM:
           * - .reload: Required functionality
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls .reload to process data
           * Output: Computed value or side effect
           *
           */
        function onOnline() {
            if (wasOffline.current) {
                window.location.reload();
            }
            wasOffline.current = false;
        }
          /**
           * BUSINESS LOGIC: onOffline
           *
           * WHY THIS EXISTS:
           * - Implements business logic requirement
           *
           * WHAT IT DOES:
           * 1. Implements onOffline logic
           * 2. Calls helper functions: safeUpdateUserConfig, safeUpdateUserConfig, localStorage.clear, sessionStorage.clear
           * 3. Returns computed result
           *
           * WHAT IT CALLS:
           * - safeUpdateUserConfig() - Function call
           * - safeUpdateUserConfig() - Function call
           * - localStorage.clear() - Function call
           * - sessionStorage.clear() - Function call
           *
           * WHY IT CALLS THEM:
           * - safeUpdateUserConfig: Required functionality
           * - safeUpdateUserConfig: Required functionality
           * - localStorage.clear: Required functionality
           * - sessionStorage.clear: Required functionality
           *
           * DATA FLOW:
           * Input: Component state and props
           * Processing: Calls safeUpdateUserConfig, safeUpdateUserConfig, localStorage.clear to process data
           * Output: Computed value or side effect
           *
           */
        function onOffline() {
            const current = profileData?.direct_line_token;
            if (profileData && (current?.token !== '' || current?.expiration !== 0)) {
                safeUpdateUserConfig('direct_line_token.token', '', profileData, updateUserConfig);
                safeUpdateUserConfig('direct_line_token.expiration', 0, profileData, updateUserConfig);
            }
            localStorage.clear();
            sessionStorage.clear();
            wasOffline.current = true;
        }
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    /*** Kick off load & sync ***/
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes loadChatHistory, startPeriodicSync, window.addEventListener, window.removeEventListener, window.clearInterval functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - loadChatHistory() - Function call
       * - startPeriodicSync() - Function call
       * - window.addEventListener() - Function call
       * - window.removeEventListener() - Function call
       * - window.clearInterval() - Function call
       *
       * WHY IT CALLS THEM:
       * - loadChatHistory: Required functionality
       * - startPeriodicSync: Required functionality
       * - window.addEventListener: Required functionality
       * - window.removeEventListener: Required functionality
       * - window.clearInterval: Required functionality
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls loadChatHistory, startPeriodicSync, window.addEventListener to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        loadChatHistory();
        startPeriodicSync();
        window.addEventListener('beforeunload', onPageUnload);
        return () => {
            window.removeEventListener('beforeunload', onPageUnload);
            if (syncRef.current) window.clearInterval(syncRef.current);
        };
    }, []);

    // When conversation_id becomes available, fetch & merge from API
      /**
       * BUSINESS LOGIC: Side Effect
       *
       * WHY THIS EXISTS:
       * - Implements business logic requirement
       *
       * WHAT IT DOES:
       * 1. Executes fetchChatHistoryFromAPI functions
       * 2. Runs side effect logic
       *
       * WHAT IT CALLS:
       * - fetchChatHistoryFromAPI() - Function call
       *
       * WHY IT CALLS THEM:
       * - fetchChatHistoryFromAPI: Data fetching
       *
       * DATA FLOW:
       * Input: Component state and props
       * Processing: Calls fetchChatHistoryFromAPI to process data
       * Output: Side effects executed, cleanup registered
       *
       * SPECIAL BEHAVIOR:
       * - Runs only on component mount
       *
       */
    useEffect(() => {
        const conv = profileData?.user_config?.conversation_id;
        // const conv = resolveConversationId(profileData, !profileData?.email_address);
        if (conv) {
            fetchChatHistoryFromAPI();
        }
    }, [profileData?.user_config?.conversation_id]);
    // }, [profileData]);

    return null;
};