"use client";

type SelectedNumbersProps = {
  numbers: number[];
  onRemove: (value: number) => void;
};

export default function SelectedNumbers({ numbers, onRemove }: SelectedNumbersProps) {
  if (numbers.length === 0) {
    return (
      <p style={{ color: "rgba(148, 163, 184, 0.8)", textAlign: "center", margin: "12px 0" }}>
        Spin the dial and lock in numbers you feel good about.
      </p>
    );
  }

  return (
    <div className="selected-numbers">
      {numbers.map((value, index) => (
        <div key={`${value}-${index}`} className="selected-number">
          <span>{value.toString().padStart(2, "0")}</span>
          <button type="button" onClick={() => onRemove(value)} aria-label="Remove number">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
