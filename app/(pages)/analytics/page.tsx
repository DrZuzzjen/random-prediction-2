"use client";

import { useEffect, useMemo, useState } from "react";
import NumberHeatmap from "@/app/components/NumberHeatmap";
import StatCard from "@/app/components/StatCard";
import RangeDistribution from "@/app/components/RangeDistribution";
import ComparisonCard from "@/app/components/ComparisonCard";
import OverlapTable from "@/app/components/OverlapTable";
import InsightsCard from "@/app/components/InsightsCard";
import type { NumberFrequency } from "@/lib/types";

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const totalFromFrequency = (freq: NumberFrequency) =>
  Object.values(freq).reduce((sum, value) => sum + value, 0);

type GlobalAnalyticsResponse = {
  stats: {
    totalGames: number;
    avgScore: number;
    bestScore: number;
    totalPlayers: number;
    scoreDistribution: Record<number, number>;
  };
  frequencies: {
    predictions: NumberFrequency;
    random: NumberFrequency;
  };
  predictionRanges: { small: number; medium: number; large: number };
  randomRanges: { small: number; medium: number; large: number };
  predictionEvenOdd: { even: number; odd: number };
  randomEvenOdd: { even: number; odd: number };
  predictionPrimeUsage: { prime: number; composite: number };
  randomPrimeUsage: { prime: number; composite: number };
  specialPatterns: { luckySevens: number; unluckyThirteens: number; repeatingDigits: number };
  overlap: Array<{ number: number; predicted: number; drawn: number; overlap: number }>;
};

type RemoteState = {
  loading: boolean;
  error: string | null;
  data: GlobalAnalyticsResponse | null;
};

