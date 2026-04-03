import { renderHook, act } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { classic } from "../../ccc/modes/classic";
import { glass } from "../../ccc/modes/glass";
import { minimal } from "../../ccc/modes/minimal";
import { neo } from "../../ccc/modes/neo";
import { dark } from "../../ccc/themes/dark";
import { light } from "../../ccc/themes/light";
import { C7OneProvider } from "../C7OneContext";
import { useC7One } from "../C7OneContext";
import type { DesignMode } from "../../ccc/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = () => document.documentElement;
const getVar = (name: string) => root().style.getPropertyValue(name);
const MODE_CLASSES = ["design-neo", "design-glass", "design-minimal"] as const;
const activeClasses = () => MODE_CLASSES.filter((c) => root().classList.contains(c));

/** Render useC7One inside a provider with the given props. */
function renderWithProvider(defaultMode: DesignMode = "classic", config = {}) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <C7OneProvider defaultMode={defaultMode} config={config}>
      {children}
    </C7OneProvider>
  );
  return renderHook(() => useC7One(), { wrapper });
}

beforeEach(() => {
  root().removeAttribute("style");
  root().className = "";
});
afterEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

// ─── Mount: initial state syncs with defaultMode ───────────────────────────────

describe("C7OneProvider — mount with defaultMode", () => {
  const modes = [
    { name: "classic" as DesignMode, preset: classic },
    { name: "neo" as DesignMode, preset: neo },
    { name: "glass" as DesignMode, preset: glass },
    { name: "minimal" as DesignMode, preset: minimal },
  ];

  for (const { name, preset } of modes) {
    const tokens = preset.tokens as Record<string, string>;

    it(`defaultMode="${name}": --radius is ${tokens["--radius"]} on :root`, () => {
      renderWithProvider(name);
      expect(getVar("--radius")).toBe(tokens["--radius"]);
    });

    it(`defaultMode="${name}": --border-width is ${tokens["--border-width"]} on :root`, () => {
      renderWithProvider(name);
      expect(getVar("--border-width")).toBe(tokens["--border-width"]);
    });

    it(`defaultMode="${name}": --transition-speed is ${tokens["--transition-speed"]} on :root`, () => {
      renderWithProvider(name);
      expect(getVar("--transition-speed")).toBe(tokens["--transition-speed"]);
    });

    it(`defaultMode="${name}": --shadow-intensity is ${tokens["--shadow-intensity"]} on :root`, () => {
      renderWithProvider(name);
      expect(getVar("--shadow-intensity")).toBe(tokens["--shadow-intensity"]);
    });

    it(`defaultMode="${name}": hook returns matching shape.radius`, () => {
      const { result } = renderWithProvider(name);
      expect(result.current.shape.radius).toBe(tokens["--radius"]);
    });

    it(`defaultMode="${name}": hook returns matching motion.transitionSpeed`, () => {
      const { result } = renderWithProvider(name);
      expect(result.current.motion.transitionSpeed).toBe(tokens["--transition-speed"]);
    });

    it(`defaultMode="${name}": hook returns matching depth.shadowIntensity`, () => {
      const { result } = renderWithProvider(name);
      expect(result.current.depth.shadowIntensity).toBe(
        parseFloat(tokens["--shadow-intensity"])
      );
    });
  }

  it('defaultMode="classic": no mode class on :root', () => {
    renderWithProvider("classic");
    expect(activeClasses()).toHaveLength(0);
  });

  it('defaultMode="neo": design-neo class on :root', () => {
    renderWithProvider("neo");
    expect(root().classList.contains("design-neo")).toBe(true);
  });

  it('defaultMode="glass": design-glass class on :root', () => {
    renderWithProvider("glass");
    expect(root().classList.contains("design-glass")).toBe(true);
  });

  it('defaultMode="minimal": design-minimal class on :root', () => {
    renderWithProvider("minimal");
    expect(root().classList.contains("design-minimal")).toBe(true);
  });

  it("config.shape overrides the mode preset on mount", () => {
    renderWithProvider("neo", { shape: { radius: "2rem" } });
    // config wins over neo's 0.625rem
    expect(getVar("--radius")).toBe("2rem");
  });

  it("config.depth overrides the mode preset on mount", () => {
    renderWithProvider("neo", { depth: { shadowIntensity: 99 } });
    expect(getVar("--shadow-intensity")).toBe("99");
  });
});

// ─── setMode: THE BUG — mode tokens must not be overwritten by stale state ────
//
// This is the exact regression that was broken: setMode applied the new mode's
// tokens, then immediately re-injected the old state values on top, making mode
// switches invisible. Every test here would have failed before the fix.

