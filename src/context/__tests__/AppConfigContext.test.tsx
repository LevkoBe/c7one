import { renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { AppConfigProvider, useAppConfig } from "../AppConfigContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithConfig<T>(config: T) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppConfigProvider config={config}>{children}</AppConfigProvider>
  );
  return renderHook(() => useAppConfig<T>(), { wrapper });
}

// ─── Returns the correct config value ─────────────────────────────────────────

describe("useAppConfig — returns provided config", () => {
  it("returns a flat string config", () => {
    const { result } = renderWithConfig("hello");
    expect(result.current).toBe("hello");
  });

  it("returns a flat number config", () => {
    const { result } = renderWithConfig(42);
    expect(result.current).toBe(42);
  });

  it("returns a simple object config by reference", () => {
    const config = { theme: "dark", version: 1 };
    const { result } = renderWithConfig(config);
    expect(result.current).toBe(config);
  });

  it("returns the correct string field from an object config", () => {
    const { result } = renderWithConfig({ name: "DigraVinci", debug: false });
    expect(result.current.name).toBe("DigraVinci");
  });

  it("returns the correct boolean field from an object config", () => {
    const { result } = renderWithConfig({ name: "DigraVinci", debug: false });
    expect(result.current.debug).toBe(false);
  });

  it("returns a nested object config correctly", () => {
    const config = {
      nodeColors: { default: "#6366f1", selected: "#22c55e" },
      edgeStyle: "curved" as const,
      defaultZoom: 1.5,
    };
    const { result } = renderWithConfig(config);
    expect(result.current.nodeColors.default).toBe("#6366f1");
    expect(result.current.edgeStyle).toBe("curved");
    expect(result.current.defaultZoom).toBe(1.5);
  });

  it("returns an array config correctly", () => {
    const config = ["dark", "light", "midnight"];
    const { result } = renderWithConfig(config);
    expect(result.current).toEqual(["dark", "light", "midnight"]);
  });

  it("returns a config with deeply nested arrays and objects", () => {
    const config = {
      categories: [
        { id: 1, label: "Work", color: "#6366f1" },
        { id: 2, label: "Health", color: "#22c55e" },
      ],
    };
    const { result } = renderWithConfig(config);
    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[0].label).toBe("Work");
    expect(result.current.categories[1].color).toBe("#22c55e");
  });
});

// ─── Typed generics ───────────────────────────────────────────────────────────

describe("useAppConfig — typed generics", () => {
  it("TypeScript generic parameter correctly types the return value", () => {
    type DigraVinciConfig = {
      nodeColors: Record<string, string>;
      edgeStyle: "curved" | "straight" | "elbow";
      defaultZoom: number;
    };

    const config: DigraVinciConfig = {
      nodeColors: { task: "#6366f1" },
      edgeStyle: "elbow",
      defaultZoom: 2,
    };
    const { result } = renderWithConfig<DigraVinciConfig>(config);
    // These property accesses only compile if the generic is applied correctly
    expect(result.current.edgeStyle).toBe("elbow");
    expect(result.current.defaultZoom).toBe(2);
    expect(result.current.nodeColors.task).toBe("#6366f1");
  });

  it("two providers with different config types coexist without interference", () => {
    type ConfigA = { mode: string };
    type ConfigB = { count: number };

    const configA: ConfigA = { mode: "fast" };
    const configB: ConfigB = { count: 99 };

    const { result: resultA } = renderWithConfig<ConfigA>(configA);
    const { result: resultB } = renderWithConfig<ConfigB>(configB);

    expect(resultA.current.mode).toBe("fast");
    expect(resultB.current.count).toBe(99);
  });
});

// ─── Config identity — same reference returned ─────────────────────────────────

describe("useAppConfig — config identity", () => {
  it("returns the exact same object reference as provided", () => {
    const config = { key: "value" };
    const { result } = renderWithConfig(config);
    expect(result.current).toBe(config); // reference equality, not deep equal
  });

  it("returns undefined fields as undefined (not null)", () => {
    const config = { a: 1 } as { a: number; b?: string };
    const { result } = renderWithConfig(config);
    expect(result.current.b).toBeUndefined();
  });
});

// ─── Errors outside provider ──────────────────────────────────────────────────

describe("useAppConfig — outside provider", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws a descriptive error when used outside AppConfigProvider", () => {
    expect(() => renderHook(() => useAppConfig())).toThrow(
      "useAppConfig must be used inside <AppConfigProvider>"
    );
  });
});
