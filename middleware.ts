import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./lib/database.types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedPaths = ["/game", "/my-analytics"];
  const authPaths = ["/login", "/register"];

  const isProtectedRoute = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
  const isAuthRoute = authPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/game", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
