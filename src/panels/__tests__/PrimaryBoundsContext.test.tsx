import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import {
  usePrimaryBounds,
  PrimaryBoundsContext,
} from "../PrimaryBoundsContext";
import type { PrimaryBounds } from "../PrimaryBoundsContext";

// ─── usePrimaryBounds — default context ──────────────────────────────────────

describe("usePrimaryBounds — default context (no provider)", () => {
  it("ready is false", () => {
    const { result } = renderHook(() => usePrimaryBounds());
    expect(result.current.ready).toBe(false);
  });

  it("x is 0", () => {
    const { result } = renderHook(() => usePrimaryBounds());
    expect(result.current.x).toBe(0);
  });

  it("y is 0", () => {
    const { result } = renderHook(() => usePrimaryBounds());
    expect(result.current.y).toBe(0);
  });

  it("width is 0", () => {
    const { result } = renderHook(() => usePrimaryBounds());
    expect(result.current.width).toBe(0);
  });

  it("height is 0", () => {
    const { result } = renderHook(() => usePrimaryBounds());
    expect(result.current.height).toBe(0);
  });
});

// ─── usePrimaryBounds — with PrimaryBoundsContext.Provider ───────────────────

describe("usePrimaryBounds — with provider", () => {
  const bounds: PrimaryBounds = { x: 10, y: 20, width: 400, height: 300, ready: true };

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PrimaryBoundsContext.Provider value={bounds}>
        {children}
      </PrimaryBoundsContext.Provider>
    );
  }

  it("returns the exact bounds from the provider", () => {
    const { result } = renderHook(() => usePrimaryBounds(), { wrapper });
    expect(result.current).toEqual(bounds);
  });

  it("ready is true", () => {
    const { result } = renderHook(() => usePrimaryBounds(), { wrapper });
    expect(result.current.ready).toBe(true);
  });

  it("returns the correct x coordinate", () => {
    const { result } = renderHook(() => usePrimaryBounds(), { wrapper });
    expect(result.current.x).toBe(10);
  });

  it("returns the correct y coordinate", () => {
    const { result } = renderHook(() => usePrimaryBounds(), { wrapper });
    expect(result.current.y).toBe(20);
  });

  it("returns the correct width", () => {
    const { result } = renderHook(() => usePrimaryBounds(), { wrapper });
    expect(result.current.width).toBe(400);
  });

  it("returns the correct height", () => {
    const { result } = renderHook(() => usePrimaryBounds(), { wrapper });
    expect(result.current.height).toBe(300);
  });

  it("reflects updated bounds when provider value changes", () => {
    const updated: PrimaryBounds = { x: 50, y: 60, width: 800, height: 500, ready: true };
    const { result, rerender } = renderHook(() => usePrimaryBounds(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <PrimaryBoundsContext.Provider value={updated}>
          {children}
        </PrimaryBoundsContext.Provider>
      ),
    });
    rerender();
    expect(result.current.x).toBe(50);
    expect(result.current.width).toBe(800);
  });
});
