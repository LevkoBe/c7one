import type { DesignMode, ThemeTokens } from "../ccc/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number, step = 1): number {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ─── Dark detection ───────────────────────────────────────────────────────────

/** Returns true if the given hex color has a perceived luminance below 0.5 (ITU-R BT.601). */
export function detectIsDark(bgBase: string): boolean {
  const hex = bgBase.replace("#", "");
  if (hex.length !== 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// ─── Random palette ───────────────────────────────────────────────────────────
//
// freedom: 0.0 = constrained (shared hue groups, narrow sat, semantic lightness)
//          1.0 = unconstrained (each token has independent random hue + sat)
//
// Lightness is always role-appropriate (bg stays dark in dark mode, fg stays bright).

function buildRandomPalette(isDark: boolean, freedom: number): ThemeTokens {
  const bgHue      = rand(0, 359, 1);
  const bgSat      = rand(5, 18, 1);
  const fgSat      = rand(6, 12, 1);
  const accentHue  = (bgHue + rand(120, 240, 15)) % 360;
  const accentSat  = rand(60, 82, 2);
  const successHue = rand(120, 145, 5);
  const warningHue = rand(32, 48, 4);
  const errorHue   = rand(350, 365, 5) % 360;

  const rh = (base: number) => (Math.random() < freedom ? rand(0, 359, 1) : base);
  const rs = (base: number) =>
    Math.round(base + (rand(0, 100, 1) - base) * freedom);

  if (isDark) {
    const bgL = rand(3, 9, 1);
    return {
      "--color-bg-base":      hslToHex(rh(bgHue),      rs(bgSat),     bgL),
      "--color-bg-elevated":  hslToHex(rh(bgHue),      rs(bgSat),     bgL + rand(4,  8,  1)),
      "--color-bg-overlay":   hslToHex(rh(bgHue),      rs(bgSat),     bgL + rand(10, 18, 1)),
      "--color-fg-primary":   hslToHex(rh(bgHue),      rs(fgSat),     rand(88, 96, 1)),
      "--color-fg-muted":     hslToHex(rh(bgHue),      rs(fgSat),     rand(50, 65, 1)),
      "--color-fg-disabled":  hslToHex(rh(bgHue),      rs(fgSat),     rand(28, 40, 1)),
      "--color-accent":       hslToHex(rh(accentHue),  rs(accentSat), rand(55, 68, 1)),
      "--color-accent-hover": hslToHex(rh(accentHue),  rs(accentSat), rand(68, 78, 1)),
      "--color-success":      hslToHex(rh(successHue), rs(55),        rand(42, 52, 1)),
      "--color-warning":      hslToHex(rh(warningHue), rs(85),        rand(52, 62, 1)),
      "--color-error":        hslToHex(rh(errorHue),   rs(70),        rand(52, 60, 1)),
      "--color-border":       hslToHex(rh(bgHue),      rs(bgSat),     bgL + rand(14, 22, 1)),
      "--color-shadow":       "#ffffff",
    };
  } else {
    const bgL = rand(93, 99, 1);
    return {
      "--color-bg-base":      hslToHex(rh(bgHue),      rs(bgSat),     bgL),
      "--color-bg-elevated":  hslToHex(rh(bgHue),      rs(bgSat),     bgL - rand(4,  8,  1)),
      "--color-bg-overlay":   hslToHex(rh(bgHue),      rs(bgSat),     bgL - rand(10, 16, 1)),
      "--color-fg-primary":   hslToHex(rh(bgHue),      rs(fgSat),     rand(5,  14, 1)),
      "--color-fg-muted":     hslToHex(rh(bgHue),      rs(fgSat),     rand(38, 52, 1)),
      "--color-fg-disabled":  hslToHex(rh(bgHue),      rs(fgSat),     rand(68, 78, 1)),
      "--color-accent":       hslToHex(rh(accentHue),  rs(accentSat), rand(35, 50, 1)),
      "--color-accent-hover": hslToHex(rh(accentHue),  rs(accentSat), rand(25, 38, 1)),
      "--color-success":      hslToHex(rh(successHue), rs(55),        rand(32, 42, 1)),
      "--color-warning":      hslToHex(rh(warningHue), rs(85),        rand(40, 52, 1)),
      "--color-error":        hslToHex(rh(errorHue),   rs(70),        rand(40, 52, 1)),
      "--color-border":       hslToHex(rh(bgHue),      rs(bgSat),     bgL - rand(10, 18, 1)),
      "--color-shadow":       "#000000",
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RandomizedConfig {
  colors: ThemeTokens;
  mode: DesignMode;
  radius: string;
  borderWidth: string;
  transitionSpeed: string;
  shadowIntensity: number;
}

const MODES: DesignMode[] = ["classic", "neo", "glass", "minimal"];

/**
 * Builds a fully randomized theme configuration.
 *
 * @param isDark   Whether to generate a dark-mode palette.
 * @param freedom  0–100 integer. 0 = constrained/coherent; 100 = fully chaotic.
 */
export function buildRandomConfig(
  isDark: boolean,
  freedom: number,
): RandomizedConfig {
  const f = freedom / 100;
  return {
    colors:          buildRandomPalette(isDark, f),
    mode:            pick(MODES),
    radius:          `${rand(0, 150, 5) / 100}rem`,
    borderWidth:     pick(["0px", "1px", "2px", "3px"]),
    transitionSpeed: `${rand(80, 600, 20)}ms`,
    shadowIntensity: rand(0, 15, 1) / 10,
  };
}
