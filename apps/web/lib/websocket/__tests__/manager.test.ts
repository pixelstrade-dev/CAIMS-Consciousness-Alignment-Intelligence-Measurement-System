/**
 * Tests for the WebSocket connection manager.
 *
 * The manager class is accessed via the global singleton, so we reset it
 * between tests by clearing `global.__wsManager`.
 */

import type { WebSocket } from 'ws';
import type { DebateWSEvent } from '../manager';

// Helper: create a minimal WebSocket mock
function makeMockWs(readyState = 1 /* OPEN */) {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
  const sent: string[] = [];

  const ws = {
    readyState,
    OPEN: 1,
    send: jest.fn((data: string) => { sent.push(data); }),
    on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
    }),
    emit: (event: string, ...args: unknown[]) => {
      (handlers[event] ?? []).forEach(h => h(...args));
    },
    _sent: sent,
  };

  return ws as unknown as WebSocket & { _sent: string[]; emit: (e: string, ...a: unknown[]) => void };
}

// Reset the global manager singleton before each test
beforeEach(() => {
  delete (global as { __wsManager?: unknown }).__wsManager;
  // Re-require the module to get a fresh instance
  jest.resetModules();
});

describe('WebSocketManager', () => {
  function getManager() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../manager').wsManager as import('../manager').WebSocketManager & {
      getClientCount: (id: string) => number;
      getDebateIds: () => string[];
      emit: (id: string, event: DebateWSEvent) => void;
      addClient: (id: string, ws: WebSocket) => void;
    };
  }

  it('sends a "connected" event when a client joins', () => {
    const mgr = getManager();
    const ws = makeMockWs();

    mgr.addClient('debate-1', ws);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const msg = JSON.parse((ws as unknown as { _sent: string[] })._sent[0]) as DebateWSEvent;
    expect(msg.type).toBe('connected');
    expect((msg as Extract<DebateWSEvent, { type: 'connected' }>).debateId).toBe('debate-1');
  });

  it('tracks client count per debate', () => {
    const mgr = getManager();
    const ws1 = makeMockWs();
    const ws2 = makeMockWs();

    mgr.addClient('debate-1', ws1);
    mgr.addClient('debate-1', ws2);
    mgr.addClient('debate-2', ws1);

    expect(mgr.getClientCount('debate-1')).toBe(2);
    expect(mgr.getClientCount('debate-2')).toBe(1);
    expect(mgr.getClientCount('debate-unknown')).toBe(0);
  });

  it('removes a client on close and cleans up empty rooms', () => {
    const mgr = getManager();
    const ws = makeMockWs();

    mgr.addClient('debate-1', ws);
    expect(mgr.getClientCount('debate-1')).toBe(1);

    // Simulate a close event
    ws.emit('close');

    expect(mgr.getClientCount('debate-1')).toBe(0);
    expect(mgr.getDebateIds()).not.toContain('debate-1');
  });

  it('removes a client on error', () => {
    const mgr = getManager();
    const ws = makeMockWs();

    mgr.addClient('debate-1', ws);
    ws.emit('error');

    expect(mgr.getClientCount('debate-1')).toBe(0);
  });

  it('emits events to all connected clients', () => {
    const mgr = getManager();
    const ws1 = makeMockWs();
    const ws2 = makeMockWs();

    mgr.addClient('debate-1', ws1);
    mgr.addClient('debate-1', ws2);

    const event: DebateWSEvent = {
      type: 'debate:status',
      debateId: 'debate-1',
      status: 'concluded',
    };
    mgr.emit('debate-1', event);

    // Each ws got: 1 "connected" + 1 "debate:status" = 2 sends
    expect(ws1.send).toHaveBeenCalledTimes(2);
    expect(ws2.send).toHaveBeenCalledTimes(2);

    const lastMsg = JSON.parse(ws1._sent[1]) as DebateWSEvent;
    expect(lastMsg.type).toBe('debate:status');
  });

  it('does not send to closed WebSocket connections', () => {
    const mgr = getManager();
    const closedWs = makeMockWs(3 /* CLOSED */);

    mgr.addClient('debate-1', closedWs);

    mgr.emit('debate-1', { type: 'debate:status', debateId: 'debate-1', status: 'active' });

    // Only the initial "connected" message should have been attempted (send is called
    // regardless for the connected message, but the status emit checks readyState)
    const calls = (closedWs.send as jest.Mock).mock.calls;
    // The "debate:status" emit should NOT have called send (readyState !== OPEN)
    expect(calls.length).toBe(1); // only the "connected" message
  });

  it('does nothing when emitting to a debate with no clients', () => {
    const mgr = getManager();
    // Should not throw
    expect(() =>
      mgr.emit('no-clients', { type: 'debate:status', debateId: 'no-clients', status: 'active' })
    ).not.toThrow();
  });

  it('returns debate IDs with active clients', () => {
    const mgr = getManager();
    const ws = makeMockWs();

    mgr.addClient('d1', ws);
    mgr.addClient('d2', ws);

    const ids = mgr.getDebateIds();
    expect(ids).toContain('d1');
    expect(ids).toContain('d2');
  });

  it('uses a global singleton — two imports share the same state', () => {
    const mgr1 = getManager();
    const ws = makeMockWs();
    mgr1.addClient('debate-1', ws);

    // A second import should return the same instance (global singleton)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mgr2 = require('../manager').wsManager as typeof mgr1;
    expect(mgr2.getClientCount('debate-1')).toBe(1);
  });
});
