import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalisedEmail = email.trim().toLowerCase();

    // Count games with this email but no user_id
    const { count: gameCount, error: gamesError } = await supabaseAdmin
      .from("game_runs")
      .select("id", { count: "exact", head: true })
      .eq("email", normalisedEmail)
      .is("user_id", null);

    if (gamesError) {
      throw gamesError;
    }

    // Check if leaderboard entry exists
    const { data: leaderboardEntry, error: leaderboardError } = await supabaseAdmin
      .from("leaderboard")
      .select("best_score, total_games_played")
      .eq("email", normalisedEmail)
      .is("user_id", null)
      .single();

    if (leaderboardError && leaderboardError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine
      throw leaderboardError;
    }

    return NextResponse.json({
      hasLegacyData: (gameCount ?? 0) > 0,
      gameCount: gameCount ?? 0,
      leaderboardEntry: leaderboardEntry || null,
    });
  } catch (error) {
    console.error("Failed to check legacy email", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}