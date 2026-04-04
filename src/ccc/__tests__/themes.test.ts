import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { injectVars } from "../inject";
import { dark } from "../themes/dark";
import { forest } from "../themes/forest";
import { light } from "../themes/light";
import { midnight } from "../themes/midnight";
import { rose } from "../themes/rose";
import { slate } from "../themes/slate";
import type { ThemeTokens } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = () => document.documentElement;
const getVar = (name: string) => root().style.getPropertyValue(name);
// ThemeTokens is a named interface without an index signature, so we need this
// cast to pass it to injectVars which takes Record<string, string>.
const injectTheme = (theme: ThemeTokens) =>
  injectVars(theme as unknown as Record<string, string>);

const REQUIRED_TOKENS: (keyof ThemeTokens)[] = [
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
  "--color-shadow",
];

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

beforeEach(() => {
  root().removeAttribute("style");
});
afterEach(() => {
  root().removeAttribute("style");
});

// ─── Per-theme: data integrity + actual injection effect ──────────────────────

const allThemes: { name: string; theme: ThemeTokens }[] = [
  { name: "dark", theme: dark },
  { name: "light", theme: light },
  { name: "midnight", theme: midnight },
  { name: "forest", theme: forest },
  { name: "rose", theme: rose },
  { name: "slate", theme: slate },
];

for (const { name, theme } of allThemes) {
  describe(`${name} theme — data integrity`, () => {
    it("has all 13 required color tokens", () => {
      for (const token of REQUIRED_TOKENS) {
        expect(theme, `missing ${token}`).toHaveProperty(token);
      }
    });

    it("has exactly 13 tokens (no extras, no missing)", () => {
      expect(Object.keys(theme)).toHaveLength(13);
    });

    it("all token values are non-empty hex color strings", () => {
      for (const [key, value] of Object.entries(theme)) {
        expect(typeof value, `${key} should be a string`).toBe("string");
        expect(value, `${key} = "${value}" is not a valid hex color`).toMatch(HEX_COLOR);
      }
    });

    it("bg-elevated is distinct from bg-base (layering)", () => {
      expect(theme["--color-bg-elevated"]).not.toBe(theme["--color-bg-base"]);
    });

    it("bg-overlay is distinct from bg-elevated (depth)", () => {
      expect(theme["--color-bg-overlay"]).not.toBe(theme["--color-bg-elevated"]);
    });

    it("accent-hover is distinct from accent (hover state)", () => {
      expect(theme["--color-accent-hover"]).not.toBe(theme["--color-accent"]);
    });

    it("fg-muted is distinct from fg-primary (text hierarchy)", () => {
      expect(theme["--color-fg-muted"]).not.toBe(theme["--color-fg-primary"]);
    });
  });

  describe(`${name} theme — injection effect`, () => {
    beforeEach(() => injectTheme(theme));

    for (const token of REQUIRED_TOKENS) {
      it(`injectVars sets ${token} on :root to the theme value`, () => {
        expect(getVar(token)).toBe(theme[token]);
      });
    }
  });
}

// ─── Theme switching: all ordered pairs ───────────────────────────────────────
// Start from theme A, switch to theme B, verify B's values are live on :root.

describe("theme switching — tokens overwrite on switch", () => {
  for (const from of allThemes) {
    for (const to of allThemes) {
      if (from.name === to.name) continue;

      it(`${from.name} → ${to.name}: --color-bg-base becomes ${to.theme["--color-bg-base"]}`, () => {
        injectTheme(from.theme);
        injectTheme(to.theme);
        expect(getVar("--color-bg-base")).toBe(to.theme["--color-bg-base"]);
      });

      it(`${from.name} → ${to.name}: --color-accent becomes ${to.theme["--color-accent"]}`, () => {
        injectTheme(from.theme);
        injectTheme(to.theme);
        expect(getVar("--color-accent")).toBe(to.theme["--color-accent"]);
      });

      it(`${from.name} → ${to.name}: --color-fg-primary becomes ${to.theme["--color-fg-primary"]}`, () => {
        injectTheme(from.theme);
        injectTheme(to.theme);
        expect(getVar("--color-fg-primary")).toBe(to.theme["--color-fg-primary"]);
      });
    }
  }
});

// ─── Light theme specifics ────────────────────────────────────────────────────

describe("light theme specifics", () => {
  it("bg-base is #ffffff", () => {
    expect(light["--color-bg-base"]).toBe("#ffffff");
  });

  it("injecting light sets a bright bg-base on :root", () => {
    injectTheme(light);
    expect(getVar("--color-bg-base")).toBe("#ffffff");
  });

  it("fg-primary is a dark value (contrast on white)", () => {
    expect(light["--color-fg-primary"]).toMatch(/^#[0-2]/);
  });
});

// ─── Cross-theme invariants ───────────────────────────────────────────────────

describe("cross-theme invariants", () => {
  it("all themes have unique bg-base values (distinct visual identity)", () => {
    const bases = allThemes.map((t) => t.theme["--color-bg-base"]);
    expect(new Set(bases).size).toBe(bases.length);
  });

  it("dark and light share the same accent (brand consistency across the pair)", () => {
    expect(dark["--color-accent"]).toBe(light["--color-accent"]);
  });

  it("non-paired themes (midnight, forest, rose, slate) each have a unique accent", () => {
    const accents = [midnight, forest, rose, slate].map((t) => t["--color-accent"]);
    expect(new Set(accents).size).toBe(accents.length);
  });

  it("dark bg-base is darker than light bg-base", () => {
    const brightness = (hex: string) =>
      parseInt(hex.slice(1, 3), 16) +
      parseInt(hex.slice(3, 5), 16) +
      parseInt(hex.slice(5, 7), 16);
    expect(brightness(dark["--color-bg-base"])).toBeLessThan(brightness(light["--color-bg-base"]));
  });

  it("themes barrel re-exports all 6 themes as the exact same objects", async () => {
    const barrel = await import("../themes/index");
    expect(barrel.dark).toBe(dark);
    expect(barrel.light).toBe(light);
    expect(barrel.midnight).toBe(midnight);
    expect(barrel.forest).toBe(forest);
    expect(barrel.rose).toBe(rose);
    expect(barrel.slate).toBe(slate);
  });

  it("modes barrel re-exports all 4 mode presets as the exact same objects", async () => {
    const barrel = await import("../modes/index");
    const { classic } = await import("../modes/classic");
    const { neo } = await import("../modes/neo");
    const { glass } = await import("../modes/glass");
    const { minimal } = await import("../modes/minimal");
    expect(barrel.classic).toBe(classic);
    expect(barrel.neo).toBe(neo);
    expect(barrel.glass).toBe(glass);
    expect(barrel.minimal).toBe(minimal);
  });
});
