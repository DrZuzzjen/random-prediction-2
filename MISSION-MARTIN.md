# 🎨 MARTIN'S MISSION: Frontend & User Experience

**Project**: Random Prediction Game - Production Auth System
**Your Role**: Frontend Engineer
**Branch**: `feature/auth-system`
**Timeline**: 2-3 days (parallel with Steve)
**Product Owner**: Claude (monitoring via commits)

---

## 🤝 COORDINATION WITH STEVE

Steve is building the backend auth infrastructure **on the same branch**. You two are working in parallel.

**Communication Protocol**:
- Commit every 30-60 minutes with descriptive messages
- Run `git status` and `git log` regularly to see what Steve's done
- Your work depends on his - you need his API routes and utilities
- His work enables yours - he's building the foundation you'll use

**Critical Dependencies**:
1. **WAIT FOR**: `lib/supabaseClient.ts` (you import this!)
2. **WAIT FOR**: `lib/authTypes.ts` (you import types from here!)
3. **WAIT FOR**: `lib/auth.ts` (you use these helpers)
4. **START INDEPENDENTLY**: UI components, layouts (no auth logic yet)

**Check Steve's Progress**:
```bash
git log --oneline -10  # See his recent commits
git diff main -- lib/   # See what he's built in lib/
```

---

## 📦 YOUR DELIVERABLES

### **Authentication Pages**
- [ ] `app/(auth)/login/page.tsx` - Login page
- [ ] `app/(auth)/register/page.tsx` - Registration page
- [ ] `app/(auth)/forgot-password/page.tsx` - Password reset
- [ ] `app/(auth)/layout.tsx` - Auth pages layout

### **Components**
- [ ] `app/components/AuthProvider.tsx` - Session context provider
- [ ] `app/components/AuthGuard.tsx` - Protected route wrapper
- [ ] `app/components/UserMenu.tsx` - User dropdown (logout, profile)
- [ ] `app/components/AuthForms/LoginForm.tsx` - Login form component
- [ ] `app/components/AuthForms/RegisterForm.tsx` - Register form component

### **Route Protection**
- [ ] `middleware.ts` - Protect routes requiring auth
- [ ] Update `app/(pages)/game/page.tsx` - Remove manual email input
- [ ] Update `app/(pages)/my-analytics/page.tsx` - Use authenticated session
- [ ] Update `app/layout.tsx` - Add AuthProvider wrapper

### **User Experience**
- [ ] Loading states for auth actions
- [ ] Error handling with friendly messages
- [ ] Success confirmations
- [ ] Redirect flows after login/signup
- [ ] Email verification prompts

---

## 🚀 PHASE-BY-PHASE IMPLEMENTATION

### **PHASE 1: Independent UI Work (Start Immediately - 2 hours)**

You can build auth UI layouts **before Steve finishes**, just don't wire up the logic yet.

#### **File 1: `app/(auth)/layout.tsx`**

Auth pages share a centered layout

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Random Prediction",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {children}
      </div>
    </main>
  );
}
```

**Commit**: `feat(auth): create auth pages layout`

---

#### **File 2: `app/components/AuthForms/LoginForm.tsx`**

Build the UI first, wire logic later

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
};

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Welcome back</h2>
        <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)" }}>
          Log in to continue predicting numbers
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(248, 113, 113, 0.5)",
            background: "rgba(248, 113, 113, 0.1)",
            color: "rgba(248, 113, 113, 0.9)",
          }}
        >
          {error}
        </div>
      )}

      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <button
        type="submit"
        className="primary-button"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>

      <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
        <a href="/forgot-password" style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          Forgot password?
        </a>
        {" · "}
        <a href="/register" style={{ color: "rgba(56, 189, 248, 0.9)" }}>
          Create account
        </a>
      </div>
    </form>
  );
}
```

**Commit**: `feat(auth): create login form component`

---

#### **File 3: `app/components/AuthForms/RegisterForm.tsx`**

