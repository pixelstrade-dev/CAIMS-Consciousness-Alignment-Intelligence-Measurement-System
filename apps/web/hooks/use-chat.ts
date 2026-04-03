"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "./use-api";
import type { KPIScores, ContextAlert } from "@/lib/scorers/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  scores?: KPIScores | null;
  contextAlert?: ContextAlert | null;
}

interface ChatApiResponse {
  message: string;
  sessionId: string;
  messageId: string;
  scores?: KPIScores;
  contextAlert?: ContextAlert;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      setError(null);
      setIsLoading(true);

      const userMessage: ChatMessage = {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        role: "user",
        content: message,
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const data = await apiFetch<ChatApiResponse>("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            message,
            sessionId: sessionId ?? undefined,
            enableScoring: true,
          }),
        });

        if (!sessionId) {
          setSessionId(data.sessionId);
        }

        const assistantMessage: ChatMessage = {
          id: data.messageId,
          role: "assistant",
          content: data.message,
          scores: data.scores ?? null,
          contextAlert: data.contextAlert ?? null,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  return { messages, sendMessage, isLoading, error, sessionId, clearMessages };
}
