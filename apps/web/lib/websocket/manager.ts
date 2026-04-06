import type { WebSocket } from 'ws';

export interface DebateTurnPayload {
  id: string;
  turnNumber: number;
  content: string;
  tokenCount: number | null;
  agent: { name: string; role: string; agentId: string };
  score: {
    composite: number;
    cqScore?: number;
    aqScore?: number;
    cfiScore?: number;
    eqScore?: number;
    sqScore?: number;
  } | null;
}

export type DebateWSEvent =
  | { type: 'connected'; debateId: string }
  | { type: 'turn:new'; debateId: string; turn: DebateTurnPayload }
  | { type: 'score:update'; debateId: string; turnId: string; score: { composite: number } }
  | { type: 'debate:status'; debateId: string; status: string };

class WebSocketManager {
  private clients: Map<string, Set<WebSocket>> = new Map();

  addClient(debateId: string, ws: WebSocket): void {
    if (!this.clients.has(debateId)) {
      this.clients.set(debateId, new Set());
    }
    this.clients.get(debateId)!.add(ws);

    ws.on('close', () => this.removeClient(debateId, ws));
    ws.on('error', () => this.removeClient(debateId, ws));

    const connected: DebateWSEvent = { type: 'connected', debateId };
    ws.send(JSON.stringify(connected));
  }

  private removeClient(debateId: string, ws: WebSocket): void {
    const clients = this.clients.get(debateId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(debateId);
      }
    }
  }

  emit(debateId: string, event: DebateWSEvent): void {
    const clients = this.clients.get(debateId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify(event);
    clients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });
  }

  getClientCount(debateId: string): number {
    return this.clients.get(debateId)?.size ?? 0;
  }

  getDebateIds(): string[] {
    return Array.from(this.clients.keys());
  }
}

// Global singleton so it is shared across Next.js hot-reloads and module instances
declare global {
  // eslint-disable-next-line no-var
  var __wsManager: WebSocketManager | undefined;
}

export const wsManager: WebSocketManager =
  global.__wsManager ?? (global.__wsManager = new WebSocketManager());
