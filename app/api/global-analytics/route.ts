import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildFrequencies,
  bucketizeFrequency,
  calculateEvenOdd,
  calculatePrimeUsage,
  calculateSpecialPatterns,
  computeOverlap,
  summariseGlobalStats
} from "@/lib/analytics";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("game_runs")
      .select("id, created_at, user_id, user_name, email, predictions, random_numbers, score, game_type")
      .eq("game_type", "1-99_range_10_numbers")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const runs = data ?? [];
    const stats = summariseGlobalStats(runs);
    const frequencies = buildFrequencies(runs);
    const predictionRanges = bucketizeFrequency(frequencies.predictions);
    const randomRanges = bucketizeFrequency(frequencies.random);
    const predictionEvenOdd = calculateEvenOdd(frequencies.predictions);
    const randomEvenOdd = calculateEvenOdd(frequencies.random);
    const predictionPrimeUsage = calculatePrimeUsage(frequencies.predictions);
    const randomPrimeUsage = calculatePrimeUsage(frequencies.random);
    const specialPatterns = calculateSpecialPatterns(frequencies.predictions);
    const overlap = computeOverlap(frequencies.predictions, frequencies.random).slice(0, 15);

    return NextResponse.json({
      stats,
      frequencies,
      predictionRanges,
      randomRanges,
      predictionEvenOdd,
      randomEvenOdd,
      predictionPrimeUsage,
      randomPrimeUsage,
      specialPatterns,
      overlap
    });
  } catch (error) {
    console.error("Failed to fetch global analytics", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
