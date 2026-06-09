export type RGB = readonly [number, number, number];

export interface CVThemeColors {
  readonly base: RGB;
  readonly surface: RGB;
  readonly border: RGB;
  readonly muted: RGB;
  readonly text: RGB;
  readonly primary: RGB;
  readonly accent: RGB;
}

export type CVThemeId = "default" | "white" | "mocha" | "emerald";

export interface CVTheme {
  readonly id: CVThemeId;
  readonly name: string;
  readonly description: string;
  readonly colors: CVThemeColors;
}

export const CV_THEMES: readonly CVTheme[] = [
  {
    id: "default",
    name: "Default",
    description: "The current dark palette.",
    colors: {
      base: [8, 8, 15],
      surface: [18, 18, 29],
      border: [32, 32, 53],
      muted: [152, 152, 176],
      text: [232, 232, 242],
      primary: [91, 155, 213],
      accent: [224, 85, 106],
    },
  },
  {
    id: "white",
    name: "Classic White",
    description: "Formal, recruiter-friendly.",
    colors: {
      base: [255, 255, 255],
      surface: [245, 247, 250],
      border: [220, 224, 230],
      muted: [107, 114, 128],
      text: [17, 24, 39],
      primary: [30, 58, 138],
      accent: [37, 99, 235],
    },
  },
  {
    id: "mocha",
    name: "Catppuccin Mocha",
    description: "Soothing pastels, lavender accent.",
    colors: {
      base: [30, 30, 46],
      surface: [49, 50, 68],
      border: [69, 71, 90],
      muted: [166, 173, 200],
      text: [205, 214, 244],
      primary: [137, 180, 250],
      accent: [180, 190, 254],
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Deep green with a vibrant accent.",
    colors: {
      base: [6, 20, 16],
      surface: [14, 32, 26],
      border: [22, 50, 40],
      muted: [134, 168, 152],
      text: [225, 240, 232],
      primary: [16, 185, 129],
      accent: [52, 211, 153],
    },
  },
];

const DEFAULT_THEME: CVTheme = CV_THEMES[0];

export function getThemeById(id: CVThemeId): CVTheme {
  return CV_THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}

export function rgbToCss([r, g, b]: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}

// W3C relative luminance. 0 = black, 1 = white.
export function relativeLuminance([r, g, b]: RGB): number {
  const toLinear = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Pick between a light or dark asset URL based on the theme's base luminance.
// Used to swap icon variants so they stay visible on both light and dark CVs.
export function pickAssetByLuminance(base: RGB, lightUrl: string, darkUrl: string): string {
  return relativeLuminance(base) > 0.5 ? darkUrl : lightUrl;
}
