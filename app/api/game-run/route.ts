import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type GameRunPayload = {
  name: string;
  email: string;
  predictions: number[];
  randomNumbers: number[];
  score: number;
  gameType?: string;
};

export async function POST(req: Request) {
  let payload: GameRunPayload;

  try {
    payload = (await req.json()) as GameRunPayload;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    name,
    email,
    predictions,
    randomNumbers,
    score,
    gameType = "1-99_range_10_numbers"
  } = payload;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!Array.isArray(predictions) || predictions.length !== 10) {
    return NextResponse.json({ error: "Ten predictions are required" }, { status: 400 });
  }

  if (!Array.isArray(randomNumbers) || randomNumbers.length !== 10) {
    return NextResponse.json({ error: "Ten random numbers are required" }, { status: 400 });
  }

  const normalisedEmail = email.trim().toLowerCase();

  try {
    const { error: insertError } = await supabaseAdmin
      .from("game_runs")
      .insert({
        user_name: name.trim(),
        email: normalisedEmail,
        predictions,
        random_numbers: randomNumbers,
        score,
        game_type: gameType
      });

    if (insertError) {
      throw insertError;
    }

    const { data: existingEntries, error: selectError } = await supabaseAdmin
      .from("leaderboard")
      .select("id, best_score, total_games_played")
      .eq("email", normalisedEmail)
      .eq("game_type", gameType)
      .limit(1);

    if (selectError) {
      throw selectError;
    }

    let newHighScore = false;

    if (existingEntries && existingEntries.length > 0) {
      const entry = existingEntries[0];
      const updatedBest = score > entry.best_score ? score : entry.best_score;
      newHighScore = score > entry.best_score;
      const { error: updateError, data: updatedData } = await supabaseAdmin
        .from("leaderboard")
        .update({
          name: name.trim(),
          best_score: updatedBest,
          total_games_played: (entry.total_games_played || 0) + 1
        })
        .eq("id", entry.id)
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
        name: name.trim(),
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
