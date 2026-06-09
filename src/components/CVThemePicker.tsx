import { CheckIcon } from "@phosphor-icons/react";
import { CV_THEMES, type CVTheme, rgbToCss } from "src/utils/cvThemes";

export interface CVThemePickerProps {
  selectedId: CVTheme["id"];
  onSelect: (theme: CVTheme) => void;
}

const STRIPE_KEYS = ["base", "surface", "border", "muted", "text", "primary", "accent"] as const;

export function CVThemePicker({ selectedId, onSelect }: CVThemePickerProps) {
  return (
    <div className="w-full p-8 md:p-12 rounded-3xl bg-alvaro-surface border border-alvaro-border">
      <div className="mb-8 md:mb-10 max-w-2xl">
        <h2 className="text-3xl md:text-4xl tracking-[-0.03em] font-bold text-alvaro-white">
          Pick a palette
        </h2>
        <p className="mt-3 text-sm md:text-base text-alvaro-muted leading-relaxed">
          Four handcrafted themes. Pick one to generate your CV with that palette.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {CV_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={theme.id === selectedId}
            onClick={() => onSelect(theme)}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: CVTheme;
  selected: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, selected, onClick }: ThemeCardProps) {
  const { colors, name, description } = theme;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Select ${name} theme`}
      data-theme-id={theme.id}
      data-selected={selected}
      className={[
        "group text-left p-5 md:p-6 rounded-2xl border transition-all duration-300 cursor-pointer",
        "flex flex-col gap-5 outline-none",
        "focus-visible:ring-2 focus-visible:ring-alvaro-primary focus-visible:ring-offset-2 focus-visible:ring-offset-alvaro-surface",
        selected
          ? "border-alvaro-primary bg-alvaro-primary/5"
          : "border-alvaro-border bg-alvaro-base/40 hover:border-alvaro-primary/40 hover:bg-alvaro-base/60",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold tracking-tight text-alvaro-white truncate">
            {name}
          </h3>
          <p className="mt-1 text-xs text-alvaro-muted leading-relaxed">{description}</p>
        </div>
        <span
          className={[
            "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300",
            selected
              ? "bg-alvaro-primary text-alvaro-base"
              : "bg-alvaro-base/60 text-alvaro-muted opacity-0 group-hover:opacity-100",
          ].join(" ")}
          aria-hidden="true"
        >
          {selected && <CheckIcon size={10} weight="bold" />}
          {selected ? "Selected" : "Select"}
        </span>
      </div>

      <div
        className="flex h-3 w-full overflow-hidden rounded-full border border-alvaro-border"
        aria-hidden="true"
      >
        {STRIPE_KEYS.map((key) => (
          <div key={key} className="flex-1" style={{ backgroundColor: rgbToCss(colors[key]) }} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-alvaro-muted">
        <div className="flex items-center gap-2">
          <span
            data-testid="swatch-base"
            className="inline-block h-3 w-3 rounded-full border border-alvaro-border"
            style={{ backgroundColor: rgbToCss(colors.base) }}
            aria-hidden="true"
          />
          <span className="uppercase tracking-widest">Base</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-widest">Accent</span>
          <span
            data-testid="swatch-accent"
            className="inline-block h-3 w-3 rounded-full border border-alvaro-border"
            style={{ backgroundColor: rgbToCss(colors.accent) }}
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  );
}
