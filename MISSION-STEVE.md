# 🎯 STEVE'S MISSION: Backend & Authentication Infrastructure

**Project**: Random Prediction Game - Production Auth System
**Your Role**: Backend Engineer
**Branch**: `feature/auth-system`
**Timeline**: 2-3 days (parallel with Martin)
**Product Owner**: Claude (monitoring via commits)

---

## 🤝 COORDINATION WITH MARTIN

Martin is building the frontend auth UI **on the same branch**. You two are working in parallel.

**Communication Protocol**:
- Commit every 30-60 minutes with descriptive messages
- Run `git status` and `git log` regularly to see what Martin's done
- Your work enables his - he needs your API routes and types
- His work depends on yours - coordinate on data structures

**Critical Handoff Points**:
1. You create `lib/supabaseClient.ts` → Martin uses it in components
2. You define TypeScript types → Martin imports them
3. You build API routes → Martin calls them from frontend
4. You set up auth helpers → Martin uses them for session management

---

## 📦 YOUR DELIVERABLES

### **Infrastructure**
- [ ] Supabase CLI installed and configured
- [ ] Database migrations (add `user_id` columns)
- [ ] Row Level Security (RLS) policies
- [ ] Supabase Auth enabled and configured

### **Code Files**
- [ ] `lib/supabaseClient.ts` - Client-side Supabase instance
- [ ] `lib/auth.ts` - Auth helper functions
- [ ] `lib/authTypes.ts` - TypeScript types for auth
- [ ] Migration files in `supabase/migrations/`

### **API Routes**
- [ ] Update `app/api/game-run/route.ts` - Require authentication
- [ ] Update `app/api/user-analytics/route.ts` - Use user_id instead of email
- [ ] Update `app/api/leaderboard/route.ts` - Include authenticated user context
- [ ] Create `app/api/auth/session/route.ts` - Get current session
- [ ] Create `app/api/auth/migrate-account/route.ts` - Link old games to new accounts

### **Database Changes**
- [ ] Add `user_id UUID` to `game_runs` table
- [ ] Add `user_id UUID` to `leaderboard` table
- [ ] Create indexes on `user_id` columns
- [ ] Enable RLS on both tables
- [ ] Create policies: users see their own data

---

## 🚀 PHASE-BY-PHASE IMPLEMENTATION

### **PHASE 0: Environment Setup (30 min)**

**Install Supabase CLI**
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

**Initialize Supabase in project**
```bash
cd /Users/franzuzz/Desktop/code/random-prediction-2
supabase init
```

**Link to production project**
```bash
supabase link --project-ref lqvadaoxkrlojaqelpux
```

**Pull current schema**
```bash
supabase db pull
```

**Commit**: `chore(setup): initialize Supabase CLI and pull schema`

---

### **PHASE 1: Database Migrations (1 hour)**

**Create migration file**
```bash
supabase migration new add_auth_user_id_columns
```

**Migration SQL** (`supabase/migrations/XXXXXX_add_auth_user_id_columns.sql`):
```sql
-- Add user_id columns to existing tables (nullable for migration)
ALTER TABLE game_runs
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

ALTER TABLE leaderboard
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX idx_game_runs_user_id ON game_runs(user_id);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- Add index on email for migration lookups
CREATE INDEX IF NOT EXISTS idx_game_runs_email ON game_runs(email);
CREATE INDEX IF NOT EXISTS idx_leaderboard_email ON leaderboard(email);
```

**Test migration locally**
```bash
supabase db reset  # Test with local DB
```

**Push to production** (when ready)
```bash
supabase db push
```

**Commit**: `feat(db): add user_id columns and indexes for auth migration`

---

### **PHASE 2: Enable Supabase Auth (30 min)**

**Go to Supabase Dashboard**:
1. Navigate to: https://app.supabase.com/project/lqvadaoxkrlojaqelpux/auth/users
2. Authentication → Settings → Email Auth → Enable
3. Authentication → Email Templates → Customize:
   - **Confirm Signup**: "Welcome to Random Prediction! Confirm your email to start playing."
   - **Reset Password**: "Reset your password to continue predicting numbers."
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) / your-prod-domain (prod)
   - Redirect URLs: Add your domains

**Document in commit message what you configured**

**Commit**: `feat(auth): enable Supabase email auth and configure templates`

---

### **PHASE 3: Auth Infrastructure Code (2 hours)**

