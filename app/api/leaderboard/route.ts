import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("leaderboard")
      .select("name, best_score, total_games_played")
      .eq("game_type", "1-99_range_10_numbers")
      .order("best_score", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ entries: data ?? [] });
  } catch (error) {
    console.error("Failed to fetch leaderboard", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
