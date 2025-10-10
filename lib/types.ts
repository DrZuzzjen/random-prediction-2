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

export type ScoreDistribution = Record<number, number>;

export type NumberFrequency = Record<number, number>;
