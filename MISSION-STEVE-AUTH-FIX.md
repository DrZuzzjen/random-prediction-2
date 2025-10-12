# 🎯 STEVE: Fix Login Redirect - Official Supabase Pattern

**Issue**: Login succeeds but redirect fails - middleware doesn't see session
**Root Cause**: Using deprecated/wrong client pattern for auth
**Solution**: Follow official Supabase + Next.js 14 App Router pattern

---

## 📚 OFFICIAL SUPABASE PATTERN (2025)

According to official Supabase docs, the CORRECT way is:

**Use Server Actions for login, NOT client-side auth**

---

## 🛠️ IMPLEMENTATION

### **STEP 1: Create Server Action for Login**

**File**: `app/(auth)/login/actions.ts` (NEW FILE)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/game')
}
```

---

### **STEP 2: Create Server-Side Supabase Client**

**File**: `lib/supabaseServer.ts` (NEW FILE)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component - can't set cookies
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component - can't remove cookies
          }
        },
      },
    }
  )
}
```

---

### **STEP 3: Update Login Page to Use Server Action**

**File**: `app/(auth)/login/page.tsx`

```typescript
import { login } from './actions'
import LoginForm from '@/app/components/AuthForms/LoginForm'

export default function LoginPage() {
  return (
    <div className="card" style={{ padding: 32 }}>
      <LoginForm loginAction={login} />
    </div>
  )
}
```

---

### **STEP 4: Update LoginForm Component**

**File**: `app/components/AuthForms/LoginForm.tsx`

```typescript
"use client";

import { useState } from "react";

type LoginFormProps = {
  loginAction: (formData: FormData) => Promise<{ error?: string } | void>;
};

export default function LoginForm({ loginAction }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // Success case: server action will redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setIsLoading(false);
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
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
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

---

### **STEP 5: Update Middleware** (Already mostly correct)

**File**: `middleware.ts`

Make sure it's using the SSR package properly:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session
  await supabase.auth.getSession()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/game', '/my-analytics']
  const isProtectedRoute = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth routes
  const authPaths = ['/login', '/register']
  const isAuthRoute = authPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isAuthRoute && session) {
    const redirectTo = req.nextUrl.searchParams.get('redirect')
    if (redirectTo && redirectTo !== '/login' && redirectTo !== '/register') {
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
    return NextResponse.redirect(new URL('/game', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## ✅ WHY THIS WORKS

1. **Server Actions** run on the server - cookies are set properly
2. **`revalidatePath('/', 'layout')`** forces Next.js to refresh cached data
3. **`redirect('/game')`** happens AFTER cookies are set
4. **Middleware sees the session** because it's already in cookies

## 🚫 WHY THE OLD WAY FAILED

- Client-side `supabase.auth.signInWithPassword()` sets cookies async
- `router.push()` happens before cookies are readable by middleware
- Middleware redirects back to login = infinite loop

---

## 📝 COMMIT SEQUENCE

```bash
# 1. Create server-side client
git add lib/supabaseServer.ts
git commit -m "feat(auth): add server-side Supabase client"

# 2. Create login server action
git add app/(auth)/login/actions.ts
git commit -m "feat(auth): add server action for login"

# 3. Update login page and form
git add app/(auth)/login/page.tsx app/components/AuthForms/LoginForm.tsx
git commit -m "feat(auth): migrate login to server actions pattern"

# 4. Update middleware
git add middleware.ts
git commit -m "fix(auth): update middleware to properly handle SSR cookies"
```

---

## 🎯 THIS IS THE OFFICIAL SUPABASE PATTERN

Source: https://supabase.com/docs/guides/auth/server-side/nextjs

**No hacks. No workarounds. Just the documented way.** ✅
