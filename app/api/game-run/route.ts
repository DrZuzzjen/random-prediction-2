import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuth } from "@/lib/auth";

export type GameRunPayload = {
  name?: string;
  predictions: number[];
  randomNumbers: number[];
  score: number;
  gameType?: string;
};

export async function POST(req: Request) {
  // Get authenticated user (throws if not logged in)
  const user = await requireAuth();
  let payload: GameRunPayload;

  try {
    payload = (await req.json()) as GameRunPayload;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { name, predictions, randomNumbers, score, gameType = "1-99_range_10_numbers" } = payload;

  const computeName = (value: unknown) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const suppliedName = computeName(name);
  const metadataName = computeName(user.user_metadata?.name);
  const fallbackName =
    typeof user.email === "string" && user.email.includes("@")
      ? user.email.split("@")[0]
      : "Player";

  const displayName = suppliedName ?? metadataName ?? fallbackName;

  if (!user.email) {
    return NextResponse.json({ error: "Authenticated user is missing an email address" }, { status: 400 });
  }

  const normalisedEmail = user.email.trim().toLowerCase();

  if (!Array.isArray(predictions) || predictions.length !== 10) {
    return NextResponse.json({ error: "Ten predictions are required" }, { status: 400 });
  }

  if (!Array.isArray(randomNumbers) || randomNumbers.length !== 10) {
    return NextResponse.json({ error: "Ten random numbers are required" }, { status: 400 });
  }

  try {
    // Insert game run with user_id
    const { error: insertError } = await supabaseAdmin
      .from("game_runs")
      .insert({
        user_id: user.id,
        user_name: displayName,
        email: normalisedEmail,
        predictions,
        random_numbers: randomNumbers,
        score,
        game_type: gameType
      });

    if (insertError) {
      throw insertError;
    }

    // Update leaderboard using user_id
    const { data: existingEntries, error: selectError } = await supabaseAdmin
      .from("leaderboard")
      .select("id, best_score, total_games_played")
      .eq("user_id", user.id)  // NEW: Use user_id instead of email
      .eq("game_type", gameType)
      .limit(1);

    if (selectError) {
      throw selectError;
    }

    let newHighScore = false;
    let leaderboardEntry = existingEntries?.[0];

    if (!leaderboardEntry) {
      const { data: legacyEntries, error: legacyError } = await supabaseAdmin
        .from("leaderboard")
        .select("id, best_score, total_games_played")
        .eq("email", normalisedEmail)
        .is("user_id", null)
        .eq("game_type", gameType)
        .limit(1);

      if (legacyError) {
        throw legacyError;
      }

      leaderboardEntry = legacyEntries?.[0] ?? null;
    }

    if (leaderboardEntry) {
      const updatedBest = score > leaderboardEntry.best_score ? score : leaderboardEntry.best_score;
      newHighScore = score > leaderboardEntry.best_score;
      const { error: updateError, data: updatedData } = await supabaseAdmin
        .from("leaderboard")
        .update({
          name: displayName,
          best_score: updatedBest,
          total_games_played: (leaderboardEntry.total_games_played || 0) + 1,
          user_id: user.id,
          email: normalisedEmail
        })
        .eq("id", leaderboardEntry.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        newHighScore,
        leaderboardEntry: updatedData
      });
    }

    const { data: insertedLeaderboard, error: leaderboardInsertError } = await supabaseAdmin
      .from("leaderboard")
      .insert({
        user_id: user.id,
        name: displayName,
        email: normalisedEmail,
        best_score: score,
        total_games_played: 1,
        game_type: gameType
      })
      .select("*")
      .single();

    if (leaderboardInsertError) {
      throw leaderboardInsertError;
    }

    return NextResponse.json({
      success: true,
      newHighScore: true,
      leaderboardEntry: insertedLeaderboard
    });
  } catch (error) {
    console.error("Failed to persist game run", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
