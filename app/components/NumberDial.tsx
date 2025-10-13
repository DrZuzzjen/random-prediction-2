"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import clsx from "clsx";

type NumberDialProps = {
  onSelect: (value: number) => void;
  disabled?: boolean;
  highlightNumbers?: number[];
};

const TOTAL_NUMBERS = 99;
const ANGLE_PER_STEP = 360 / TOTAL_NUMBERS;

type CSSVarStyle = CSSProperties & Record<`--${string}`, string>;

type DragState = {
  active: boolean;
  pointerId: number | null;
  previousAngle: number;
};

function wrapNumber(value: number) {
  const normalised = ((Math.round(value) - 1) % TOTAL_NUMBERS + TOTAL_NUMBERS) % TOTAL_NUMBERS;
  return normalised + 1;
}

function numberToAngle(value: number) {
  const normalised = ((value - 1) % TOTAL_NUMBERS + TOTAL_NUMBERS) % TOTAL_NUMBERS;
  return normalised * ANGLE_PER_STEP;
}

function rotationToNumber(rotation: number) {
  const normalised = ((-rotation) % 360 + 360) % 360;
  const ticks = Math.round(normalised / ANGLE_PER_STEP);
  const wrapped = ((ticks % TOTAL_NUMBERS) + TOTAL_NUMBERS) % TOTAL_NUMBERS;
  const value = wrapped === 0 ? TOTAL_NUMBERS : wrapped;
  return value;
}

function normaliseDelta(delta: number) {
  if (delta > 180) return delta - 360;
  if (delta < -180) return delta + 360;
  return delta;
}

function getAngleFromEvent(event: ReactPointerEvent<HTMLDivElement>, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const offsetX = event.clientX - centerX;
  const offsetY = event.clientY - centerY;
  return (Math.atan2(offsetY, offsetX) * 180) / Math.PI;
}

export default function NumberDial({
  onSelect,
  disabled,
  highlightNumbers = []
}: NumberDialProps) {
  // Initialize with a fixed value to prevent hydration mismatch
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(-numberToAngle(1));
  const [isDragging, setIsDragging] = useState(false);

  // Set random initial value on client side only
  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
    const randomRotation = -numberToAngle(randomNumber);
    setCurrentNumber(randomNumber);
    setRotation(randomRotation);
    rotationRef.current = randomRotation;
  }, []);

  const dialFaceRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(-numberToAngle(1));
  const dragRef = useRef<DragState>({ active: false, pointerId: null, previousAngle: 0 });

  const ticks = useMemo(() => Array.from({ length: TOTAL_NUMBERS }, (_, index) => index), []);
  const majorMarks = useMemo(() => Array.from({ length: 10 }, (_, index) => index * 10), []);
  const highlightMarkers = useMemo(() => {
    const unique = new Set<number>();
    highlightNumbers.forEach((value) => {
      if (Number.isFinite(value)) {
        unique.add(wrapNumber(value));
      }
    });
    return Array.from(unique).map((value) => ({ value, angle: numberToAngle(value) }));
  }, [highlightNumbers]);

  const applyRotation = (nextRotation: number) => {
    // Allow rotation to accumulate freely without normalization
    // This prevents visual jumps when crossing the 99<->00 boundary
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    setCurrentNumber(rotationToNumber(nextRotation));
  };

  const setNumber = (value: number) => {
    const safeValue = wrapNumber(value);
    const nextRotation = -numberToAngle(safeValue);
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    setCurrentNumber(safeValue);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const element = dialFaceRef.current;
    if (!element) {
      return;
    }

    event.preventDefault();
    const angle = getAngleFromEvent(event, element);
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      previousAngle: angle
    };
    element.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragRef.current;
    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    const element = dialFaceRef.current;
    if (!element) {
      return;
    }

    event.preventDefault();
    const angle = getAngleFromEvent(event, element);
    const delta = normaliseDelta(angle - dragState.previousAngle);
    dragState.previousAngle = angle;
    applyRotation(rotationRef.current + delta);
  };

  const finishDrag = (event?: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragRef.current;
    if (!dragState.active) {
      return;
    }

    if (event && dragState.pointerId === event.pointerId) {
      dialFaceRef.current?.releasePointerCapture(event.pointerId);
    }

    dragState.active = false;
    dragState.pointerId = null;
    setIsDragging(false);

    const snappedNumber = rotationToNumber(rotationRef.current);
    setNumber(snappedNumber);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishDrag(event);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.active && dragRef.current.pointerId === event.pointerId) {
      finishDrag(event);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishDrag(event);
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setNumber(nextValue);
  };

  const handleLock = () => {
    if (disabled) {
      return;
    }
    onSelect(currentNumber);
  };

  return (
    <div className="dial-wrapper">
      <div className="safe-dial">
        <div className="safe-dial-pointer" />
        <div
          ref={dialFaceRef}
          className={clsx("safe-dial-face", { dragging: isDragging })}
          style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerLeave}
        >
          <div className="safe-dial-ring">
            {ticks.map((tick) => {
              const angle = tick * ANGLE_PER_STEP;
              const style = { "--tick-angle": `${angle}deg` } as CSSVarStyle;
              return (
                <span
                  key={`tick-${tick}`}
                  className={clsx("safe-dial-tick", { major: tick % 5 === 0 })}
                  style={style}
                />
              );
            })}
            {majorMarks.map((mark) => {
              const angle = mark * ANGLE_PER_STEP;
              const style = {
                "--number-angle": `${angle}deg`,
                "--number-angle-invert": `${-angle}deg`
              } as CSSVarStyle;
              const display = mark === 0 ? "00" : mark.toString().padStart(2, "0");
              return (
                <div key={`mark-${mark}`} className="safe-dial-number" style={style}>
                  <span>{display}</span>
                </div>
              );
            })}
            {highlightMarkers.map((marker) => {
              const style = { "--highlight-angle": `${marker.angle}deg` } as CSSVarStyle;
              return <div key={`highlight-${marker.value}`} className="safe-dial-highlight" style={style} />;
            })}
          </div>
          <div className="safe-dial-center" style={{ transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }}>
            <span className="safe-dial-center-value">{currentNumber.toString().padStart(2, "0")}</span>
          </div>
          <div className="safe-dial-handle">
            <span className="safe-dial-notch" />
          </div>
        </div>
      </div>

      <div className="safe-dial-slider">
        <label htmlFor="number-dial-slider">Fine control</label>
        <input
          id="number-dial-slider"
          type="range"
          min={1}
          max={TOTAL_NUMBERS}
          value={currentNumber}
          onChange={handleSliderChange}
          aria-valuenow={currentNumber}
          aria-valuemin={1}
          aria-valuemax={TOTAL_NUMBERS}
        />
      </div>

      <div className="dial-controls">
        <button className="primary-button" onClick={handleLock} disabled={disabled}>
          Lock Number
        </button>
      </div>
    </div>
  );
}
