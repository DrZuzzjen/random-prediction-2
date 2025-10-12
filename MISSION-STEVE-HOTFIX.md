# 🚨 STEVE'S HOTFIX MISSION: Auto-Migration for Existing Users

**Priority**: CRITICAL
**Time Estimate**: 30 minutes
**Branch**: `feature/auth-system` (same branch)

---

## 🎯 THE PROBLEM

**Current broken flow for existing users:**

1. User `fran@email.com` has 50 games in database (no auth, old system)
2. User goes to `/register` and creates account with `fran@email.com`
3. Account is created ✅
4. **But their 50 old games are NOT linked automatically** ❌
5. User has to manually click "Link old games" banner
6. Bad UX, users will be confused

**What should happen:**

1. User tries to register with `fran@email.com`
2. System detects: "This email has 50 games already!"
3. Shows friendly message: "We found your previous games! They'll be linked automatically when you create your account."
4. After registration → **auto-migrate games silently**
5. User sees their games immediately

---

## 📦 YOUR DELIVERABLES

### **1. New API Endpoint**
- [ ] `app/api/auth/check-legacy-email/route.ts` - Check if email has old games

### **2. Update Register Flow**
- [ ] Update `app/(auth)/register/page.tsx` - Show detection message
- [ ] Auto-trigger migration after successful registration

### **3. Update Migration Endpoint**
- [ ] Make `/api/auth/migrate-account` work even if called immediately after signup

---

## 🚀 IMPLEMENTATION

### **STEP 1: Create Legacy Email Check Endpoint (10 min)**

**File**: `app/api/auth/check-legacy-email/route.ts`

```typescript
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalisedEmail = email.trim().toLowerCase();

    // Count games with this email but no user_id
    const { count: gameCount, error: gamesError } = await supabaseAdmin
      .from("game_runs")
      .select("id", { count: "exact", head: true })
      .eq("email", normalisedEmail)
      .is("user_id", null);

    if (gamesError) {
      throw gamesError;
    }

    // Check if leaderboard entry exists
    const { data: leaderboardEntry, error: leaderboardError } = await supabaseAdmin
      .from("leaderboard")
      .select("best_score, total_games_played")
      .eq("email", normalisedEmail)
      .is("user_id", null)
      .single();

    if (leaderboardError && leaderboardError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine
      throw leaderboardError;
    }

    return NextResponse.json({
      hasLegacyData: (gameCount ?? 0) > 0,
      gameCount: gameCount ?? 0,
      leaderboardEntry: leaderboardEntry || null,
    });
  } catch (error) {
    console.error("Failed to check legacy email", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Commit**: `feat(auth): add endpoint to check for legacy games by email`

---

### **STEP 2: Update Register Page (15 min)**

**File**: `app/(auth)/register/page.tsx`

**Add state for legacy detection:**
```typescript
const [legacyData, setLegacyData] = useState<{
  hasLegacyData: boolean;
  gameCount: number;
  leaderboardEntry: any;
} | null>(null);
const [checkingEmail, setCheckingEmail] = useState(false);
```

**Add email check function:**
```typescript
const checkLegacyEmail = async (emailToCheck: string) => {
  if (!emailToCheck || !emailToCheck.includes('@')) return;

  setCheckingEmail(true);
  try {
    const response = await fetch('/api/auth/check-legacy-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToCheck }),
    });

    if (response.ok) {
      const data = await response.json();
      setLegacyData(data);
    }
  } catch (error) {
    console.error('Failed to check legacy email', error);
  } finally {
    setCheckingEmail(false);
  }
};
```

**Add onBlur to email input:**
```typescript
<input
  type="email"
  required
  autoComplete="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={(e) => checkLegacyEmail(e.target.value)}  // NEW
  disabled={isLoading}