describe("setMode — DOM tokens update immediately and correctly", () => {
  const allModes = [
    { name: "classic" as DesignMode, preset: classic },
    { name: "neo" as DesignMode, preset: neo },
    { name: "glass" as DesignMode, preset: glass },
    { name: "minimal" as DesignMode, preset: minimal },
  ];

  for (const from of allModes) {
    for (const to of allModes) {
      if (from.name === to.name) continue;
      const toTokens = to.preset.tokens as Record<string, string>;

      it(`setMode: ${from.name} → ${to.name}: --radius becomes ${toTokens["--radius"]}`, () => {
        const { result } = renderWithProvider(from.name);
        act(() => result.current.setMode(to.name));
        expect(getVar("--radius")).toBe(toTokens["--radius"]);
      });

      it(`setMode: ${from.name} → ${to.name}: --border-width becomes ${toTokens["--border-width"]}`, () => {
        const { result } = renderWithProvider(from.name);
        act(() => result.current.setMode(to.name));
        expect(getVar("--border-width")).toBe(toTokens["--border-width"]);
      });

      it(`setMode: ${from.name} → ${to.name}: --shadow-intensity becomes ${toTokens["--shadow-intensity"]}`, () => {
        const { result } = renderWithProvider(from.name);
        act(() => result.current.setMode(to.name));
        expect(getVar("--shadow-intensity")).toBe(toTokens["--shadow-intensity"]);
      });

      it(`setMode: ${from.name} → ${to.name}: --transition-speed becomes ${toTokens["--transition-speed"]}`, () => {
        const { result } = renderWithProvider(from.name);
        act(() => result.current.setMode(to.name));
        expect(getVar("--transition-speed")).toBe(toTokens["--transition-speed"]);
      });
    }
  }
});

describe("setMode — class swaps correctly", () => {
  const allModes: DesignMode[] = ["classic", "neo", "glass", "minimal"];

  for (const from of allModes) {
    for (const to of allModes) {
      if (from === to) continue;

      it(`setMode: ${from} → ${to}: at most one mode class active`, () => {
        const { result } = renderWithProvider(from);
        act(() => result.current.setMode(to));
        expect(activeClasses().length).toBeLessThanOrEqual(1);
      });

      it(`setMode: ${from} → ${to}: previous class removed`, () => {
        const fromPreset = { classic, neo, glass, minimal }[from];
        const { result } = renderWithProvider(from);
        act(() => result.current.setMode(to));
        if (fromPreset.className) {
          expect(root().classList.contains(fromPreset.className)).toBe(false);
        }
      });

      it(`setMode: ${from} → ${to}: new class applied`, () => {
        const toPreset = { classic, neo, glass, minimal }[to];
        const { result } = renderWithProvider(from);
        act(() => result.current.setMode(to));
        if (toPreset.className) {
          expect(root().classList.contains(toPreset.className)).toBe(true);
        } else {
          expect(activeClasses()).toHaveLength(0);
        }
      });
    }
  }
});

describe("setMode — React state syncs with the new mode", () => {
  it("shape.radius updates to neo value after setMode('neo')", () => {
    const { result } = renderWithProvider("classic");
    act(() => result.current.setMode("neo"));
    expect(result.current.shape.radius).toBe(neo.tokens["--radius"]);
  });

  it("shape.borderWidth updates to minimal value after setMode('minimal')", () => {
    const { result } = renderWithProvider("neo");
    act(() => result.current.setMode("minimal"));
    expect(result.current.shape.borderWidth).toBe(minimal.tokens["--border-width"]);
  });

  it("motion.transitionSpeed updates after setMode", () => {
    const { result } = renderWithProvider("classic");
    act(() => result.current.setMode("glass"));
    expect(result.current.motion.transitionSpeed).toBe(glass.tokens["--transition-speed"]);
  });

  it("depth.shadowIntensity updates after setMode", () => {
    const { result } = renderWithProvider("classic");
    act(() => result.current.setMode("neo"));
    expect(result.current.depth.shadowIntensity).toBe(
      parseFloat(neo.tokens["--shadow-intensity"] as string)
    );
  });

  it("mode field on context updates to the new mode", () => {
    const { result } = renderWithProvider("classic");
    act(() => result.current.setMode("glass"));
    expect(result.current.mode).toBe("glass");
  });
});

// ─── setMode does NOT clobber colors or custom tokens ─────────────────────────