export default function AnalyticsPage() {
  const [state, setState] = useState<RemoteState>({ loading: true, error: null, data: null });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/global-analytics", { cache: "no-store" });
        const payload = (await response.json()) as GlobalAnalyticsResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load analytics");
        }
        setState({ loading: false, error: null, data: payload });
      } catch (error) {
        console.error(error);
        setState({
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
          data: null
        });
      }
    };

    load();
  }, []);

  const totalPredictions = useMemo(
    () => (state.data ? totalFromFrequency(state.data.frequencies.predictions) : 0),
    [state.data]
  );
  const totalRandom = useMemo(
    () => (state.data ? totalFromFrequency(state.data.frequencies.random) : 0),
    [state.data]
  );

  const evenOdd = useMemo(() => {
    if (!state.data) return null;
    const humanEvenPct = totalPredictions === 0
      ? 0
      : (state.data.predictionEvenOdd.even / totalPredictions) * 100;
    const randomEvenPct = totalRandom === 0 ? 0 : (state.data.randomEvenOdd.even / totalRandom) * 100;

    return {
      humanEven: humanEvenPct,
      humanOdd: 100 - humanEvenPct,
      randomEven: randomEvenPct,
      randomOdd: 100 - randomEvenPct
    };
  }, [state.data, totalPredictions, totalRandom]);

  const primeComposite = useMemo(() => {
    if (!state.data) return null;
    const humanPrime = totalPredictions === 0
      ? 0
      : (state.data.predictionPrimeUsage.prime / totalPredictions) * 100;
    const randomPrime = totalRandom === 0
      ? 0
      : (state.data.randomPrimeUsage.prime / totalRandom) * 100;

    return { humanPrime, randomPrime };
  }, [state.data, totalPredictions, totalRandom]);

  const patternHighlights = useMemo(() => {
    if (!state.data) return [] as string[];
    const { specialPatterns } = state.data;
    const insights: string[] = [];

    if (totalPredictions > 0) {
      const luckyPct = (specialPatterns.luckySevens / totalPredictions) * 100;
      if (luckyPct > 12) {
        insights.push(`Humans show a ${luckyPct.toFixed(1)}% bias towards numbers ending in 7.`);
      }

      const thirteenPct = (specialPatterns.unluckyThirteens / totalPredictions) * 100;
      const expected13 = (2 / 99) * 100;
      if (thirteenPct < expected13 - 1) {
        insights.push("Number 13 is still considered unlucky by the community.");
      }

      const repeatingPct = (specialPatterns.repeatingDigits / totalPredictions) * 100;
      if (repeatingPct > 10) {
        insights.push("Repeating digits (11, 22, 33...) appear more often than randomness would suggest.");
      }
    }

    if (insights.length === 0) {
      insights.push("Community picks look fairly balanced with no extreme biases detected.");
    }

    return insights;
  }, [state.data, totalPredictions]);

  const randomnessScore = useMemo(() => {
    if (!state.data || !evenOdd || !primeComposite) return 100;
    let score = 100;
    if (Math.abs(evenOdd.humanEven - 50) > 5) score -= 10;
    if (Math.abs(primeComposite.humanPrime - ((25 / 99) * 100)) > 5) score -= 15;
    if (patternHighlights.length > 1) score -= 10;
    return Math.max(score, 40);
  }, [state.data, evenOdd, primeComposite, patternHighlights]);

  if (state.loading) {
    return (
      <main>
        <section className="container" style={{ padding: "48px 0" }}>
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            Loading analytics…
          </div>
        </section>
      </main>
    );
  }

  if (state.error || !state.data) {
    return (
      <main>
        <section className="container" style={{ padding: "48px 0" }}>
          <div className="card" style={{ padding: 32, textAlign: "center", color: "rgba(248, 113, 113, 0.9)" }}>
            {state.error ?? "Analytics unavailable"}
          </div>
        </section>
      </main>
    );
  }

  const { stats, frequencies, predictionRanges, randomRanges, overlap } = state.data;

  return (
    <main>
      <section className="container" style={{ padding: "48px 0", display: "grid", gap: 24 }}>
        <header className="card" style={{ display: "grid", gap: 12 }}>
          <div className="tag">📊 Global Analytics</div>
          <h1 style={{ margin: 0 }}>Human intuition vs true randomness</h1>
          <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)", maxWidth: 720 }}>
            Every game recorded in Supabase fuels these insights. See how the community selects numbers,
            where randomness shines, and which habits hurt success.
          </p>
        </header>

        <div className="grid three">
          <StatCard label="Games analysed" value={stats.totalGames.toLocaleString()} hint={`${stats.totalPlayers.toLocaleString()} players`} accent="blue" />
          <StatCard label="Average score" value={`${stats.avgScore.toFixed(1)}/10`} hint={`Best score ${stats.bestScore}/10`} accent="green" />
          <StatCard
            label="Community randomness"
            value={`${randomnessScore}/100`}
            hint="Higher score = less bias"
            accent="purple"
          />
        </div>

        <div className="grid two">
          <NumberHeatmap
            title="Human prediction heatmap"
            subtitle="Biases surface where the grid glows brightest"
            frequency={frequencies.predictions}
          />
          <NumberHeatmap
            title="Random.org distribution"
            subtitle="Baseline distribution for true randomness"
            frequency={frequencies.random}
          />
        </div>

        <div className="grid two">
          <RangeDistribution title="Human range preference" ranges={predictionRanges} tone="blue" />
          <RangeDistribution title="True random distribution" ranges={randomRanges} tone="indigo" />
        </div>

        {evenOdd && primeComposite && (
          <div className="grid two">
            <ComparisonCard
              title="Even vs odd bias"
              humanLabel="Human predictions"
              randomLabel="True random"
              humanValue={`${formatPercent(evenOdd.humanEven)} even / ${formatPercent(evenOdd.humanOdd)} odd`}
              randomValue={`${formatPercent(evenOdd.randomEven)} even / ${formatPercent(evenOdd.randomOdd)} odd`}
              description="Balanced selections hover around 50/50. Large swings can mean subconscious bias."
            />
            <ComparisonCard
              title="Prime number affinity"
              humanLabel="Human predictions"
              randomLabel="True random"
              humanValue={formatPercent(primeComposite.humanPrime)}
              randomValue={formatPercent(primeComposite.randomPrime)}
              description="There are 25 primes between 1 and 99 (~25%). Deviations hint at superstition."
            />
          </div>
        )}

        <OverlapTable rows={overlap} />

        <div className="grid two">
          <InsightsCard
            title="Pattern detection"
            highlights={patternHighlights}
            tone={patternHighlights.length > 1 ? "warning" : "info"}
          />
          <InsightsCard
            title="Reminder: randomness wins"
            highlights={[
              "No strategy beats randomness in the long run.",
              "Balanced picks give the fairest shot at rare high scores.",
              "Upcoming login system will let you track improvements over time."
            ]}
            tone="success"
          />
        </div>
      </section>
    </main>
  );
}