```typescript
"use client";

import { useState } from "react";

type RegisterFormProps = {
  onSubmit: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
};

export default function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await onSubmit(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Create your account</h2>
        <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)" }}>
          Start tracking your predictions and compete on the leaderboard
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(248, 113, 113, 0.5)",
            background: "rgba(248, 113, 113, 0.1)",
            color: "rgba(248, 113, 113, 0.9)",
          }}
        >
          {error}
        </div>
      )}

      <label style={{ display: "grid", gap: 6 }}>
        <span>Name</span>
        <input
          type="text"
          required
          maxLength={50}
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Confirm password</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <button
        type="submit"
        className="primary-button"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "rgba(56, 189, 248, 0.9)" }}>
          Log in
        </a>
      </div>
    </form>
  );
}
```

**Commit**: `feat(auth): create register form component`

---

### **PHASE 2: Wait for Steve's Foundation (Checkpoint)**

**STOP HERE** until Steve commits `lib/supabaseClient.ts` and `lib/authTypes.ts`

**Check if ready**:
```bash
git pull  # Get Steve's latest
ls lib/supabaseClient.ts lib/authTypes.ts  # Should exist
```

**Once ready, proceed to Phase 3**

---

### **PHASE 3: Auth Provider & Session Management (2 hours)**

Now you can wire up auth logic using Steve's infrastructure

#### **File 4: `app/components/AuthProvider.tsx`**

Context provider for user session

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AuthUser } from "@/lib/authTypes";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as AuthUser || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as AuthUser || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Commit**: `feat(auth): create auth provider and session context`

---

#### **File 5: `app/components/UserMenu.tsx`**

User dropdown in navigation

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <div style={{ display: "flex", gap: 12 }}>
        <a href="/login" className="secondary-button">
          Log in
        </a>
        <a href="/register" className="primary-button">
          Sign up
        </a>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="secondary-button"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <span>👤</span>
        <span>{user.email}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12,
            padding: 8,
            zIndex: 100,
          }}
        >
          <a
            href="/my-analytics"
            style={{
              display: "block",
              padding: "8px 12px",
              borderRadius: 8,
              color: "rgba(148, 163, 184, 0.9)",
            }}
          >
            My Analytics
          </a>
          <button
            onClick={handleSignOut}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "rgba(248, 113, 113, 0.9)",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

**Commit**: `feat(auth): create user menu component`

---

#### **File 6: Update `app/layout.tsx`**

Wrap app with AuthProvider

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import UserMenu from "./components/UserMenu";

