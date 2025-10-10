import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { computeUserStats } from "@/lib/analytics";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  try {
    const normalisedEmail = email.trim().toLowerCase();
    const { data, error } = await supabaseAdmin
      .from("game_runs")
      .select("id, created_at, user_name, email, predictions, random_numbers, score, game_type")
      .eq("email", normalisedEmail)
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
