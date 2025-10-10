type LeaderboardEntry = {
  name: string;
  email?: string;
  best_score: number;
  total_games_played: number;
};

type LeaderboardPanelProps = {
  entries: LeaderboardEntry[];
};

export default function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
  return (
    <aside className="card" style={{ padding: "24px", display: "grid", gap: "20px" }}>
      <div>
        <div className="tag">🏆 Leaderboard</div>
        <h3 style={{ marginBottom: "4px" }}>Top Predictors</h3>
        <p style={{ color: "rgba(148, 163, 184, 0.8)", marginTop: 0 }}>
          Ten best scores for the 1-99 range challenge.
        </p>
      </div>
      <div style={{ display: "grid", gap: "12px" }}>
        {entries.length === 0 && (
          <p style={{ color: "rgba(148, 163, 184, 0.75)", margin: 0 }}>
            Be the first to play and claim the leaderboard!
          </p>
        )}
        {entries.map((entry, index) => {
          const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
          return (
            <div
              key={`${entry.email ?? entry.name}-${index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "14px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.18)"
              }}
            >
              <div>
                <span style={{ fontSize: "0.85rem", color: "rgba(148, 163, 184, 0.85)" }}>{medal}</span>
                <strong style={{ marginLeft: 10, letterSpacing: "0.03em" }}>{entry.name}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontWeight: 700 }}>{entry.best_score}/10</span>
                <div style={{ fontSize: "0.75rem", color: "rgba(148, 163, 184, 0.65)" }}>
                  {entry.total_games_played} games
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <h4 style={{ marginBottom: 8 }}>How to Play</h4>
        <ol style={{ margin: 0, paddingLeft: 18, color: "rgba(148, 163, 184, 0.8)", display: "grid", gap: 6 }}>
          <li>Spin the dial to pick 10 numbers between 1-99</li>
          <li>Lock them in and request true random numbers</li>
          <li>Share your name & email to save the run</li>
          <li>Analyse your luck and compare with the world</li>
        </ol>
      </div>
    </aside>
  );
}
