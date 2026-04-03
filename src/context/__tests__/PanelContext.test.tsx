import { renderHook, act } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PanelVisibilityProvider,
  usePanelVisibility,
  usePanelContext,
} from "../PanelContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PanelVisibilityProvider>{children}</PanelVisibilityProvider>
);

/** Render usePanelVisibility for a given panel id inside the provider. */
function renderPanel(id: string) {
  return renderHook(() => usePanelVisibility(id), { wrapper });
}

// ─── Default visibility ────────────────────────────────────────────────────────

describe("usePanelVisibility — default state", () => {
  it("a panel that has never been touched is visible by default", () => {
    const { result } = renderPanel("editor");
    expect(result.current.visible).toBe(true);
  });

  it("two separate panels are both visible by default", () => {
    const { result: a } = renderPanel("sidebar");
    const { result: b } = renderPanel("terminal");
    expect(a.current.visible).toBe(true);
    expect(b.current.visible).toBe(true);
  });
});

// ─── hide ─────────────────────────────────────────────────────────────────────

describe("usePanelVisibility — hide()", () => {
  it("hide() makes the panel not visible", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.hide());
    expect(result.current.visible).toBe(false);
  });

  it("hide() on an already-hidden panel keeps it hidden", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.hide());
    act(() => result.current.hide());
    expect(result.current.visible).toBe(false);
  });
});

// ─── show ─────────────────────────────────────────────────────────────────────

describe("usePanelVisibility — show()", () => {
  it("show() after hide() restores visibility", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.hide());
    act(() => result.current.show());
    expect(result.current.visible).toBe(true);
  });

  it("show() on an already-visible panel keeps it visible", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.show()); // already visible
    expect(result.current.visible).toBe(true);
  });
});

// ─── toggle ───────────────────────────────────────────────────────────────────

describe("usePanelVisibility — toggle()", () => {
  it("toggle() from default (visible) hides the panel", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.toggle());
    expect(result.current.visible).toBe(false);
  });

  it("toggle() from hidden shows the panel", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.hide());
    act(() => result.current.toggle());
    expect(result.current.visible).toBe(true);
  });

  it("toggle() twice from default returns to visible", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.toggle()); // → hidden
    act(() => result.current.toggle()); // → visible
    expect(result.current.visible).toBe(true);
  });

  it("toggle() three times from default ends hidden", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.toggle()); // → hidden
    act(() => result.current.toggle()); // → visible
    act(() => result.current.toggle()); // → hidden
    expect(result.current.visible).toBe(false);
  });
});

// ─── Panel isolation — operations on one panel must not affect others ──────────

describe("usePanelVisibility — panel isolation", () => {
  /** Render two panels sharing the same provider. */
  function renderTwo(idA: string, idB: string) {
    const hookA = renderHook(() => usePanelVisibility(idA), { wrapper });
    const hookB = renderHook(() => usePanelVisibility(idB), { wrapper });
    return { hookA, hookB };
  }

  it("hiding panel A does not hide panel B", () => {
    const { hookA, hookB } = renderTwo("sidebar", "editor");
    act(() => hookA.result.current.hide());
    expect(hookA.result.current.visible).toBe(false);
    expect(hookB.result.current.visible).toBe(true);
  });

  it("showing panel A does not change panel B's hidden state", () => {
    const { hookA, hookB } = renderTwo("sidebar", "editor");
    act(() => hookB.result.current.hide()); // hide B
    act(() => hookA.result.current.show()); // show A (already visible)
    expect(hookB.result.current.visible).toBe(false); // B still hidden
  });

  it("toggling panel A does not toggle panel B", () => {
    const { hookA, hookB } = renderTwo("sidebar", "editor");
    act(() => hookA.result.current.toggle()); // A → hidden
    expect(hookA.result.current.visible).toBe(false);
    expect(hookB.result.current.visible).toBe(true); // B unaffected
  });

  it("panels with different ids are fully independent through multiple ops", () => {
    const { hookA, hookB } = renderTwo("panel-left", "panel-right");
    act(() => hookA.result.current.hide());
    act(() => hookB.result.current.toggle()); // B: default(true) → false
    expect(hookA.result.current.visible).toBe(false);
    expect(hookB.result.current.visible).toBe(false);
    act(() => hookA.result.current.show());
    expect(hookA.result.current.visible).toBe(true);
    expect(hookB.result.current.visible).toBe(false); // B unchanged
  });
});

// ─── Operation sequences ──────────────────────────────────────────────────────

describe("usePanelVisibility — operation sequences", () => {
  it("hide → toggle → visible", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.hide());
    act(() => result.current.toggle());
    expect(result.current.visible).toBe(true);
  });

  it("toggle → show → visible", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.toggle()); // → false
    act(() => result.current.show());   // → true
    expect(result.current.visible).toBe(true);
  });

  it("show → hide → toggle → visible", () => {
    const { result } = renderPanel("editor");
    act(() => result.current.show());
    act(() => result.current.hide());
    act(() => result.current.toggle());
    expect(result.current.visible).toBe(true);
  });
});

// ─── Errors outside provider ──────────────────────────────────────────────────

describe("usePanelVisibility / usePanelContext — outside provider", () => {
  beforeEach(() => {
    // Suppress React's uncaught error output for these throw tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("usePanelVisibility throws when used outside PanelVisibilityProvider", () => {
    expect(() => renderHook(() => usePanelVisibility("x"))).toThrow(
      "usePanelVisibility must be inside <PanelRoot>"
    );
  });

  it("usePanelContext throws when used outside PanelVisibilityProvider", () => {
    expect(() => renderHook(() => usePanelContext())).toThrow(
      "Panel component must be inside <PanelRoot>"
    );
  });
});
