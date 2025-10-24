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
    const generateId = (prefix = 'temp') => `${prefix}_${crypto.randomUUID()}`;
    // Helpers to detect active tab
    const isTabActive = () => document.visibilityState === 'visible';

    // 1) Initialize MSAL once
    useEffect(() => {
        msalAppRef.current = new PublicClientApplication(msalConfig);
    }, []);

    // 2) Initialize session IDs (project_id & conversation_id) if missing
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
    useEffect(() => {
        getValidAccessToken(council).catch(console.error);
    }, [council]);

    // 5) Fetch and merge chat history
    // TODO: convert to our repo api structure (resolved)
    // Fetch chat history using useChatHistory
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
    useEffect(() => {
        if (!data) return;
        const calculateSimilarity = (str1: string, str2: string): number => {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            if (longer.length === 0) return 1.0;
            const distance = levenshteinDistance(longer, shorter);
            return (longer.length - distance) / longer.length;
        };
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
    function startPeriodicSync() {
        if (syncRef.current) window.clearInterval(syncRef.current);
        syncRef.current = window.setInterval(() => {
            if (isTabActive()) fetchChatHistoryFromAPI();
        }, 300_000);
    }

    /*** Cleanup ***/
    function onPageUnload() {
        if (syncRef.current) window.clearInterval(syncRef.current);
        sessionStorage.removeItem('pageReloaded');
    }

    // Helpers for Direct Line token
    function getStoredDLToken() {
        const raw = profileData?.direct_line_token;
        return raw?.token && raw.expiration ? raw : null;
    }
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
    function isExpired(exp?: number) {
        return !exp || Date.now() > exp;
    }
    function base64urlEncode(str: string): string {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
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
    useEffect(() => {
        function onOnline() {
            if (wasOffline.current) {
                window.location.reload();
            }
            wasOffline.current = false;
        }
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