export const metadata: Metadata = {
  title: "Random Prediction Game",
  description: "Predict numbers, track analytics, and compete on the leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <a href="/" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              🎯 Random Prediction
            </a>
            <UserMenu />
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Commit**: `feat(auth): add auth provider to root layout`

---

### **PHASE 4: Auth Pages (2 hours)**

#### **File 7: `app/(auth)/login/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoginForm from "@/app/components/AuthForms/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to game
      router.push("/game");
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className="card" style={{ padding: 32 }}>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Commit**: `feat(auth): create login page`

---

#### **File 8: `app/(auth)/register/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import RegisterForm from "@/app/components/AuthForms/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,  // Store name in user metadata
          },
          emailRedirectTo: `${window.location.origin}/game`,
        },
      });

      if (error) throw error;

      // Show email confirmation message
      setCheckEmail(true);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  if (checkEmail) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: "center" }}>
          <h2>Check your email</h2>
          <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
            We sent you a confirmation link. Click it to verify your account and start playing!
          </p>
          <a href="/login" className="primary-button" style={{ marginTop: 24, display: "inline-block" }}>
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32 }}>
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </div>
  );
}
```

**Commit**: `feat(auth): create register page with email confirmation`

---

#### **File 9: `app/(auth)/forgot-password/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <h2>Check your email</h2>
        <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
          We sent password reset instructions to <strong>{email}</strong>
        </p>
        <a href="/login" className="secondary-button" style={{ marginTop: 24, display: "inline-block" }}>
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32 }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Reset your password</h2>
          <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)" }}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {error && (
          <div style={{ color: "rgba(248, 113, 113, 0.9)" }}>{error}</div>
        )}

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </label>

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </button>

        <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
          <a href="/login" style={{ color: "rgba(148, 163, 184, 0.85)" }}>
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}
```

**Commit**: `feat(auth): create forgot password page`

---

### **PHASE 5: Route Protection (1 hour)**

#### **File 10: `middleware.ts`** (root level)

Protect routes that require authentication

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes - require authentication
  const protectedPaths = ['/game', '/my-analytics'];
  const isProtectedRoute = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth routes - redirect if already logged in
  const authPaths = ['/login', '/register'];
  const isAuthRoute = authPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isAuthRoute && session) {
    // Already logged in, redirect to game
    return NextResponse.redirect(new URL('/game', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Install auth helpers**:
```bash
npm install @supabase/auth-helpers-nextjs
```

**Commit**: `feat(auth): add middleware for route protection`

---

### **PHASE 6: Update Game Page (1 hour)**

#### **File 11: Update `app/(pages)/game/page.tsx`**

Remove manual name/email input, use authenticated user

**Find this section** (around line 294-341):
```typescript
{phase === "details" && (
  // OLD: Manual form
)}
```

**Replace with**:
```typescript
{phase === "details" && (
  <div style={{ display: "grid", gap: 24 }}>
    <div className="card" style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px dashed rgba(148, 163, 184, 0.4)" }}>
      <h3 style={{ marginTop: 0 }}>We have the results ready!</h3>
      <p style={{ color: "rgba(148, 163, 184, 0.85)" }}>
        Your results are being saved to your account. Click below to reveal your score!
      </p>
      <p style={{ color: "rgba(148, 163, 184, 0.75)" }}>
        Selected numbers: <strong>{toDisplayList(selectedNumbers)}</strong>
      </p>
    </div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button
        className="primary-button"
        onClick={persistGameRun}
        disabled={isSaving}
      >
        {isSaving ? "Saving to Supabase..." : "Reveal my results"}
      </button>
      <button
        className="secondary-button"
        type="button"
        onClick={resetGame}
        disabled={isSaving}
      >
        Start over
      </button>
    </div>
  </div>
)}
```

**Update `persistGameRun` function** (remove form event, remove identity checks):
```typescript
const persistGameRun = async () => {
  setIsSaving(true);
  setStatusMessage(null);

  try {
    const response = await fetch("/api/game-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Player',
        predictions: selectedNumbers,
        randomNumbers,
        score
      })
    });

    // ... rest stays the same
  } catch (error) {
    // ... error handling
  } finally {
    setIsSaving(false);
  }
};
```

**Add useAuth at top**:
```typescript
import { useAuth } from "@/app/components/AuthProvider";

export default function GamePage() {
  const { user } = useAuth();
  // ... rest of component
```

**Remove useSavedIdentity hook**:
```typescript
// DELETE THIS LINE:
const identity = useSavedIdentity();
```

**Commit**: `feat(game): remove manual email input, use authenticated user`

---

### **PHASE 7: Update My Analytics Page (30 min)**

#### **File 12: Update `app/(pages)/my-analytics/page.tsx`**

Remove email form, auto-load for authenticated user

**Replace entire component**:
```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/app/components/StatCard";
import Sparkline from "@/app/components/Sparkline";
import { useAuth } from "@/app/components/AuthProvider";
import { toDisplayList } from "@/lib/utils/game";
import type { GameRun } from "@/lib/types";

type FavoriteNumber = { number: number; count: number };

type UserAnalyticsResponse = {
  runs: GameRun[];
  stats: {
    totalGames: number;
    bestScore: number;
    avgScore: number;
    latestScore: number;
    firstGame: string | null;
    gamesLastWeek: number;
    scoreTrend: number[];
    favoriteNumbers: FavoriteNumber[];
  } | null;
  error?: string;
};

export default function MyAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadAnalytics();
    }
  }, [authLoading, user]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-analytics', {
        cache: "no-store"
      });
      const payload = await response.json() as UserAnalyticsResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load analytics");
      }

      setData(payload);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats ?? null;
  const runs = data?.runs ?? [];

  const trendMax = useMemo(() => (stats ? Math.max(...stats.scoreTrend, 10) : 10), [stats]);

  if (authLoading || loading) {
    return (
      <main>
        <section className="container" style={{ padding: "48px 0" }}>
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            Loading your analytics...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container" style={{ padding: "48px 0", display: "grid", gap: 24 }}>
        <header className="card" style={{ display: "grid", gap: 12 }}>
          <div className="tag">👤 Personal analytics</div>
          <h1 style={{ margin: 0 }}>Track your intuition over time</h1>
          <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.85)", maxWidth: 720 }}>
            All your game history and stats, securely stored in Supabase and linked to your account.
          </p>
        </header>

        {error && (
          <div className="card" style={{ padding: 24, color: "rgba(248, 113, 113, 0.9)" }}>
            {error}
          </div>
        )}

        {!stats && !loading && data && (
          <div className="card" style={{ padding: 24, color: "rgba(148, 163, 184, 0.85)" }}>
            No games found yet. Play a round to start tracking your progress!
          </div>
        )}

        {stats && (
          // ... rest of analytics display stays the same
        )}
      </section>
    </main>
  );
}
```

**Commit**: `feat(analytics): use authenticated session instead of email lookup`

---

### **PHASE 8: Account Migration UX (1 hour)**

#### **File 13: `app/components/MigrationBanner.tsx`**

Shows users with old games they can claim them

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function MigrationBanner() {
  const { user } = useAuth();
  const [migrated, setMigrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameCount, setGameCount] = useState<number | null>(null);

  if (!user || migrated) return null;

  const handleMigrate = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/migrate-account", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setGameCount(data.migratedGames);
      setMigrated(true);
    } catch (error) {
      console.error("Migration failed:", error);
      alert("Failed to migrate account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (gameCount !== null && migrated) {
    return (
      <div
        className="card"
        style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          padding: 16,
          marginBottom: 24,
        }}
      >
        <strong>✅ Account linked!</strong> We found and linked {gameCount} previous games to your account.
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        padding: 16,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <strong>Welcome back!</strong> We found games played with this email before you created an account.
      </div>
      <button
        className="primary-button"
        onClick={handleMigrate}
        disabled={loading}
        style={{ whiteSpace: "nowrap" }}
      >
        {loading ? "Linking..." : "Link old games"}
      </button>
    </div>
  );
}
```

