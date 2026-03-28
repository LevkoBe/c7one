// ─── Design Modes ────────────────────────────────────────────────────────────

export type DesignMode = "classic" | "neo" | "glass" | "minimal";

// ─── Color Tokens (12 semantic slots) ────────────────────────────────────────

export interface ThemeTokens {
  "--color-bg-base": string;
  "--color-bg-elevated": string;
  "--color-bg-overlay": string;
  "--color-fg-primary": string;
  "--color-fg-muted": string;
  "--color-fg-disabled": string;
  "--color-accent": string;
  "--color-accent-hover": string;
  "--color-success": string;
  "--color-warning": string;
  "--color-error": string;
  "--color-border": string;
}

// ─── Shape / Motion / Depth ───────────────────────────────────────────────────

export interface ShapeConfig {
  radius?: string;
  borderWidth?: string;
}

export interface MotionConfig {
  transitionSpeed?: string;
}

export interface DepthConfig {
  shadowIntensity?: number;
}

// ─── Full Provider Config ─────────────────────────────────────────────────────

export interface C7OneConfig {
  colors?: Partial<ThemeTokens>;
  shape?: ShapeConfig;
  motion?: MotionConfig;
  depth?: DepthConfig;
  /** Arbitrary CSS custom properties injected onto :root */
  tokens?: Record<string, string>;
}

// ─── Context Value ────────────────────────────────────────────────────────────

export interface C7OneContextValue {
  mode: DesignMode;
  setMode: (mode: DesignMode) => void;

  colors: ThemeTokens;
  setColors: (colors: Partial<ThemeTokens>) => void;

  shape: Required<ShapeConfig>;
  setShape: (shape: Partial<ShapeConfig>) => void;

  motion: Required<MotionConfig>;
  setMotion: (motion: Partial<MotionConfig>) => void;

  depth: Required<DepthConfig>;
  setDepth: (depth: Partial<DepthConfig>) => void;

  tokens: Record<string, string>;
  setToken: (name: string, value: string) => void;
  injectTokens: (tokens: Record<string, string>) => void;
}

// ─── Mode Preset ──────────────────────────────────────────────────────────────

export interface ModePreset {
  tokens: Partial<ThemeTokens> & Partial<Record<string, string>>;
  /** CSS class applied to :root when this mode is active */
  className?: string;
}
