type OverlapRow = {
  number: number;
  predicted: number;
  drawn: number;
  overlap: number;
};

type OverlapTableProps = {
  rows: OverlapRow[];
};

export default function OverlapTable({ rows }: OverlapTableProps) {
  return (
    <div className="card" style={{ display: "grid", gap: 14 }}>
      <div>
        <h3 style={{ margin: 0 }}>Sweet spot numbers</h3>
        <p style={{ margin: 0, color: "rgba(148, 163, 184, 0.8)" }}>
          Numbers that humans love and randomness still draws frequently.
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Predicted</th>
            <th>Drawn</th>
            <th>Overlap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number}>
              <td>{row.number}</td>
              <td>{row.predicted}</td>
              <td>{row.drawn}</td>
              <td>{row.overlap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
