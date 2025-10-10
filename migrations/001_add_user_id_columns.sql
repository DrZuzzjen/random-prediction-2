-- Migration: Add user_id columns for authentication
-- Run this in Supabase Dashboard > SQL Editor
-- Date: 2025-10-11

-- Add user_id columns to existing tables (nullable for migration)
ALTER TABLE game_runs
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

ALTER TABLE leaderboard
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX idx_game_runs_user_id ON game_runs(user_id);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- Add index on email for migration lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_game_runs_email ON game_runs(email);
CREATE INDEX IF NOT EXISTS idx_leaderboard_email ON leaderboard(email);