"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (user) return;

    const redirect = searchParams?.get("redirect") ?? window.location.pathname;
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [loading, user, router, searchParams]);

  if (loading) {
    return fallback ?? <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
