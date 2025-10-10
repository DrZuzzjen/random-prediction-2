type SparklineProps = {
  data: number[];
  max?: number;
  min?: number;
  color?: string;
};

export default function Sparkline({ data, max = 10, min = 0, color = "#38bdf8" }: SparklineProps) {
  if (data.length === 0) {
    return <div style={{ fontSize: "0.85rem", color: "rgba(148, 163, 184, 0.75)" }}>No games yet.</div>;
  }

  const width = 240;
  const height = 80;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * (width - 8) + 4;
      const normalized = (value - min) / (max - min || 1);
      const y = height - normalized * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        points={points}
        style={{ filter: "drop-shadow(0 8px 12px rgba(56, 189, 248, 0.4))" }}
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1 || 1)) * (width - 8) + 4;
        const normalized = (value - min) / (max - min || 1);
        const y = height - normalized * (height - 8) - 4;
        return <circle key={index} cx={x} cy={y} r={4} fill={color} />;
      })}
    </svg>
  );
}
