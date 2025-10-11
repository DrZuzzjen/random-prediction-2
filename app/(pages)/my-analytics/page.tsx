"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/app/components/StatCard";
import Sparkline from "@/app/components/Sparkline";
import { useAuth } from "@/app/components/AuthProvider";
import { toDisplayList } from "@/lib/utils/game";
import type { GameRun } from "@/lib/types";

type FavoriteNumber = { number: number; count: number };

type UserAnalyticsResponse = {
  runs: GameRun[];
  stats: {
    totalGames: number;
    bestScore: number;
    avgScore: number;
    latestScore: number;
    firstGame: string | null;
    gamesLastWeek: number;
    scoreTrend: number[];
    favoriteNumbers: FavoriteNumber[];
  } | null;
  error?: string;
};

export default function MyAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadAnalytics();
    }
  }, [authLoading, user]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-analytics', {
        cache: "no-store"
      });
      const payload = await response.json() as UserAnalyticsResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load analytics");
      }

      setData(payload);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats ?? null;
  const runs = data?.runs ?? [];

  const trendMax = useMemo(() => (stats ? Math.max(...stats.scoreTrend, 10) : 10), [stats]);

  if (authLoading || loading) {
    return (
      <main>
        <section className="container" style={{ padding: "48px 0" }}>
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            Loading your analytics...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container" style={{ padding: "48px 0", display: "grid", gap: 24 }}>
        <header className="card" style={{ display: "grid", gap: 12 }}>
          <div className="tag">👤 Personal analytics</div>
          <h1 style={{ margin: 0 }}>Track your intuition over time</h1>
          <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)", maxWidth: 720 }}>
            All your game history and stats, securely stored in Supabase and linked to your account.
          </p>
        </header>

        {error && (
          <div className="card" style={{ padding: 24, color: "rgba(248, 113, 113, 0.9)" }}>
            {error}
          </div>
        )}

        {!stats && !loading && data && (
          <div className="card" style={{ padding: 24, color: "rgba(148, 163, 184, 0.85)" }}>
            No games found yet. Play a round to start tracking your progress!
          </div>
        )}

        {stats && (
          // ... rest of analytics display stays the same
        )}
      </section>
    </main>
  );
}