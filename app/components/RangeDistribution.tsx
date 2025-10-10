type RangeDistributionProps = {
  title: string;
  ranges: { small: number; medium: number; large: number };
  tone?: "blue" | "indigo" | "pink";
};

const gradientByTone = {
  blue: "linear-gradient(90deg, rgba(56,189,248,0.3), rgba(37,99,235,0.35))",
  indigo: "linear-gradient(90deg, rgba(129,140,248,0.3), rgba(99,102,241,0.4))",
  pink: "linear-gradient(90deg, rgba(244,114,182,0.3), rgba(236,72,153,0.35))"
} as const;

export default function RangeDistribution({ title, ranges, tone = "blue" }: RangeDistributionProps) {
  const total = ranges.small + ranges.medium + ranges.large;
  const format = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

  return (
    <div className="card" style={{ display: "grid", gap: 14 }}>
      <h3 style={{ margin: "0 0 6px" }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {([
          { label: "1 - 33", value: ranges.small },
          { label: "34 - 66", value: ranges.medium },
          { label: "67 - 99", value: ranges.large }
        ] as const).map((bucket) => {
          const percentage = format(bucket.value);
          return (
            <div key={bucket.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(148, 163, 184, 0.8)" }}>{bucket.label}</span>
                <strong>{percentage}%</strong>
              </div>
              <div
                style={{
                  height: 10,
                  background: "rgba(15, 23, 42, 0.7)",
                  borderRadius: 999
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: gradientByTone[tone],
                    borderRadius: 999
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
