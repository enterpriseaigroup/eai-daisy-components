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