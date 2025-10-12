-- Add user_id columns to existing tables for authentication
-- These columns are nullable during migration to maintain existing data

-- Add user_id column to game_runs table
ALTER TABLE game_runs
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id column to leaderboard table  
ALTER TABLE leaderboard
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX idx_game_runs_user_id ON game_runs(user_id);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- Add indexes on email for migration lookups (if not already exist)
CREATE INDEX IF NOT EXISTS idx_game_runs_email ON game_runs(email);
CREATE INDEX IF NOT EXISTS idx_leaderboard_email ON leaderboard(email);
