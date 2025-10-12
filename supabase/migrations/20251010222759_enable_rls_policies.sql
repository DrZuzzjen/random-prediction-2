-- Enable Row Level Security on tables
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

-- Policy: Anyone can view leaderboard (public data)
CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard
  FOR SELECT
  USING (true);

-- Policy: Service role can manage leaderboard (for API updates)
CREATE POLICY "Service role can manage leaderboard"
  ON leaderboard
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: Service role (used by our API routes) bypasses RLS
-- These policies apply to client-side queries using anon/authenticated keys
