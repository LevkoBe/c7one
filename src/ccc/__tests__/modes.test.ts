import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyModeClass, injectVars } from "../inject";
import { classic } from "../modes/classic";
import { glass } from "../modes/glass";
import { minimal } from "../modes/minimal";
import { neo } from "../modes/neo";
import type { ModePreset } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = () => document.documentElement;
const getVar = (name: string) => root().style.getPropertyValue(name);
const MODE_CLASSES = ["design-neo", "design-glass", "design-minimal"] as const;
const activeClasses = () => MODE_CLASSES.filter((c) => root().classList.contains(c));

/** Apply a mode exactly as the provider would: inject tokens then swap the class. */
function activateMode(preset: ModePreset) {
  injectVars(preset.tokens as Record<string, string>);
  applyModeClass(preset.className);
}

beforeEach(() => {
  root().removeAttribute("style");
  root().className = "";
});
afterEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

// ─── Activation: each mode applied from a clean state ─────────────────────────

describe("classic mode — activation", () => {
  beforeEach(() => activateMode(classic));

  it("sets --radius to 0.375rem on :root", () => {
    expect(getVar("--radius")).toBe("0.375rem");
  });
  it("sets --border-width to 1px on :root", () => {
    expect(getVar("--border-width")).toBe("1px");
  });
  it("sets --transition-speed to 200ms on :root", () => {
    expect(getVar("--transition-speed")).toBe("200ms");
  });
  it("sets --shadow-intensity to 0 on :root", () => {
    expect(getVar("--shadow-intensity")).toBe("0");
  });
  it("does NOT add any mode class to :root", () => {
    expect(activeClasses()).toHaveLength(0);
  });
});

describe("neo mode — activation", () => {
  beforeEach(() => activateMode(neo));

  it("sets --radius to 0.625rem on :root", () => {
    expect(getVar("--radius")).toBe("0.625rem");
  });
  it("sets --border-width to 2px on :root", () => {
    expect(getVar("--border-width")).toBe("2px");
  });
  it("sets --transition-speed to 180ms on :root", () => {
    expect(getVar("--transition-speed")).toBe("180ms");
  });
  it("sets --shadow-intensity to 1 on :root", () => {
    expect(getVar("--shadow-intensity")).toBe("1");
  });
  it("adds design-neo class to :root", () => {
    expect(root().classList.contains("design-neo")).toBe(true);
  });
  it("adds exactly one mode class", () => {
    expect(activeClasses()).toHaveLength(1);
  });
});

describe("glass mode — activation", () => {
  beforeEach(() => activateMode(glass));

  it("sets --radius to 0.75rem on :root", () => {
    expect(getVar("--radius")).toBe("0.75rem");
  });
  it("sets --border-width to 1px on :root", () => {
    expect(getVar("--border-width")).toBe("1px");
  });
  it("sets --transition-speed to 220ms on :root", () => {
    expect(getVar("--transition-speed")).toBe("220ms");
  });
  it("sets --shadow-intensity to 0.5 on :root", () => {
    expect(getVar("--shadow-intensity")).toBe("0.5");
  });
  it("adds design-glass class to :root", () => {
    expect(root().classList.contains("design-glass")).toBe(true);
  });
  it("adds exactly one mode class", () => {
    expect(activeClasses()).toHaveLength(1);
  });
});

describe("minimal mode — activation", () => {
  beforeEach(() => activateMode(minimal));

  it("sets --radius to 1rem on :root", () => {
    expect(getVar("--radius")).toBe("1rem");
  });
  it("sets --border-width to 0px on :root", () => {
    expect(getVar("--border-width")).toBe("0px");
  });
  it("sets --transition-speed to 150ms on :root", () => {
    expect(getVar("--transition-speed")).toBe("150ms");
  });
  it("sets --shadow-intensity to 0 on :root", () => {
    expect(getVar("--shadow-intensity")).toBe("0");
  });
  it("adds design-minimal class to :root", () => {
    expect(root().classList.contains("design-minimal")).toBe(true);
  });
  it("adds exactly one mode class", () => {
    expect(activeClasses()).toHaveLength(1);
  });
});

// ─── Mode switching: every ordered pair ───────────────────────────────────────
// Each test starts from mode A already active, switches to mode B,
// then verifies B's tokens are live AND A's class is gone.

const allModes = [
  { name: "classic", preset: classic },
  { name: "neo", preset: neo },
  { name: "glass", preset: glass },
  { name: "minimal", preset: minimal },
] as const;

describe("mode switching — tokens update on switch", () => {
  for (const from of allModes) {
    for (const to of allModes) {
      if (from.name === to.name) continue;

      it(`${from.name} → ${to.name}: --radius is ${to.preset.tokens["--radius"]}`, () => {
        activateMode(from.preset);
        activateMode(to.preset);
        expect(getVar("--radius")).toBe(to.preset.tokens["--radius"]);
      });

      it(`${from.name} → ${to.name}: --shadow-intensity is ${to.preset.tokens["--shadow-intensity"]}`, () => {
        activateMode(from.preset);
        activateMode(to.preset);
        expect(getVar("--shadow-intensity")).toBe(to.preset.tokens["--shadow-intensity"]);
      });

      it(`${from.name} → ${to.name}: --border-width is ${to.preset.tokens["--border-width"]}`, () => {
        activateMode(from.preset);
        activateMode(to.preset);
        expect(getVar("--border-width")).toBe(to.preset.tokens["--border-width"]);
      });
    }
  }
});

describe("mode switching — class swaps correctly", () => {
  for (const from of allModes) {
    for (const to of allModes) {
      if (from.name === to.name) continue;

      it(`${from.name} → ${to.name}: only ${to.preset.className ?? "no"} class is active`, () => {
        activateMode(from.preset);
        activateMode(to.preset);

        if (to.preset.className) {
          expect(root().classList.contains(to.preset.className)).toBe(true);
        }

        // From's class must be gone (if it had one)
        if (from.preset.className) {
          expect(root().classList.contains(from.preset.className)).toBe(false);
        }

        // Never more than one mode class at a time
        expect(activeClasses().length).toBeLessThanOrEqual(1);
      });
    }
  }
});
