/**
 * useWebPubSubConnection - Configurator V2 Component
 *
 * Component useWebPubSubConnection from SocketApi.ts
 *
 * @migrated from DAISY v1
 */

import { useEffect, useRef } from "react";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import { useNegotiateWebSocket } from "@presentation/hooks/useNegotiateWebSocket";

interface Metadata {
  confidencepercent: string;
  [key: string]: unknown;
}

interface ServerMessageEvent {
  message: {
    data: {
      arguments: Array<{
        metadata_document_id?: string;
        metadata: Metadata;
      }>;
    };
  };
}

  /**
   * BUSINESS LOGIC: useWebPubSubConnection
   *
   * WHY THIS EXISTS:
   * - Implements business logic requirement
   *
   * WHAT IT DOES:
   * 1. Implements useWebPubSubConnection logic
   * 2. Calls helper functions: console.log, useNegotiateWebSocket, useRef, useRef, useRef, useRef, useRef, client.on, console.log, client.on, console.warn, retryReconnect, client.on, parseInt, console.log, console.warn, console.log, onDocumentUpdate, console.log, JSON.stringify, .catch, console.error, String, console.warn, msg.includes, msg.includes, retryReconnect, client.start, console.error, Math.min, console.log, setTimeout, connect, useEffect, console.log, console.error, setTimeout, connect, clearTimeout, useEffect, .stop, clearTimeout
   * 3. Returns computed result
   *
   * WHAT IT CALLS:
   * - console.log() - Function call
   * - useNegotiateWebSocket() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - useRef() - Function call
   * - client.on() - Function call
   * - console.log() - Function call
   * - client.on() - Function call
   * - console.warn() - Function call
   * - retryReconnect() - Function call
   * - client.on() - Function call
   * - parseInt() - Function call
   * - console.log() - Function call
   * - console.warn() - Function call
   * - console.log() - Function call
   * - onDocumentUpdate() - Function call
   * - console.log() - Function call
   * - JSON.stringify() - Function call
   * - .catch() - Function call
   * - console.error() - Function call
   * - String() - Function call
   * - console.warn() - Function call
   * - msg.includes() - Function call
   * - msg.includes() - Function call
   * - retryReconnect() - Function call
   * - client.start() - Function call
   * - console.error() - Function call
   * - Math.min() - Function call
   * - console.log() - Function call
   * - setTimeout() - Function call
   * - connect() - Function call
   * - useEffect() - Function call
   * - console.log() - Function call
   * - console.error() - Function call
   * - setTimeout() - Function call
   * - connect() - Function call
   * - clearTimeout() - Function call
   * - useEffect() - Function call
   * - .stop() - Function call
   * - clearTimeout() - Function call
   *
   * WHY IT CALLS THEM:
   * - console.log: Debugging output
   * - useNegotiateWebSocket: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - useRef: Required functionality
   * - client.on: Required functionality
   * - console.log: Debugging output
   * - client.on: Required functionality
   * - console.warn: Warning notification
   * - retryReconnect: Required functionality
   * - client.on: Required functionality
   * - parseInt: Required functionality
   * - console.log: Debugging output
   * - console.warn: Warning notification
   * - console.log: Debugging output
   * - onDocumentUpdate: Required functionality
   * - console.log: Debugging output
   * - JSON.stringify: Required functionality
   * - .catch: Required functionality
   * - console.error: Error logging
   * - String: Required functionality
   * - console.warn: Warning notification
   * - msg.includes: Required functionality
   * - msg.includes: Required functionality
   * - retryReconnect: Required functionality
   * - client.start: Required functionality
   * - console.error: Error logging
   * - Math.min: Required functionality
   * - console.log: Debugging output
   * - setTimeout: State update
   * - connect: Required functionality
   * - useEffect: Required functionality
   * - console.log: Debugging output
   * - console.error: Error logging
   * - setTimeout: State update
   * - connect: Required functionality
   * - clearTimeout: Required functionality
   * - useEffect: Required functionality
   * - .stop: Required functionality
   * - clearTimeout: Required functionality
   *
   * DATA FLOW:
   * Input: Component state and props
   * Processing: Calls console.log, useNegotiateWebSocket, useRef to process data
   * Output: Computed value or side effect
   *
   */
