import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  C7OneConfig,
  C7OneContextValue,
  DepthConfig,
  DesignMode,
  MotionConfig,
  ShapeConfig,
  ThemeTokens,
} from '../ccc/types'
import { applyModeClass, injectVar, injectVars } from '../ccc/inject'
import { dark } from '../ccc/themes/dark'
import * as modes from '../ccc/modes'

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SHAPE: Required<ShapeConfig> = {
  radius: '0.375rem',
  borderWidth: '1px',
}

const DEFAULT_MOTION: Required<MotionConfig> = {
  transitionSpeed: '200ms',
}

const DEFAULT_DEPTH: Required<DepthConfig> = {
  shadowIntensity: 0,
}

// ─── Context ─────────────────────────────────────────────────────────────────

const C7OneContext = createContext<C7OneContextValue | null>(null)

// ─── Provider Props ───────────────────────────────────────────────────────────

export interface C7OneProviderProps {
  children: React.ReactNode
  defaultMode?: DesignMode
  config?: C7OneConfig
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function C7OneProvider({
  children,
  defaultMode = 'classic',
  config = {},
}: C7OneProviderProps) {
  const [mode, setModeState] = useState<DesignMode>(defaultMode)
  const [colors, setColorsState] = useState<ThemeTokens>({ ...dark, ...config.colors })
  const [shape, setShapeState] = useState<Required<ShapeConfig>>({
    ...DEFAULT_SHAPE,
    ...config.shape,
  })
  const [motion, setMotionState] = useState<Required<MotionConfig>>({
    ...DEFAULT_MOTION,
    ...config.motion,
  })
  const [depth, setDepthState] = useState<Required<DepthConfig>>({
    ...DEFAULT_DEPTH,
    ...config.depth,
  })
  const [tokens, setTokensState] = useState<Record<string, string>>(
    config.tokens ?? {},
  )

  // Apply a mode preset, then let explicit overrides win on top
  const applyMode = useCallback(
    (next: DesignMode) => {
      const preset = modes[next]
      injectVars(preset.tokens as Record<string, string>)
      applyModeClass(preset.className)
    },
    [],
  )

  // ── Flush all state to CSS on mount / state change ────────────────────────
  const isFirst = useRef(true)

  useEffect(() => {
    // Colors
    injectVars(colors as unknown as Record<string, string>)
    // Shape
    injectVar('--radius', shape.radius)
    injectVar('--border-width', shape.borderWidth)
    // Motion
    injectVar('--transition-speed', motion.transitionSpeed)
    // Depth
    injectVar('--shadow-intensity', String(depth.shadowIntensity))
    // Custom tokens
    injectVars(tokens)
    // Mode (on first run respect the defaultMode preset)
    if (isFirst.current) {
      applyMode(mode)
      isFirst.current = false
    }
  }, [colors, shape, motion, depth, tokens]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Setters ───────────────────────────────────────────────────────────────

  const setMode = useCallback(
    (next: DesignMode) => {
      applyMode(next)
      setModeState(next)
      // Re-apply explicit overrides on top of the preset
      injectVars(colors as unknown as Record<string, string>)
      injectVar('--radius', shape.radius)
      injectVar('--border-width', shape.borderWidth)
      injectVar('--transition-speed', motion.transitionSpeed)
      injectVar('--shadow-intensity', String(depth.shadowIntensity))
      injectVars(tokens)
    },
    [applyMode, colors, shape, motion, depth, tokens],
  )

  const setColors = useCallback((next: Partial<ThemeTokens>) => {
    setColorsState(prev => {
      const merged = { ...prev, ...next }
      injectVars(merged as unknown as Record<string, string>)
      return merged
    })
  }, [])

  const setShape = useCallback((next: Partial<ShapeConfig>) => {
    setShapeState(prev => {
      const merged = { ...prev, ...next }
      if (next.radius) injectVar('--radius', merged.radius)
      if (next.borderWidth) injectVar('--border-width', merged.borderWidth)
      return merged
    })
  }, [])

  const setMotion = useCallback((next: Partial<MotionConfig>) => {
    setMotionState(prev => {
      const merged = { ...prev, ...next }
      if (next.transitionSpeed) injectVar('--transition-speed', merged.transitionSpeed)
      return merged
    })
  }, [])

  const setDepth = useCallback((next: Partial<DepthConfig>) => {
    setDepthState(prev => {
      const merged = { ...prev, ...next }
      if (next.shadowIntensity !== undefined)
        injectVar('--shadow-intensity', String(merged.shadowIntensity))
      return merged
    })
  }, [])

  const setToken = useCallback((name: string, value: string) => {
    injectVar(name, value)
    setTokensState(prev => ({ ...prev, [name]: value }))
  }, [])

  const injectTokens = useCallback((next: Record<string, string>) => {
    injectVars(next)
    setTokensState(prev => ({ ...prev, ...next }))
  }, [])

  const value = useMemo<C7OneContextValue>(
    () => ({
      mode, setMode,
      colors, setColors,
      shape, setShape,
      motion, setMotion,
      depth, setDepth,
      tokens, setToken, injectTokens,
    }),
    [mode, setMode, colors, setColors, shape, setShape, motion, setMotion, depth, setDepth, tokens, setToken, injectTokens],
  )

  return (
    <C7OneContext.Provider value={value}>
      {children}
    </C7OneContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useC7One(): C7OneContextValue {
  const ctx = useContext(C7OneContext)
  if (!ctx) throw new Error('useC7One must be used inside <C7OneProvider>')
  return ctx
}
