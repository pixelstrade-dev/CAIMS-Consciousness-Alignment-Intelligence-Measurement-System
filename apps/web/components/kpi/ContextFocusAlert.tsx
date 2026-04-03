"use client";

interface ContextFocusAlertProps {
  alert: {
    level: "warning" | "critical";
    message: string;
    cfiScore: number;
  } | null;
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function ContextFocusAlert({ alert }: ContextFocusAlertProps) {
  if (!alert) return null;

  const isWarning = alert.level === "warning";
  const borderColor = isWarning ? "border-accent-orange" : "border-accent-pink";
  const textColor = isWarning ? "text-accent-orange" : "text-accent-pink";
  const bgColor = isWarning
    ? "bg-accent-orange/10"
    : "bg-accent-pink/10";
  const pulseClass = !isWarning ? "animate-pulse" : "";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${borderColor} ${bgColor} ${pulseClass}`}
      role="alert"
    >
      <div className={`shrink-0 ${textColor}`}>
        <AlertIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold uppercase ${textColor}`}>
            {alert.level === "critical" ? "Critical" : "Warning"}
          </span>
          <span className="text-xs text-foreground-muted font-mono">
            CFI: {Math.round(alert.cfiScore)}
          </span>
        </div>
        <p className="text-sm text-foreground mt-0.5 truncate">
          {alert.message}
        </p>
      </div>
    </div>
  );
}
