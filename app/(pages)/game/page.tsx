"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NumberDial from "@/app/components/NumberDial";
import SelectedNumbers from "@/app/components/SelectedNumbers";
import LeaderboardPanel from "@/app/components/LeaderboardPanel";
import MigrationBanner from "@/app/components/MigrationBanner";
import { useAuth } from "@/app/components/AuthProvider";
import {
  calculateMatches,
  calculateScore,
  isValidPredictionSet,
  toDisplayList
} from "@/lib/utils/game";

type Phase = "select" | "details" | "results";

type LeaderboardEntry = {
  name: string;
  email?: string;
  best_score: number;
  total_games_played: number;
};

type LeaderboardResponse = {
  entries: LeaderboardEntry[];
};

type StatusMessage = {
  tone: "info" | "error" | "success";
  text: string;
};

const MAX_SELECTION = 10;

export default function GamePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Leaderboard request failed");
        }
        const payload = (await response.json()) as LeaderboardResponse;
        setLeaderboard(payload.entries);
      } catch (error) {
        console.error(error);
      }
    };

    loadLeaderboard();
  }, []);

  const hasCompleteSelection = useMemo(
    () => isValidPredictionSet(selectedNumbers),
    [selectedNumbers]
  );

  const matches = useMemo(
    () => calculateMatches(selectedNumbers, randomNumbers),
    [selectedNumbers, randomNumbers]
  );

  const handleNumberLocked = (number: number) => {
    setStatusMessage(null);
    setSelectedNumbers((prev) => {
      if (prev.includes(number)) {
        setStatusMessage({ tone: "error", text: `${number} is already locked in. Try another spin!` });
        return prev;
      }

      if (prev.length >= MAX_SELECTION) {
        setStatusMessage({ tone: "error", text: "You already have 10 numbers locked in." });
        return prev;
      }

      return [...prev, number];
    });
  };

  const handleRemoveNumber = (value: number) => {
    setSelectedNumbers((prev) => prev.filter((num) => num !== value));
    setStatusMessage({ tone: "info", text: `Removed ${value.toString().padStart(2, "0")}. Spin again!` });
  };

  const resetGame = () => {
    setPhase("select");
    setSelectedNumbers([]);
    setRandomNumbers([]);
    setScore(0);
    setStatusMessage(null);
    setNewHighScore(false);
  };

  const generateRandomNumbers = async () => {
    if (!hasCompleteSelection) {
      setStatusMessage({ tone: "error", text: "Lock in 10 unique numbers before playing." });
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/random", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10, min: 1, max: 99 })
      });

      if (!response.ok) {
        throw new Error("Failed to reach Random.org");
      }

      const payload = (await response.json()) as { numbers: number[] };
      setRandomNumbers(payload.numbers);
      const computedScore = calculateScore(selectedNumbers, payload.numbers);
      setScore(computedScore);
      setPhase("details");
      setStatusMessage({
        tone: "info",
        text: "Numbers are ready! Save this run to your account to reveal the results.",
      });
    } catch (error) {
      console.error(error);
      setStatusMessage({
        tone: "error",
        text: "We could not fetch random numbers. Check your API key and network connection."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDisplayName = () => {
    const metadataName =
      typeof user?.user_metadata?.name === "string" ? user.user_metadata.name.trim() : "";
    if (metadataName) {
      return metadataName;
    }
    if (typeof user?.email === "string") {
      const [localPart] = user.email.split("@");
      return localPart || "Player";
    }
    return "Player";
  };

  const persistGameRun = async () => {
    if (!user) {
      setStatusMessage({ tone: "error", text: "You need to be logged in to save your game." });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/game-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: getDisplayName(),
          predictions: selectedNumbers,
          randomNumbers,
          score,
        })
      });

      const payload = (await response.json()) as {
        success?: boolean;
        newHighScore?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Could not save your game run");
      }

      const highScore = Boolean(payload.newHighScore);
      setNewHighScore(highScore);
      setPhase("results");
      setStatusMessage({ tone: "success", text: highScore ? "New high score!" : "Run saved." });

      // Refresh leaderboard quietly
      try {
        const leaderboardResponse = await fetch("/api/leaderboard", { cache: "no-store" });
        if (leaderboardResponse.ok) {
          const leaderboardPayload = (await leaderboardResponse.json()) as LeaderboardResponse;
          setLeaderboard(leaderboardPayload.entries);
        }
      } catch (err) {
        console.warn("Failed to refresh leaderboard", err);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not save your game run."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const statusColor = statusMessage?.tone === "error"
    ? "rgba(248, 113, 113, 0.85)"
    : statusMessage?.tone === "success"
    ? "rgba(16, 185, 129, 0.9)"
    : "rgba(148, 163, 184, 0.85)";

  return (
    <main>
      <section className="container" style={{ padding: "48px 0", display: "grid", gap: "28px" }}>
        <MigrationBanner />
        <header className="card" style={{ display: "grid", gap: "16px" }}>
          <div className="phase-tag">🎯 Random Prediction Experience</div>
          <h1 className="hero-title">
            Predict <span className="hero-highlight">10 numbers</span> then face a true random dial.
          </h1>
          <p style={{ maxWidth: 620, color: "rgba(148, 163, 184, 0.85)", marginTop: 0 }}>
            Spin the snipping wheel, trust your gut, and lock in the digits you feel most confident about.
            Random.org will generate unbiased numbers. Compare, rank up the leaderboard, and analyse how
            human intuition fares against true randomness.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div className="tag">🔐 Secured with Supabase Auth</div>
            <div className="tag">🧠 Analytics powered by Supabase</div>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 340px)",
            alignItems: "start"
          }}
        >
          <section className="card" style={{ display: "grid", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="tag">{phase === "select" ? "Step 1" : phase === "details" ? "Step 2" : "Results"}</div>
                <h2 style={{ margin: "12px 0" }}>
                  {phase === "select" && "Spin the dial and lock 10 numbers"}
                  {phase === "details" && "Who played? Save the run to reveal"}
                  {phase === "results" && "Here is how your intuition performed"}
                </h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "rgba(148, 163, 184, 0.75)" }}>
                  Locked numbers
                </div>
                <strong style={{ fontSize: "1.5rem" }}>{selectedNumbers.length}/10</strong>
              </div>
            </div>

            {statusMessage && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: `1px solid ${statusColor}`,
                  background: "rgba(15, 23, 42, 0.75)",
                  color: statusColor
                }}
              >
                {statusMessage.text}
              </div>
            )}

            {phase === "select" && (
              <div style={{ display: "grid", gap: "24px" }}>
                <NumberDial
                  onSelect={handleNumberLocked}
                  disabled={selectedNumbers.length >= MAX_SELECTION || isGenerating}
                  highlightNumbers={selectedNumbers}
                />
                <SelectedNumbers numbers={selectedNumbers} onRemove={handleRemoveNumber} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button
                    className="primary-button"
                    onClick={generateRandomNumbers}
                    disabled={!hasCompleteSelection || isGenerating}
                  >
                    {isGenerating ? "Contacting Random.org..." : "Generate True Random Numbers"}
                  </button>
                  <button className="secondary-button" onClick={resetGame} disabled={isGenerating}>
                    Reset picks
                  </button>
                </div>
              </div>
            )}

            {phase === "details" && (
              <div style={{ display: "grid", gap: 24 }}>
                <div className="card" style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px dashed rgba(148, 163, 184, 0.4)" }}>
                  <h3 style={{ marginTop: 0 }}>We have the results ready!</h3>
                  <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
                    Your results are being saved to your account. Click below to reveal your score!
                  </p>
                  <p style={{ color: "rgba(148, 163, 184, 0.75)" }}>
                    Selected numbers: <strong>{toDisplayList(selectedNumbers)}</strong>
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={persistGameRun}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving to Supabase..." : "Reveal my results"}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={resetGame}
                    disabled={isSaving}
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

            {phase === "results" && (
              <div style={{ display: "grid", gap: 24 }}>
                <div className="card" style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(56, 189, 248, 0.4)" }}>
                  <h3 style={{ marginTop: 0 }}>
                    {score >= 8 && "🎉 Incredible intuition!"}
                    {score >= 5 && score < 8 && "🎯 Stellar run!"}
                    {score >= 2 && score < 5 && "🎲 Nice effort!"}
                    {score < 2 && "🍀 Keep chasing chance!"}
                  </h3>
                  <p style={{ fontSize: "1.8rem", margin: "8px 0" }}>
                    Score: <strong>{score}/10</strong>
                  </p>
                  <p style={{ color: "rgba(148, 163, 184, 0.8)" }}>
                    {newHighScore
                      ? "You just set a new high score. Your future self will try to beat it!"
                      : "We saved this run. Compare it with your upcoming games."}
                  </p>
                </div>
                <div className="grid two">
                  <div className="card" style={{ background: "rgba(15, 23, 42, 0.6)" }}>
                    <h4 style={{ marginTop: 0 }}>Your predictions</h4>
                    <code style={{ display: "block", fontSize: "1.1rem" }}>{toDisplayList(selectedNumbers)}</code>
                    <p style={{ color: "rgba(148, 163, 184, 0.75)" }}>
                      Matches: {matches.length > 0 ? matches.join(", ") : "None this time"}
                    </p>
                  </div>
                  <div className="card" style={{ background: "rgba(15, 23, 42, 0.6)" }}>
                    <h4 style={{ marginTop: 0 }}>Random.org numbers</h4>
                    <code style={{ display: "block", fontSize: "1.1rem" }}>{toDisplayList(randomNumbers)}</code>
                    <p style={{ color: "rgba(148, 163, 184, 0.75)" }}>
                      The odds of a perfect 10/10: 1 in 9×10¹⁹
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="primary-button" onClick={resetGame}>
                    Play again
                  </button>
                  <button className="secondary-button" onClick={() => router.push("/analytics") }>
                    Explore global analytics
                  </button>
                  <button className="secondary-button" onClick={() => router.push("/my-analytics") }>
                    View my personal stats
                  </button>
                </div>
              </div>
            )}
          </section>

          <LeaderboardPanel entries={leaderboard} />
        </div>
      </section>
    </main>
  );
}
