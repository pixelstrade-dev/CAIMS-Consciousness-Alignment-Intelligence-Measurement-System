"use client";

import type { ChatMessage } from "@/hooks/use-chat";

function getScoreColor(value: number): string {
  if (value >= 75) return "text-accent-cyan";
  if (value >= 50) return "text-accent-blue";
  if (value >= 25) return "text-accent-orange";
  return "text-accent-pink";
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const composite = message.scores?.composite ?? null;

  return (
    <div
      className={`flex animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-accent-cyan/10 text-foreground rounded-br-md"
            : "bg-background-card text-foreground rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {composite !== null && (
          <div
            className={`mt-2 flex items-center gap-1.5 text-xs ${getScoreColor(composite)}`}
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span className="font-medium">
              Score: {composite.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
