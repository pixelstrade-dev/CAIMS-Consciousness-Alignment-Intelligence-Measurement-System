"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { DebateTurnPayload, DebateWSEvent } from "@/lib/websocket/manager";

export type { DebateWSEvent };

export type WSStatus = "connecting" | "connected" | "disconnected" | "error";

const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Connects to the WebSocket endpoint for a specific debate and exposes the
 * latest event together with the connection status.  Implements exponential
 * back-off reconnection logic (up to MAX_RECONNECT_ATTEMPTS attempts).
 */
export function useDebateWebSocket(debateId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  const [status, setStatus] = useState<WSStatus>("connecting");
  const [lastEvent, setLastEvent] = useState<DebateWSEvent | null>(null);

  const connect = useCallback(() => {
    if (!debateId || !isMountedRef.current) return;

    // Browser-only API
    if (typeof window === "undefined") return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/debate/${debateId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      if (!isMountedRef.current) return;
      setStatus("connected");
      reconnectAttemptsRef.current = 0;
    });

    ws.addEventListener("message", (event: MessageEvent<string>) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data) as DebateWSEvent;
        setLastEvent(data);
      } catch {
        // Ignore unparseable messages
      }
    });

    ws.addEventListener("close", () => {
      if (!isMountedRef.current) return;
      setStatus("disconnected");
      wsRef.current = null;

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          1000 * 2 ** reconnectAttemptsRef.current,
          30_000
        );
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    });

    ws.addEventListener("error", () => {
      if (!isMountedRef.current) return;
      setStatus("error");
    });
  }, [debateId]);

  useEffect(() => {
    isMountedRef.current = true;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    isMountedRef.current = false;
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
  }, []);

  return { status, lastEvent, disconnect };
}

export type { DebateTurnPayload };
