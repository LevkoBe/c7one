import { createContext, useContext } from "react";

// ─── Public types & hook ──────────────────────────────────────────────────────

/**
 * Coordinates of the PRIMARY_WINDOW_ID slot, expressed relative to the
 * AppShell work area's top-left corner (same coordinate space as the canvas,
 * which renders at absolute inset-0 inside the work area).
 *
 * `ready` is false until the first ResizeObserver measurement fires. Canvases
 * should fall back to their own dimensions while ready === false.
 */
export interface PrimaryBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  ready: boolean;
}

const DEFAULT_BOUNDS: PrimaryBounds = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  ready: false,
};

export const PrimaryBoundsContext =
  createContext<PrimaryBounds>(DEFAULT_BOUNDS);

/**
 * Returns the position and size of the primary window slot within the AppShell
 * work area. Use this to align canvas content with the visible primary area.
 *
 * @example
 * function MyCanvas() {
 *   const { x, y, width, height, ready } = usePrimaryBounds();
 *   const cx = ready ? x + width / 2 : myWidth / 2;
 *   const cy = ready ? y + height / 2 : myHeight / 2;
 *   // center content at (cx, cy)
 * }
 */
export function usePrimaryBounds(): PrimaryBounds {
  return useContext(PrimaryBoundsContext);
}

// ─── Internal setter context ──────────────────────────────────────────────────
// PrimaryPlaceholder calls this with its raw viewport DOMRect.
// AppShell provides the implementation, which converts to work-area-relative
// coords before publishing to PrimaryBoundsContext.

export const PrimaryRectSetterContext = createContext<
  ((rect: DOMRect) => void) | null
>(null);
