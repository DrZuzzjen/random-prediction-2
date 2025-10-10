type InsightsCardProps = {
  title: string;
  highlights: string[];
  tone?: "info" | "warning" | "success";
};

const toneColor = {
  info: "rgba(148, 163, 184, 0.85)",
  warning: "rgba(251, 191, 36, 0.85)",
  success: "rgba(16, 185, 129, 0.85)"
} as const;

export default function InsightsCard({ title, highlights, tone = "info" }: InsightsCardProps) {
  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, color: toneColor[tone], display: "grid", gap: 6 }}>
        {highlights.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