/>
```

**Add legacy data message (before the form fields):**
```typescript
{legacyData?.hasLegacyData && (
  <div
    style={{
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid rgba(16, 185, 129, 0.5)",
      background: "rgba(16, 185, 129, 0.1)",
      color: "rgba(16, 185, 129, 0.9)",
    }}
  >
    <strong>🎉 Welcome back!</strong> We found {legacyData.gameCount} previous game{legacyData.gameCount !== 1 ? 's' : ''} with this email.
    They'll be automatically linked to your new account!
  </div>
)}
```

**Update handleRegister to auto-migrate:**
```typescript
const handleRegister = async (email: string, password: string, name: string) => {
  setIsLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/game`,
      },
    });

    if (error) throw error;

    // NEW: Auto-migrate legacy games if any exist
    if (legacyData?.hasLegacyData && data.user) {
      try {
        await fetch("/api/auth/migrate-account", {
          method: "POST",
        });
      } catch (migrationError) {
        console.error("Auto-migration failed (non-critical):", migrationError);
        // Don't block the signup flow, just log the error
      }
    }

    setCheckEmail(true);
  } catch (error) {
    setIsLoading(false);
    throw error;
  }
};
```

**Commit**: `feat(auth): auto-detect and migrate legacy games during registration`

---

### **STEP 3: Update Migration Banner (5 min)**

The migration banner should NOT show if games were already auto-migrated.

**File**: `app/components/MigrationBanner.tsx`

**Add check on mount:**
```typescript
const [shouldShow, setShouldShow] = useState(true);

useEffect(() => {
  // Check if there are actually legacy games to migrate
  const checkLegacyGames = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/auth/check-legacy-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.hasLegacyData || data.gameCount === 0) {
          setShouldShow(false);
        }
      }
    } catch (error) {
      console.error('Failed to check legacy games', error);
    }
  };

  checkLegacyGames();
}, [user?.email]);

if (!user || migrated || !shouldShow) return null;
```

**Commit**: `feat(migration): hide banner if no legacy games exist`

---

## ✅ TESTING CHECKLIST

**Test Case 1: New User (no legacy games)**
- [ ] Go to `/register`
- [ ] Enter new email (e.g., `newuser@test.com`)
- [ ] No legacy message should appear
- [ ] Register successfully
- [ ] No migration banner on game page

**Test Case 2: Existing User (has legacy games)**
- [ ] Go to `/register`
- [ ] Enter email with existing games (e.g., `gutijeanf@gmail.com`)
- [ ] Green message appears: "We found X games!"
- [ ] Register successfully
- [ ] Check email confirmation
- [ ] After email confirmation, games should be auto-linked
- [ ] No migration banner (already migrated)

**Test Case 3: User registers but doesn't confirm email**
- [ ] Enter legacy email
- [ ] Register
- [ ] Don't confirm email yet
- [ ] Migration should wait until email is confirmed (Supabase handles this)

---

## 🚨 EDGE CASES TO HANDLE

1. **User enters email, then changes it**
   - Legacy message should update/disappear
   - Solution: Re-check on email change

2. **Email check API fails**
   - Don't block registration
   - Just proceed without showing message
   - Already handled with try/catch

3. **Migration fails after signup**
   - Don't block user flow
   - Show banner as fallback for manual migration
   - Already handled with try/catch

---

## 📊 SUCCESS CRITERIA

- [ ] Build passes (`npm run build`)
- [ ] New endpoint `/api/auth/check-legacy-email` works
- [ ] Registration page detects legacy games
- [ ] Auto-migration happens after signup
- [ ] Migration banner only shows if needed
- [ ] No console errors
- [ ] All edge cases handled gracefully

---

## 🎯 COMMIT SEQUENCE

```bash
# 1. Create check endpoint
git add app/api/auth/check-legacy-email/
git commit -m "feat(auth): add endpoint to check for legacy games by email"

# 2. Update register page
git add app/(auth)/register/page.tsx
git commit -m "feat(auth): auto-detect and migrate legacy games during registration"

# 3. Update migration banner
git add app/components/MigrationBanner.tsx
git commit -m "feat(migration): hide banner if no legacy games exist"
```

---

## 💬 WHEN YOU'RE DONE

Reply with:
- ✅ "Hotfix complete - auto-migration working"
- Summary of what you changed
- Any issues encountered
- Ready for testing

---

**This is critical for production launch. Let's get it done! 🚀**