**Add to game page** (top of game section):
```typescript
import MigrationBanner from "@/app/components/MigrationBanner";

// Inside GamePage component, after opening <section>:
<MigrationBanner />
```

**Commit**: `feat(migration): add banner to link old games to new accounts`

---

## ✅ DEFINITION OF DONE

### **Your work is complete when**:
- [ ] Login page works and redirects to game
- [ ] Register page creates accounts with email confirmation
- [ ] Forgot password flow sends reset emails
- [ ] AuthProvider wraps the app and manages sessions
- [ ] UserMenu shows logged-in user with logout
- [ ] Middleware protects /game and /my-analytics
- [ ] Game page doesn't ask for email anymore
- [ ] My Analytics auto-loads for logged-in user
- [ ] Migration banner helps link old games
- [ ] All UI components match existing design system

### **How Steve knows you're done**:
- He can test full auth flow: register → confirm email → login → play game
- No email input forms exist in game flow
- Protected routes redirect to login when not authenticated
- User sees their name/email in navigation

---

## 🚨 CRITICAL REMINDERS

1. **WAIT FOR STEVE'S LIB FILES** - Don't start auth logic until he commits supabaseClient
2. **COMMIT OFTEN** - Every 30-60 minutes so Steve can see progress
3. **READ STEVE'S COMMITS** - Run `git log` to see backend updates
4. **TEST LOCALLY** - Run `npm run dev` and test every component
5. **MATCH DESIGN SYSTEM** - Use existing CSS classes and styles
6. **ASK CLAUDE VIA COMMITS** - If blocked, commit with `WIP: blocked on X`

---

## 📞 HANDOFF FROM STEVE

**You can start Phase 3** once Steve has committed:
- `lib/supabaseClient.ts` ✅
- `lib/authTypes.ts` ✅
- `lib/auth.ts` ✅

**Check his progress**:
```bash
git pull
git log --oneline -5
```

---

## 🎯 SUCCESS METRICS

You'll know you crushed it when:
- ✅ New users register, confirm email, and play seamlessly
- ✅ No manual email input exists in the game flow
- ✅ Protected pages redirect unauthenticated users to login
- ✅ User menu shows current user and allows logout
- ✅ Old games can be claimed via migration banner
- ✅ All forms have proper loading/error states
- ✅ Design feels cohesive with existing app

---

**Ready to ship, Martin? Let's build the slickest auth UX. Commit early, commit often. Claude is watching. 🎨**
