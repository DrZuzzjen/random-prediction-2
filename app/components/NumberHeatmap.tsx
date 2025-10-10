import type { NumberFrequency } from "@/lib/types";

type NumberHeatmapProps = {
  title: string;
  subtitle?: string;
  frequency: NumberFrequency;
};

export default function NumberHeatmap({ title, subtitle, frequency }: NumberHeatmapProps) {
  const values = Array.from({ length: 99 }, (_, index) => index + 1);
  const maxValue = Math.max(1, ...values.map((value) => frequency[value] ?? 0));

  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div>
        <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.8)" }}>{subtitle}</p>}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
          gap: 6
        }}
      >
        {values.map((value) => {
          const freq = frequency[value] ?? 0;
          const strength = freq / maxValue;
          const background = `rgba(56, 189, 248, ${0.1 + strength * 0.55})`;
          const color = strength > 0.45 ? "#0f172a" : "#e2e8f0";

          return (
            <div
              key={value}
              style={{
                background,
                color,
                borderRadius: 10,
                padding: "12px 0",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "0.95rem",
                border: "1px solid rgba(148, 163, 184, 0.15)"
              }}
            >
              <div>{value.toString().padStart(2, "0")}</div>
              <div style={{ fontSize: "0.7rem", color: strength > 0.45 ? "rgba(15, 23, 42, 0.8)" : "rgba(148, 163, 184, 0.75)" }}>
                {freq}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
