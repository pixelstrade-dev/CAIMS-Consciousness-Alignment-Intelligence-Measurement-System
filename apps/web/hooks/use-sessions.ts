"use client";

import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "./use-api";

export interface Session {
  id: string;
  title?: string;
  llmModel: string;
  createdAt: string;
  _count: {
    messages: number;
    scores: number;
  };
  scores: { composite: number }[];
}

interface SessionsResponse {
  sessions: Session[];
  limit: number;
  offset: number;
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<SessionsResponse>(
        "/api/session?limit=20&offset=0"
      );
      setSessions(data.sessions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch sessions";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { sessions, isLoading, error, refetch };
}
