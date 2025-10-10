type ComparisonCardProps = {
  title: string;
  humanLabel: string;
  randomLabel: string;
  humanValue: string;
  randomValue: string;
  description?: string;
};

export default function ComparisonCard({
  title,
  humanLabel,
  randomLabel,
  humanValue,
  randomValue,
  description
}: ComparisonCardProps) {
  return (
    <div className="card" style={{ display: "grid", gap: 14 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <div style={{ padding: 12, borderRadius: 16, background: "rgba(37, 99, 235, 0.14)" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(148, 163, 184, 0.75)" }}>
            {humanLabel}
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{humanValue}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 16, background: "rgba(16, 185, 129, 0.14)" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(148, 163, 184, 0.75)" }}>
            {randomLabel}
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{randomValue}</div>
        </div>
      </div>
      {description && <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.75)" }}>{description}</p>}
    </div>
  );
}
