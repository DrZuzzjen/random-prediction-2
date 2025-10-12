import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { computeUserStats } from "@/lib/analytics";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const normalisedEmail = user.email?.trim().toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("game_runs")
      .select("id, created_at, user_id, user_name, email, predictions, random_numbers, score, game_type")
      .or(
        normalisedEmail
          ? `user_id.eq.${user.id},and(email.eq.${normalisedEmail},user_id.is.null)`
          : `user_id.eq.${user.id}`
      )
      .eq("game_type", "1-99_range_10_numbers")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const runs = data ?? [];
    const stats = computeUserStats(runs);

    return NextResponse.json({ runs, stats });
  } catch (error) {
    console.error("Failed to fetch user analytics", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