describe("setMode — colors and custom tokens are preserved", () => {
  it("colors remain on :root after setMode", () => {
    const { result } = renderWithProvider("classic", { colors: light });
    act(() => result.current.setMode("neo"));
    expect(getVar("--color-bg-base")).toBe(light["--color-bg-base"]);
    expect(getVar("--color-accent")).toBe(light["--color-accent"]);
  });

  it("custom tokens remain on :root after setMode", () => {
    const { result } = renderWithProvider("classic", {
      tokens: { "--sidebar-width": "260px" },
    });
    act(() => result.current.setMode("glass"));
    expect(getVar("--sidebar-width")).toBe("260px");
  });
});

// ─── Other setters don't regress ─────────────────────────────────────────────

describe("setColors — injects all 12 color tokens onto :root", () => {
  it("injecting light theme sets --color-bg-base on :root", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setColors(light));
    expect(getVar("--color-bg-base")).toBe(light["--color-bg-base"]);
  });

  it("injecting dark then light: light values win", () => {
    const { result } = renderWithProvider("classic", { colors: dark });
    act(() => result.current.setColors(light));
    expect(getVar("--color-bg-base")).toBe(light["--color-bg-base"]);
  });
});

describe("setShape — injects shape tokens onto :root", () => {
  it("setShape updates --radius on :root", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setShape({ radius: "2rem" }));
    expect(getVar("--radius")).toBe("2rem");
  });

  it("setShape updates --border-width on :root", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setShape({ borderWidth: "3px" }));
    expect(getVar("--border-width")).toBe("3px");
  });
});

describe("setMotion — injects motion tokens onto :root", () => {
  it("setMotion updates --transition-speed on :root", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setMotion({ transitionSpeed: "500ms" }));
    expect(getVar("--transition-speed")).toBe("500ms");
  });
});

describe("setDepth — injects depth tokens onto :root", () => {
  it("setDepth updates --shadow-intensity on :root", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setDepth({ shadowIntensity: 1.5 }));
    expect(getVar("--shadow-intensity")).toBe("1.5");
  });
});

describe("setToken / injectTokens — custom tokens", () => {
  it("setToken injects a single custom var", () => {
    const { result } = renderWithProvider();
    act(() => result.current.setToken("--graph-node-color", "#f00"));
    expect(getVar("--graph-node-color")).toBe("#f00");
  });

  it("injectTokens injects a map of custom vars", () => {
    const { result } = renderWithProvider();
    act(() =>
      result.current.injectTokens({
        "--sidebar-width": "300px",
        "--panel-gap": "8px",
      })
    );
    expect(getVar("--sidebar-width")).toBe("300px");
    expect(getVar("--panel-gap")).toBe("8px");
  });
});

describe("useC7One outside provider", () => {
  it("throws a descriptive error when used outside C7OneProvider", () => {
    // Suppress React's error boundary noise for this test
    const consoleError = console.error;
    console.error = () => {};
    expect(() => renderHook(() => useC7One())).toThrow(
      "useC7One must be used inside <C7OneProvider>"
    );
    console.error = consoleError;
  });
});

// ─── Mount: all 12 color tokens injected onto :root ───────────────────────────

const COLOR_TOKENS = [
  "--color-bg-base",
  "--color-bg-elevated",
  "--color-bg-overlay",
  "--color-fg-primary",
  "--color-fg-muted",
  "--color-fg-disabled",
  "--color-accent",
  "--color-accent-hover",
  "--color-success",
  "--color-warning",
  "--color-error",
  "--color-border",
] as const;

describe("C7OneProvider mount — default dark color tokens on :root", () => {
  for (const token of COLOR_TOKENS) {
    it(`injects ${token} with the dark theme value`, () => {
      renderWithProvider();
      expect(getVar(token)).toBe(dark[token]);
    });
  }
});

describe("C7OneProvider mount — config.colors override", () => {
  for (const token of COLOR_TOKENS) {
    it(`config.colors (light) sets ${token} on :root`, () => {
      renderWithProvider("classic", { colors: light });
      expect(getVar(token)).toBe(light[token]);
    });
  }
});

describe("C7OneProvider mount — colors survive mode injection", () => {
  it("all 12 dark tokens remain correct after setMode('neo')", () => {
    const { result } = renderWithProvider("classic");
    act(() => result.current.setMode("neo"));
    for (const token of COLOR_TOKENS) {
      expect(getVar(token)).toBe(dark[token]);
    }
  });

  it("all 12 light tokens remain correct after setMode('minimal')", () => {
    const { result } = renderWithProvider("classic", { colors: light });
    act(() => result.current.setMode("minimal"));
    for (const token of COLOR_TOKENS) {
      expect(getVar(token)).toBe(light[token]);
    }
  });
});
