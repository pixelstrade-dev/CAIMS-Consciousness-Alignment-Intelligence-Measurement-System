"use client";

import { useMemo } from "react";
import { useChat } from "@/hooks/use-chat";
import { useSessions, type Session } from "@/hooks/use-sessions";
import ChatPanel from "@/components/chat/ChatPanel";
import KPILivePanel from "@/components/chat/KPILivePanel";

export default function ChatPage() {
  const { messages, sendMessage, isLoading, error, sessionId, clearMessages } =
    useChat();
  const {
    sessions,
    isLoading: sessionsLoading,
  } = useSessions();

  // Derive the latest assistant scores and context alert
  const latestAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return null;
  }, [messages]);

  const latestScores = latestAssistant?.scores ?? null;
  const latestAlert = latestAssistant?.contextAlert ?? null;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar: session selector */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background-secondary px-4">
        <select
          value={sessionId ?? ""}
          onChange={() => {
            // Session switching would require loading history from the API.
            // For now the selector shows the current session context.
          }}
          disabled={sessionsLoading}
          className="h-8 max-w-[240px] truncate rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 disabled:opacity-50"
        >
          {sessionId ? (
            <option value={sessionId}>
              Session en cours
              {sessions.find((s: Session) => s.id === sessionId)?.title
                ? ` \u2014 ${sessions.find((s: Session) => s.id === sessionId)!.title}`
                : ""}
            </option>
          ) : (
            <option value="">Nouvelle conversation</option>
          )}
          {sessions
            .filter((s: Session) => s.id !== sessionId)
            .map((s: Session) => (
              <option key={s.id} value={s.id}>
                {s.title ?? `Session ${s.id.slice(0, 8)}...`}
              </option>
            ))}
        </select>

        <button
          onClick={clearMessages}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs text-foreground-muted transition-colors hover:border-accent-cyan/40 hover:text-foreground"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Nouveau chat
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 bg-accent-pink/15 px-4 py-2 text-xs font-medium text-accent-pink">
          {error}
        </div>
      )}

      {/* Main content: chat + KPI sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <ChatPanel
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
        <div className="hidden lg:flex">
          <KPILivePanel scores={latestScores} contextAlert={latestAlert} />
        </div>
      </div>
    </div>
  );
}
