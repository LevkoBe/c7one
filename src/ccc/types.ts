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
  "--color-shadow": string;
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
  /**
   * Gap in pixels between floating panel windows. 0 (default) recreates the
   * classic seamless split look; values > 0 produce the floating-card aesthetic
   * where the primary window is visible in the gaps between panels.
   */
  splitMargin?: number;
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

  /** Flat map of every active token by CSS var name. */
  getAllTokens: () => Record<string, string>;
  /** Set any token by CSS var name — routes to the correct typed setter internally. */
  setTokenValue: (name: string, value: string) => void;

  /** Gap in pixels between floating panels. Sourced from C7OneConfig.splitMargin. */
  splitMargin: number;
}

// ─── Mode Preset ──────────────────────────────────────────────────────────────

export interface ModePreset {
  tokens: Partial<ThemeTokens> & Partial<Record<string, string>>;
  /** CSS class applied to :root when this mode is active */
  className?: string;
}
