import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

type RequestBody = {
  count?: number;
  min?: number;
  max?: number;
};

export async function POST(req: Request) {
  // Require authentication - only logged in users can generate random numbers
  try {
    await requireAuth();
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required to generate random numbers" },
      { status: 401 }
    );
  }

  const apiKey = process.env.RANDOM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing RANDOM_API_KEY environment variable" },
      { status: 500 }
    );
  }

  let body: RequestBody = {};

  try {
    body = (await req.json()) as RequestBody;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const count = body.count ?? 10;
  const min = body.min ?? 1;
  const max = body.max ?? 99;

  try {
    const response = await fetch("https://api.random.org/json-rpc/4/invoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "generateIntegers",
        params: {
          apiKey,
          n: count,
          min,
          max,
          replacement: false
        },
        id: Date.now()
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Random.org request failed: ${text}`);
    }

    const data = await response.json();

    if (!data.result || !data.result.random || !data.result.random.data) {
      throw new Error(data.error?.message || "Random.org responded with an error");
    }

    return NextResponse.json({ numbers: data.result.random.data });
  } catch (error) {
    console.error("Random.org API error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
