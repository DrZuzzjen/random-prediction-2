type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "green" | "amber" | "purple";
};

const accents = {
  blue: "rgba(56, 189, 248, 0.25)",
  green: "rgba(16, 185, 129, 0.25)",
  amber: "rgba(251, 191, 36, 0.25)",
  purple: "rgba(168, 85, 247, 0.25)"
} as const;

export default function StatCard({ label, value, hint, accent = "blue" }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        padding: "20px",
        background: "rgba(15, 23, 42, 0.72)",
        border: `1px solid ${accents[accent]}`
      }}
    >
      <div style={{ fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(148, 163, 184, 0.75)" }}>
        {label}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, marginTop: 6 }}>{value}</div>
      {hint && <div style={{ color: "rgba(148, 163, 184, 0.75)", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}
