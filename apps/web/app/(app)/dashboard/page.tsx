"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSessions } from "@/hooks/use-sessions";
import { useDebates } from "@/hooks/use-debates";

function StatCard({
  label,
  value,
  accent,
  isLoading,
}: {
  label: string;
  value: string | number;
  accent: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-background-card border border-border rounded-xl p-5 flex flex-col gap-2">
      <p className="text-foreground-muted text-xs font-medium uppercase tracking-wider">
        {label}
      </p>
      {isLoading ? (
        <div className="h-8 w-20 rounded bg-background-secondary animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      )}
    </div>
  );
}

function SessionCardSkeleton() {
  return (
    <div className="bg-background-card border border-border rounded-xl p-5 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-background-secondary mb-3" />
      <div className="h-3 w-1/2 rounded bg-background-secondary mb-4" />
      <div className="flex items-center gap-3">
        <div className="h-3 w-16 rounded bg-background-secondary" />
        <div className="h-3 w-16 rounded bg-background-secondary" />
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-accent-cyan";
  if (score >= 50) return "text-accent-blue";
  if (score >= 25) return "text-accent-orange";
  return "text-accent-pink";
}

export default function DashboardPage() {
  const { sessions, isLoading: sessionsLoading, error: sessionsError } = useSessions();
  const { debates, isLoading: debatesLoading, error: debatesError } = useDebates();

  const isLoading = sessionsLoading || debatesLoading;

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce(
      (sum, s) => sum + (s._count?.messages ?? 0),
      0
    );

    const allScores = sessions.flatMap((s) =>
      s.scores?.map((sc) => sc.composite) ?? []
    );
    const avgComposite =
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0;

    const activeDebates = debates.filter((d) => d.status === "active").length;

    return { totalSessions, totalMessages, avgComposite, activeDebates };
  }, [sessions, debates]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Tableau de Bord CAIMS
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Vue d&apos;ensemble de vos sessions et analyses
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          accent="text-accent-cyan"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Messages"
          value={stats.totalMessages}
          accent="text-accent-blue"
          isLoading={isLoading}
        />
        <StatCard
          label="Score Composite Moyen"
          value={stats.avgComposite.toFixed(1)}
          accent="text-accent-orange"
          isLoading={isLoading}
        />
        <StatCard
          label="Débats Actifs"
          value={stats.activeDebates}
          accent="text-accent-purple"
          isLoading={isLoading}
        />
      </div>

      {/* Error States */}
      {sessionsError && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 text-accent-pink text-sm">
          Erreur lors du chargement des sessions: {sessionsError}
        </div>
      )}
      {debatesError && (
        <div className="bg-accent-pink/10 border border-accent-pink/30 rounded-lg p-4 text-accent-pink text-sm">
          Erreur lors du chargement des débats: {debatesError}
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Sessions Récentes
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-background-card border border-border rounded-xl p-8 text-center">
            <p className="text-foreground-muted">
              Aucune session trouvée. Commencez une conversation pour voir vos
              données ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {sessions.map((session) => {
              const lastScore =
                session.scores?.length > 0
                  ? session.scores[session.scores.length - 1].composite
                  : null;

              return (
                <Link
                  key={session.id}
                  href={`/chat?session=${session.id}`}
                  className="bg-background-card border border-border rounded-xl p-5 hover:border-accent-cyan/40 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-cyan transition-colors truncate">
                    {session.title || `Session ${session.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-xs text-foreground-muted mt-1">
                    {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <span className="text-foreground-muted">
                      <span className="text-accent-blue font-medium">
                        {session._count?.messages ?? 0}
                      </span>{" "}
                      messages
                    </span>

                    {lastScore !== null && (
                      <span className="text-foreground-muted">
                        Score:{" "}
                        <span
                          className={`font-medium ${scoreColor(lastScore)}`}
                        >
                          {lastScore.toFixed(1)}
                        </span>
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