export function useWebPubSubConnection(
  userJwt: string | null | undefined,
  onDocumentUpdate: (docId: string, metadata: Metadata, isValidated: boolean) => void
) {
  console.log('userJwt:', userJwt ? '[Token available]' : '[Token missing]');
  const { data, isLoading, isError, error } = useNegotiateWebSocket(userJwt || '');
  const clientRef = useRef<WebPubSubClient | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 15;
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);
  const isUnmounted = useRef(false);
  const hasConnected = useRef(false);

    /**
     * BUSINESS LOGIC: connect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements connect logic
     * 2. Calls helper functions: client.on, console.log, client.on, console.warn, retryReconnect, client.on, parseInt, console.log, console.warn, console.log, onDocumentUpdate, console.log, JSON.stringify, .catch, console.error, String, console.warn, msg.includes, msg.includes, retryReconnect, client.start
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - client.on() - Function call
     * - console.log() - Function call
     * - client.on() - Function call
     * - console.warn() - Function call
     * - retryReconnect() - Function call
     * - client.on() - Function call
     * - parseInt() - Function call
     * - console.log() - Function call
     * - console.warn() - Function call
     * - console.log() - Function call
     * - onDocumentUpdate() - Function call
     * - console.log() - Function call
     * - JSON.stringify() - Function call
     * - .catch() - Function call
     * - console.error() - Function call
     * - String() - Function call
     * - console.warn() - Function call
     * - msg.includes() - Function call
     * - msg.includes() - Function call
     * - retryReconnect() - Function call
     * - client.start() - Function call
     *
     * WHY IT CALLS THEM:
     * - client.on: Required functionality
     * - console.log: Debugging output
     * - client.on: Required functionality
     * - console.warn: Warning notification
     * - retryReconnect: Required functionality
     * - client.on: Required functionality
     * - parseInt: Required functionality
     * - console.log: Debugging output
     * - console.warn: Warning notification
     * - console.log: Debugging output
     * - onDocumentUpdate: Required functionality
     * - console.log: Debugging output
     * - JSON.stringify: Required functionality
     * - .catch: Required functionality
     * - console.error: Error logging
     * - String: Required functionality
     * - console.warn: Warning notification
     * - msg.includes: Required functionality
     * - msg.includes: Required functionality
     * - retryReconnect: Required functionality
     * - client.start: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls client.on, console.log, client.on to process data
     * Output: Computed value or side effect
     *
     */
  const connect = (url: string) => {
    if (hasConnected.current || !url) return;
    hasConnected.current = true;

    const client = new WebPubSubClient(url);
    clientRef.current = client;

    client.on("connected", () => {
      console.log("✅ WebPubSub connected");
      retryCount.current = 0;
    });

    client.on("disconnected", () => {
      console.warn("🔌 WebPubSub disconnected");
      retryReconnect(url);
    });

    client.on("server-message", (e: unknown) => {
      const event = e as ServerMessageEvent;
      const args = event.message.data.arguments;
      if (args?.length >= 3) {
        // docID (metadata_document_id) maps to bh_encompaasdoctypeid
        // For a doc to be validated: suggestion_id === docID (handled by Mid) AND confidencepercent >= 60 (handled by Front)
        // TODO: Across env, encompass can't send the same suggestion_ids, so we need to revert to bh_name === suggestion_display (will be handled by Mid, so Front will do only CS)
        const docId = args[0]?.metadata_document_id;
        const metadata = args[2]?.metadata;
        const confidenceStr = metadata?.confidencepercent;
        const confidence = parseInt(confidenceStr || "0", 10);
        const isValidated = !!confidenceStr && confidence >= 60;
        console.log("📌 Validation details in SOCKET:", {
          docId,
          confidence,
          isValidated,
        });
        if (docId) {
          console.log(`📄 Updating doc ${docId} with confidence ${confidence}`);
          onDocumentUpdate(docId, metadata, isValidated);
        } else {
          console.warn("⚠️ metadata_document_id not found");
        }
      }
      console.log("📩 Raw message data:", JSON.stringify(event.message.data, null, 2));
    });

    client
      .start()
      .catch((err) => {
        console.error("❗ WebPubSub start failed:", err);
        const msg = String(err?.message || "");

        if (msg.includes("403") || msg.includes("unauthorized")) {
          console.warn("🔐 Unauthorized. Skipping retries.");
          return;
        }

        hasConnected.current = false; // allow retry to re-connect
        retryReconnect(url);
      });
  };

    /**
     * BUSINESS LOGIC: retryReconnect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Implements retryReconnect logic
     * 2. Calls helper functions: console.error, Math.min, console.log, setTimeout, connect
     * 3. Returns computed result
     *
     * WHAT IT CALLS:
     * - console.error() - Function call
     * - Math.min() - Function call
     * - console.log() - Function call
     * - setTimeout() - Function call
     * - connect() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.error: Error logging
     * - Math.min: Required functionality
     * - console.log: Debugging output
     * - setTimeout: State update
     * - connect: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls console.error, Math.min, console.log to process data
     * Output: Computed value or side effect
     *
     */
  const retryReconnect = (url: string) => {
    if (isUnmounted.current || retryCount.current >= maxRetries) {
      console.error("🛑 Max retries reached or component unmounted. Aborting retry.");
      return;
    }

    const delay = Math.min(2000 * 2 ** retryCount.current, 30000);
    retryCount.current += 1;
    console.log(`🔁 Retrying WebPubSub in ${delay / 1000}s`);

    retryTimeout.current = setTimeout(() => {
      if (!isUnmounted.current) connect(url);
    }, delay);
  };

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Monitors userJwt, isLoading, isError for changes
     * 2. Executes console.log, console.error, setTimeout, connect, clearTimeout functions
     * 3. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - console.log() - Function call
     * - console.error() - Function call
     * - setTimeout() - Function call
     * - connect() - Function call
     * - clearTimeout() - Function call
     *
     * WHY IT CALLS THEM:
     * - console.log: Debugging output
     * - console.error: Error logging
     * - setTimeout: State update
     * - connect: Required functionality
     * - clearTimeout: Required functionality
     *
     * DATA FLOW:
     * Input: userJwt, isLoading, isError state/props
     * Processing: Calls console.log, console.error, setTimeout to process data
     * Output: Side effects executed, cleanup registered
     *
     * DEPENDENCIES:
     * - userJwt: Triggers when userJwt changes
     * - isLoading: Triggers when isLoading changes
     * - isError: Triggers when isError changes
     *
     */
  useEffect(() => {
    // Don't abort if token is null or undefined - we'll use the useNegotiateWebSocket hook
    // to handle this and provide proper error messages

    if (isLoading) {
      console.log("⏳ Negotiating WebSocket connection...");
      return;
    }

    if (isError) {
      console.error("❌ Negotiation error:", error);
      return;
    }

    if (data?.url) {
      const timeout = setTimeout(() => connect(data.url!), 300);
      return () => clearTimeout(timeout);
    }
  }, [userJwt, data?.url, isLoading, isError]);

    /**
     * BUSINESS LOGIC: Side Effect
     *
     * WHY THIS EXISTS:
     * - Implements business logic requirement
     *
     * WHAT IT DOES:
     * 1. Executes .stop, clearTimeout functions
     * 2. Runs side effect logic
     *
     * WHAT IT CALLS:
     * - .stop() - Function call
     * - clearTimeout() - Function call
     *
     * WHY IT CALLS THEM:
     * - .stop: Required functionality
     * - clearTimeout: Required functionality
     *
     * DATA FLOW:
     * Input: Component state and props
     * Processing: Calls .stop, clearTimeout to process data
     * Output: Side effects executed, cleanup registered
     *
     * SPECIAL BEHAVIOR:
     * - Runs only on component mount
     *
     */
  useEffect(() => {
    return () => {
      isUnmounted.current = true;

      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }

      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }

      hasConnected.current = false;
    };
  }, []);
}