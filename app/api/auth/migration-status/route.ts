import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const normalisedEmail = user.email.trim().toLowerCase();

    // Check if user has games that are already migrated (have user_id)
    const { count: migratedGameCount, error: migratedError } = await supabaseAdmin
      .from("game_runs")
      .select("id", { count: "exact", head: true })
      .eq("email", normalisedEmail)
      .eq("user_id", user.id);

    if (migratedError) {
      throw migratedError;
    }

    // Check if user has legacy games (no user_id)
    const { count: legacyGameCount, error: legacyError } = await supabaseAdmin
      .from("game_runs")
      .select("id", { count: "exact", head: true })
      .eq("email", normalisedEmail)
      .is("user_id", null);

    if (legacyError) {
      throw legacyError;
    }

    return NextResponse.json({
      migratedGames: migratedGameCount ?? 0,
      legacyGames: legacyGameCount ?? 0,
      needsMigration: (legacyGameCount ?? 0) > 0,
      alreadyMigrated: (migratedGameCount ?? 0) > 0
    });
  } catch (error) {
    console.error("Failed to check migration status", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}