#### **File 1: `lib/supabaseClient.ts`**
Client-side Supabase instance (Martin needs this!)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

**Note**: You need to add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://lqvadaoxkrlojaqelpux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
```

**Commit**: `feat(auth): create client-side Supabase instance`

---

#### **File 2: `lib/authTypes.ts`**
TypeScript types (Martin imports these!)

```typescript
export type AuthUser = {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

export type SignUpData = {
  email: string;
  password: string;
  name: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type AuthError = {
  message: string;
  status?: number;
};
```

**Commit**: `feat(auth): add TypeScript types for authentication`

---

#### **File 3: `lib/auth.ts`**
Server-side auth helpers

```typescript
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { AuthUser } from './authTypes';

export async function getServerSession(): Promise<{ user: AuthUser | null }> {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return { user: user as AuthUser | null };
}

export async function requireAuth(): Promise<AuthUser> {
  const { user } = await getServerSession();

  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }

  return user;
}
```

**Note**: Install SSR package:
```bash
npm install @supabase/ssr
```

**Commit**: `feat(auth): add server-side auth helper functions`

---

### **PHASE 4: Update API Routes (3 hours)**

#### **Update: `app/api/game-run/route.ts`**

**Changes needed**:
1. Import auth helpers
2. Get authenticated user
3. Save `user_id` instead of relying on email alone
4. Keep email for backward compatibility during migration

```typescript
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  // Get authenticated user (throws if not logged in)
  const user = await requireAuth();

  let payload: GameRunPayload;

  try {
    payload = await req.json() as GameRunPayload;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    name,
    predictions,
    randomNumbers,
    score,
    gameType = "1-99_range_10_numbers"
  } = payload;

  // Email comes from authenticated user now
  const email = user.email;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // ... rest of validation ...

  try {
    // Insert game run with user_id
    const { error: insertError } = await supabaseAdmin
      .from("game_runs")
      .insert({
        user_id: user.id,  // NEW: Link to auth user
        user_name: name.trim(),
        email: email,  // Keep for backward compat
        predictions,
        random_numbers: randomNumbers,
        score,
        game_type: gameType
      });

    if (insertError) {
      throw insertError;
    }

    // Update leaderboard using user_id
    const { data: existingEntries, error: selectError } = await supabaseAdmin
      .from("leaderboard")
      .select("id, best_score, total_games_played")
      .eq("user_id", user.id)  // NEW: Use user_id instead of email
      .eq("game_type", gameType)
      .limit(1);

    // ... rest of leaderboard logic ...

  } catch (error) {
    console.error("Failed to persist game run", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Commit**: `feat(api): require authentication for game submissions`

---

#### **Create: `app/api/auth/session/route.ts`**

New endpoint for Martin to check session status

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

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
        emailConfirmed: !!user.email_confirmed_at
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
```

**Commit**: `feat(api): add session check endpoint`

---

#### **Create: `app/api/auth/migrate-account/route.ts`**

Links old email-only games to new authenticated accounts

```typescript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Find all games with this email but no user_id
    const { data: oldGames, error: gamesError } = await supabaseAdmin
      .from('game_runs')
      .select('id')
      .eq('email', user.email)
      .is('user_id', null);

    if (gamesError) throw gamesError;

    // Update games to link to this user
    if (oldGames && oldGames.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('game_runs')
        .update({ user_id: user.id })
        .eq('email', user.email)
        .is('user_id', null);

      if (updateError) throw updateError;
    }

    // Update leaderboard entry
    const { error: leaderboardError } = await supabaseAdmin
      .from('leaderboard')
      .update({ user_id: user.id })
      .eq('email', user.email)
      .is('user_id', null);

    if (leaderboardError) throw leaderboardError;

    return NextResponse.json({
      success: true,
      migratedGames: oldGames?.length || 0
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
```

**Commit**: `feat(api): add account migration endpoint for legacy data`

---

#### **Update: `app/api/user-analytics/route.ts`**

Change to use user_id from session instead of email query param

```typescript
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch runs using user_id
    const { data: runs, error } = await supabaseAdmin
      .from("game_runs")
      .select("*")
      .eq("user_id", user.id)  // NEW: Use authenticated user_id
      .order("created_at", { ascending: false });

    // ... rest of analytics logic ...

  } catch (error) {
    // Handle auth errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please log in to view analytics' },
        { status: 401 }
      );
    }
    // ... rest of error handling ...
  }
}
```

**Commit**: `feat(api): update user analytics to use authenticated sessions`

---

### **PHASE 5: Row Level Security (1 hour)**

**Create migration for RLS policies**

```bash
supabase migration new enable_rls_policies
```

**Migration SQL**:
```sql
-- Enable RLS on tables
ALTER TABLE game_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own game runs
CREATE POLICY "Users can view own game runs"
  ON game_runs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own game runs
CREATE POLICY "Users can insert own game runs"
  ON game_runs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anyone can view leaderboard (public)
CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard
  FOR SELECT
  USING (true);

-- Policy: Service role can update leaderboard (for API)
CREATE POLICY "Service role can update leaderboard"
  ON leaderboard
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: Service role bypasses RLS, these are for client queries
```

**Test locally first, then push**

**Commit**: `feat(db): enable RLS policies for data security`

---

### **PHASE 6: Environment Variables Update**

**Update `.env.local`** (don't commit this!):
```env
# Existing
RANDOM_API_KEY=cfedd82b-fe3d-401e-bca3-7520e299c848
SUPABASE_URL=https://lqvadaoxkrlojaqelpux.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_gG2X3wZWxCbBY6FA0cfVWQ_weMKq_Du

# NEW: Add these (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://lqvadaoxkrlojaqelpux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from dashboard under Settings → API>
```

**Update `.env.example`** (commit this!):
```env
RANDOM_API_KEY=your_random_org_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Commit**: `docs: update env example with auth variables`

---

### **PHASE 7: Update Types**

**Update `lib/types.ts`** to include user_id:

```typescript
export type GameRun = {
  id: string;
  created_at: string;
  user_id: string | null;  // NEW: nullable during migration
  user_name: string;
  email: string;
  predictions: number[];
  random_numbers: number[];
  score: number;
  game_type: string;
};

export type LeaderboardEntry = {
  id: string;
  user_id: string | null;  // NEW: nullable during migration
  name: string;
  email: string;
  best_score: number;
  total_games_played: number;
  game_type: string;
};
```

**Commit**: `feat(types): add user_id to data types`

---

## ✅ DEFINITION OF DONE

### **Your work is complete when**:
- [ ] Supabase CLI is set up and migrations are versioned
- [ ] Database has `user_id` columns with indexes
- [ ] RLS policies are enabled and tested
- [ ] `lib/supabaseClient.ts` exists and works
- [ ] `lib/auth.ts` has session helpers
- [ ] `lib/authTypes.ts` has TypeScript types
- [ ] All API routes require authentication
- [ ] Migration endpoint exists for old accounts
- [ ] Environment variables are documented
- [ ] All changes are committed with clear messages

### **How Martin knows you're done**:
- He can import `supabase` from `lib/supabaseClient.ts`
- He can call `supabase.auth.signUp()` successfully
- He can import types from `lib/authTypes.ts`
- He can test login/signup flows end-to-end
- API routes return 401 when not authenticated

---

## 🚨 CRITICAL REMINDERS

1. **NEVER DROP COLUMNS** - Only add, never remove existing data
2. **TEST MIGRATIONS LOCALLY FIRST** - Use `supabase db reset` before `supabase db push`
3. **COMMIT OFTEN** - Every 30-60 minutes so Martin can see progress
4. **READ MARTIN'S COMMITS** - Run `git log` to see what he's built
5. **ASK CLAUDE VIA COMMITS** - If blocked, commit with `WIP: blocked on X, need guidance`

---

## 📞 HANDOFF TO MARTIN

**After your Phase 3** (auth infrastructure code), Martin can start building:
- Login/Register forms (he'll use your `supabase` client)
- Protected routes (he'll use your `getServerSession`)
- Session provider (he'll import your types)

**Coordinate on**:
- What data the signup form collects (email, password, name)
- Error message formats (return consistent JSON structures)
- Redirect URLs after auth actions

---

## 🎯 SUCCESS METRICS

You'll know you crushed it when:
- ✅ A new user can register and their game is linked to `user_id`
- ✅ Existing email can "claim" old games via migration endpoint
- ✅ No unauthenticated user can submit games
- ✅ RLS prevents users from seeing each other's data
- ✅ Zero production data is lost
- ✅ Martin's frontend can authenticate users seamlessly

---

**Ready to ship, Steve? Let's build a production-grade auth system. Commit early, commit often. Claude is watching. 🚀**
