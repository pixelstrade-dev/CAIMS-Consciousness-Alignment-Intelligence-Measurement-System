"use client";

import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "./use-api";
import type { DebateFormat } from "@/lib/scorers/types";

// ----- Types -----

export interface DebateAgent {
  id: string;
  agentId: string;
  name: string;
  role: string;
  systemPrompt: string;
}

export interface Debate {
  id: string;
  topic: string;
  format: DebateFormat;
  status: string;
  createdAt: string;
  agents: DebateAgent[];
  _count: { turns: number };
  metrics: unknown;
}

export interface DebateDetail extends Debate {
  turns: DebateTurn[];
}

export interface DebateTurn {
  id: string;
  turnNumber: number;
  content: string;
  tokenCount: number | null;
  agent: {
    name: string;
    role: string;
    agentId: string;
  };
  score: unknown | null;
}

interface DebatesListResponse {
  debates: Debate[];
}

interface DebateDetailResponse {
  debate: DebateDetail;
}

interface CreateDebateResponse {
  debateId: string;
  agents: DebateAgent[];
  status: string;
  maxTurns: number;
}

interface AdvanceDebateResponse {
  turn: {
    id: string;
    turnNumber: number;
    agent: { name: string; role: string; agentId: string };
    content: string;
    score: unknown | null;
  };
  debateStatus: string;
  currentRound: number;
  turnsRemaining: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ----- useDebates -----

export function useDebates() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<DebatesListResponse>("/api/debate");
      setDebates(data.debates);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch debates";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { debates, isLoading, error, refetch };
}

// ----- useDebate -----

export function useDebate(id: string) {
  const [debate, setDebate] = useState<DebateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<DebateDetailResponse>(`/api/debate/${id}`);
      setDebate(data.debate);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch debate";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { debate, isLoading, error, refetch };
}

// ----- useCreateDebate -----

interface CreateDebateParams {
  topic: string;
  format: DebateFormat;
  agentIds: string[];
  maxTurns?: number;
  enableOrchestrator?: boolean;
}

export function useCreateDebate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDebate = useCallback(
    async (params: CreateDebateParams): Promise<CreateDebateResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFetch<CreateDebateResponse>("/api/debate", {
          method: "POST",
          body: JSON.stringify(params),
        });
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create debate";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { createDebate, isLoading, error };
}

// ----- useAdvanceDebate -----

export function useAdvanceDebate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advanceDebate = useCallback(
    async (
      id: string,
      options?: { maxTurns?: number }
    ): Promise<AdvanceDebateResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFetch<AdvanceDebateResponse>(
          `/api/debate/${id}`,
          {
            method: "POST",
            body: JSON.stringify(options ?? {}),
          }
        );
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to advance debate";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { advanceDebate, isLoading, error };
}
