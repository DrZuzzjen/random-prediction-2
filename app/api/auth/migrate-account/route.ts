import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  try {
    // Try to get the authenticated user with better error handling
    let user;
    try {
      user = await requireAuth();
    } catch (authError) {
      console.error("Auth error in migration:", authError);
      return NextResponse.json({ 
        error: "User not authenticated yet. Please try again in a moment." 
      }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: "Authenticated user is missing an email address" }, { status: 400 });
    }

    const normalisedEmail = user.email.trim().toLowerCase();

    const { data: legacyGames, error: gamesError } = await supabaseAdmin
      .from("game_runs")
      .select("id")
      .eq("email", normalisedEmail)
      .is("user_id", null);

    if (gamesError) {
      throw gamesError;
    }

    if (legacyGames && legacyGames.length > 0) {
      const { error: updateRunsError } = await supabaseAdmin
        .from("game_runs")
        .update({ user_id: user.id })
        .eq("email", normalisedEmail)
        .is("user_id", null);

      if (updateRunsError) {
        throw updateRunsError;
      }
    }

    const { error: updateLeaderboardError } = await supabaseAdmin
      .from("leaderboard")
      .update({ user_id: user.id })
      .eq("email", normalisedEmail)
      .is("user_id", null);

    if (updateLeaderboardError) {
      throw updateLeaderboardError;
    }

    return NextResponse.json({
      success: true,
      migratedGames: legacyGames?.length ?? 0,
    });
  } catch (error) {
    console.error("Migration failed", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}
