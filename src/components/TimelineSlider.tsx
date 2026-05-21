import { type ChangeEvent } from "react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  positions: number[];
};

export const TimelineSlider = ({ value, onChange, min, max, positions }: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4 pt-2">
      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-alvaro-muted font-medium px-1">
        <span>Short</span>
        <span>Long</span>
      </div>

      {/* Slider */}
      <div className="relative h-6 flex items-center px-2">
        <div className="relative w-full h-full flex items-center">
          {/* Track background */}
          <div className="absolute inset-x-0 h-[3px] bg-alvaro-border rounded-full" />
          {/* Track fill */}
          <div
            className="absolute left-0 h-[3px] bg-alvaro-primary rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
          {/* Input */}
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
            className="timeline-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Bio length"
          />
          {/* Thumb */}
          <div
            className="absolute w-4 h-4 bg-alvaro-primary rounded-full border-2 border-alvaro-base shadow-lg transition-[left] duration-200 ease-out pointer-events-none"
            style={{ left: `calc(${pct}% - 8px)` }}
          />
        </div>
      </div>

      {/* Position markers */}
      <div className="relative h-3 mx-1">
        {positions.map((pos) => {
          const posPct = ((pos - min) / (max - min)) * 100;
          const isActive = pos <= value;
          return (
            <div
              key={pos}
              className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 transition-all duration-300 ${
                isActive ? "bg-alvaro-primary scale-125" : "bg-alvaro-border"
              }`}
              style={{ left: `${posPct}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};
