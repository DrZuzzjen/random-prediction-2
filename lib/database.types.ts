type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      game_runs: {
        Row: {
          id: string;
          created_at: string;
          user_name: string;
          email: string;
          predictions: number[];
          random_numbers: number[];
          score: number;
          game_type: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_name: string;
          email: string;
          predictions: number[];
          random_numbers: number[];
          score: number;
          game_type?: string;
          user_id?: string | null;
        };
        Update: Partial<{
          user_name: string;
          email: string;
          predictions: number[];
          random_numbers: number[];
          score: number;
          game_type: string;
          user_id: string | null;
        }>;
      };
      leaderboard: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          best_score: number;
          total_games_played: number;
          game_type: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          best_score: number;
          total_games_played?: number;
          game_type: string;
          user_id?: string | null;
        };
        Update: Partial<{
          name: string;
          email: string;
          best_score: number;
          total_games_played: number;
          game_type: string;
          user_id: string | null;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
