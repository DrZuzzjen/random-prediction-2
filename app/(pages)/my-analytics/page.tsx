"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/app/components/StatCard";
import Sparkline from "@/app/components/Sparkline";
import { useSavedIdentity } from "@/app/hooks/useSavedIdentity";
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
  const identity = useSavedIdentity();
  const [emailInput, setEmailInput] = useState(identity.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);

  useEffect(() => {
    if (identity.email && !emailInput) {
      setEmailInput(identity.email);
    }
  }, [identity.email, emailInput]);

  const loadAnalytics = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailInput.trim()) {
      setError("Enter an email to continue");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-analytics?email=${encodeURIComponent(emailInput.trim())}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as UserAnalyticsResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load analytics");
      }
      setData(payload);
      identity.persist(identity.name, emailInput.trim());
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

  return (
    <main>
      <section className="container" style={{ padding: "48px 0", display: "grid", gap: 24 }}>
        <header className="card" style={{ display: "grid", gap: 12 }}>
          <div className="tag">👤 Personal analytics</div>
          <h1 style={{ margin: 0 }}>Track your intuition over time</h1>
          <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)", maxWidth: 720 }}>
            We will bring a full login experience next. For now, use the same email you share after each game to
            unlock your personal history. Everything is securely stored in Supabase.
          </p>
        </header>

        <form onSubmit={loadAnalytics} className="card" style={{ display: "grid", gap: 16, padding: 24 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
            />
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Loading analytics…" : "Load my stats"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setEmailInput(identity.email);
                setData(null);
                setError(null);
              }}
              disabled={loading}
            >
              Reset
            </button>
          </div>
          {error && (
            <div style={{ color: "rgba(248, 113, 113, 0.9)" }}>{error}</div>
          )}
        </form>

        {!stats && !loading && data && (
          <div className="card" style={{ padding: 24, color: "rgba(148, 163, 184, 0.85)" }}>
            No games found for this email yet. Play a round and share the same email to start tracking progress.
          </div>
        )}

        {stats && (
          <div style={{ display: "grid", gap: 24 }}>
            <div className="grid four">
              <StatCard label="Games played" value={stats.totalGames.toString()} hint={`Since ${stats.firstGame ? new Date(stats.firstGame).toLocaleDateString() : "—"}`} accent="blue" />
              <StatCard label="Best score" value={`${stats.bestScore}/10`} hint={`Latest ${stats.latestScore}/10`} accent="green" />
              <StatCard label="Average score" value={`${stats.avgScore.toFixed(1)}/10`} hint={`${stats.gamesLastWeek} games this week`} accent="amber" />
              <StatCard label="Login coming soon" value="Stay tuned" hint="All stats will be tied to your account" accent="purple" />
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0 }}>Recent performance</h3>
              <Sparkline data={stats.scoreTrend} max={trendMax} min={0} />
              <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.75)" }}>
                Showing your last {stats.scoreTrend.length} games. Each dot is a run, zero means no matches.
              </p>
            </div>

            <div className="card" style={{ display: "grid", gap: 16 }}>
              <h3 style={{ margin: 0 }}>Your favourite numbers</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {stats.favoriteNumbers.length === 0 && (
                  <span style={{ color: "rgba(148, 163, 184, 0.75)" }}>
                    Start saving runs to discover personal patterns.
                  </span>
                )}
                {stats.favoriteNumbers.map((item) => (
                  <div
                    key={item.number}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: "rgba(37, 99, 235, 0.18)",
                      border: "1px solid rgba(148, 163, 184, 0.24)",
                      minWidth: 72,
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{item.number.toString().padStart(2, "0")}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(148, 163, 184, 0.75)" }}>{item.count} picks</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ display: "grid", gap: 16 }}>
              <h3 style={{ margin: 0 }}>Recent game history</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Your picks</th>
                    <th>Random numbers</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 10).map((run) => (
                    <tr key={run.id}>
                      <td>{new Date(run.created_at).toLocaleString()}</td>
                      <td>{run.score}/10</td>
                      <td>{toDisplayList(run.predictions)}</td>
                      <td>{toDisplayList(run.random_numbers)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
