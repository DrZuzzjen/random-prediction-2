import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await getServerSession();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: Boolean(user.email_confirmed_at),
      },
    });
  } catch (error) {
    console.error("Failed to get session", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}
