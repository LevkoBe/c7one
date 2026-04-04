import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  C7OneConfig,
  C7OneContextValue,
  DepthConfig,
  DesignMode,
  MotionConfig,
  ShapeConfig,
  ThemeTokens,
} from "../ccc/types";
import { applyModeClass, injectVar, injectVars } from "../ccc/inject";
import { dark } from "../ccc/themes/dark";
import * as modes from "../ccc/modes";

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SHAPE: Required<ShapeConfig> = {
  radius: "0.375rem",
  borderWidth: "1px",
};

const DEFAULT_MOTION: Required<MotionConfig> = {
  transitionSpeed: "200ms",
};

const DEFAULT_DEPTH: Required<DepthConfig> = {
  shadowIntensity: 0,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const C7OneContext = createContext<C7OneContextValue | null>(null);

// ─── Provider Props ───────────────────────────────────────────────────────────

export interface C7OneProviderProps {
  children: React.ReactNode;
  defaultMode?: DesignMode;
  config?: C7OneConfig;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function C7OneProvider({
  children,
  defaultMode = "classic",
  config = {},
}: C7OneProviderProps) {
  // Initialize shape/motion/depth from the mode preset first, then let
  // explicit config values win on top. This keeps state in sync with the DOM.
  const initialPresetTokens = modes[defaultMode].tokens as Record<string, string>;

  const [mode, setModeState] = useState<DesignMode>(defaultMode);
  const [colors, setColorsState] = useState<ThemeTokens>({
    ...dark,
    ...config.colors,
  });
  const [shape, setShapeState] = useState<Required<ShapeConfig>>({
    ...DEFAULT_SHAPE,
    ...(initialPresetTokens["--radius"] ? { radius: initialPresetTokens["--radius"] } : {}),
    ...(initialPresetTokens["--border-width"] ? { borderWidth: initialPresetTokens["--border-width"] } : {}),
    ...config.shape,
  });
  const [motion, setMotionState] = useState<Required<MotionConfig>>({
    ...DEFAULT_MOTION,
    ...(initialPresetTokens["--transition-speed"] ? { transitionSpeed: initialPresetTokens["--transition-speed"] } : {}),
    ...config.motion,
  });
  const [depth, setDepthState] = useState<Required<DepthConfig>>({
    ...DEFAULT_DEPTH,
    ...(initialPresetTokens["--shadow-intensity"] !== undefined
      ? { shadowIntensity: parseFloat(initialPresetTokens["--shadow-intensity"]) }
      : {}),
    ...config.depth,
  });
  const [tokens, setTokensState] = useState<Record<string, string>>(
    config.tokens ?? {},
  );

  // Apply a mode preset, then let explicit overrides win on top
  const applyMode = useCallback((next: DesignMode) => {
    const preset = modes[next];
    injectVars(preset.tokens as Record<string, string>);
    applyModeClass(preset.className);
  }, []);

  // ── Flush all state to CSS on mount / state change ────────────────────────
  const isFirst = useRef(true);

  useEffect(() => {
    // Colors
    injectVars(colors as unknown as Record<string, string>);
    // Shape
    injectVar("--radius", shape.radius);
    injectVar("--border-width", shape.borderWidth);
    // Motion
    injectVar("--transition-speed", motion.transitionSpeed);
    // Depth
    injectVar("--shadow-intensity", String(depth.shadowIntensity));
    // Custom tokens
    injectVars(tokens);
    // On first run, apply the mode class. Tokens are already handled above via
    // state (which is initialized from the mode preset in useState). Calling
    // applyMode() here would overwrite config overrides with the raw preset.
    if (isFirst.current) {
      applyModeClass(modes[mode].className);
      isFirst.current = false;
    }
  }, [colors, shape, motion, depth, tokens]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Setters ───────────────────────────────────────────────────────────────

  const setMode = useCallback(
    (next: DesignMode) => {
      const preset = modes[next];
      const presetTokens = preset.tokens as Record<string, string>;

      // 1. Apply the mode: class + its shape/motion/depth tokens
      applyModeClass(preset.className);
      injectVars(presetTokens);
      // 2. Re-inject colors and custom tokens — these are not part of mode presets
      injectVars(colors as unknown as Record<string, string>);
      injectVars(tokens);

      // 3. Sync React state to the mode's values so sliders/UI stay consistent.
      //    Without this, subsequent useEffect runs would overwrite the mode tokens
      //    with stale state values, making mode switches appear invisible.
      setModeState(next);
      setShapeState({
        radius: (presetTokens["--radius"] ?? DEFAULT_SHAPE.radius) as string,
        borderWidth: (presetTokens["--border-width"] ?? DEFAULT_SHAPE.borderWidth) as string,
      });
      setMotionState({
        transitionSpeed: (presetTokens["--transition-speed"] ?? DEFAULT_MOTION.transitionSpeed) as string,
      });
      setDepthState({
        shadowIntensity:
          presetTokens["--shadow-intensity"] !== undefined
            ? parseFloat(presetTokens["--shadow-intensity"])
            : DEFAULT_DEPTH.shadowIntensity,
      });
    },
    [colors, tokens], // shape/motion/depth removed — no longer read from state here
  );

  const setColors = useCallback((next: Partial<ThemeTokens>) => {
    setColorsState((prev) => {
      const merged = { ...prev, ...next };
      injectVars(merged as unknown as Record<string, string>);
      return merged;
    });
  }, []);

  const setShape = useCallback((next: Partial<ShapeConfig>) => {
    setShapeState((prev) => {
      const merged = { ...prev, ...next };
      if (next.radius) injectVar("--radius", merged.radius);
      if (next.borderWidth) injectVar("--border-width", merged.borderWidth);
      return merged;
    });
  }, []);

  const setMotion = useCallback((next: Partial<MotionConfig>) => {
    setMotionState((prev) => {
      const merged = { ...prev, ...next };
      if (next.transitionSpeed)
        injectVar("--transition-speed", merged.transitionSpeed);
      return merged;
    });
  }, []);

  const setDepth = useCallback((next: Partial<DepthConfig>) => {
    setDepthState((prev) => {
      const merged = { ...prev, ...next };
      if (next.shadowIntensity !== undefined)
        injectVar("--shadow-intensity", String(merged.shadowIntensity));
      return merged;
    });
  }, []);

  const setToken = useCallback((name: string, value: string) => {
    injectVar(name, value);
    setTokensState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const injectTokens = useCallback((next: Record<string, string>) => {
    injectVars(next);
    setTokensState((prev) => ({ ...prev, ...next }));
  }, []);

  const getAllTokens = useCallback(
    (): Record<string, string> => ({
      ...(colors as unknown as Record<string, string>),
      "--radius": shape.radius,
      "--border-width": shape.borderWidth,
      "--transition-speed": motion.transitionSpeed,
      "--shadow-intensity": String(depth.shadowIntensity),
      ...tokens,
    }),
    [colors, shape, motion, depth, tokens],
  );

  const setTokenValue = useCallback(
    (name: string, value: string) => {
      if (name in colors) {
        setColors({ [name]: value } as Partial<ThemeTokens>);
      } else if (name === "--radius") {
        setShape({ radius: value });
      } else if (name === "--border-width") {
        setShape({ borderWidth: value });
      } else if (name === "--transition-speed") {
        setMotion({ transitionSpeed: value });
      } else if (name === "--shadow-intensity") {
        setDepth({ shadowIntensity: parseFloat(value) });
      } else {
        setToken(name, value);
      }
    },
    [colors, setColors, setShape, setMotion, setDepth, setToken],
  );

  const value = useMemo<C7OneContextValue>(
    () => ({
      mode,
      setMode,
      colors,
      setColors,
      shape,
      setShape,
      motion,
      setMotion,
      depth,
      setDepth,
      tokens,
      setToken,
      injectTokens,
      getAllTokens,
      setTokenValue,
    }),
    [
      mode,
      setMode,
      colors,
      setColors,
      shape,
      setShape,
      motion,
      setMotion,
      depth,
      setDepth,
      tokens,
      setToken,
      injectTokens,
      getAllTokens,
      setTokenValue,
    ],
  );

  return (
    <C7OneContext.Provider value={value}>{children}</C7OneContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useC7One(): C7OneContextValue {
  const ctx = useContext(C7OneContext);
  if (!ctx) throw new Error("useC7One must be used inside <C7OneProvider>");
  return ctx;
}
