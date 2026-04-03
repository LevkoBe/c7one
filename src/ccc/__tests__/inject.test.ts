import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyModeClass, injectVar, injectVars } from "../inject";

const root = () => document.documentElement;
const getVar = (name: string) => root().style.getPropertyValue(name);

beforeEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

afterEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

describe("injectVars", () => {
  it("injects a single token onto :root", () => {
    injectVars({ "--color-accent": "#6366f1" });
    expect(getVar("--color-accent")).toBe("#6366f1");
  });

  it("injects multiple tokens in one call", () => {
    injectVars({
      "--color-bg-base": "#0f0f0f",
      "--radius": "0.5rem",
      "--transition-speed": "200ms",
    });
    expect(getVar("--color-bg-base")).toBe("#0f0f0f");
    expect(getVar("--radius")).toBe("0.5rem");
    expect(getVar("--transition-speed")).toBe("200ms");
  });

  it("overwrites an existing token value", () => {
    injectVars({ "--radius": "0.25rem" });
    injectVars({ "--radius": "1rem" });
    expect(getVar("--radius")).toBe("1rem");
  });

  it("handles an empty map without throwing", () => {
    expect(() => injectVars({})).not.toThrow();
  });

  it("injects arbitrary custom tokens (not just built-in names)", () => {
    injectVars({ "--sidebar-width": "260px", "--graph-node-color": "#f00" });
    expect(getVar("--sidebar-width")).toBe("260px");
    expect(getVar("--graph-node-color")).toBe("#f00");
  });
});

describe("injectVar", () => {
  it("injects a single named CSS variable", () => {
    injectVar("--color-border", "#2e2e2e");
    expect(getVar("--color-border")).toBe("#2e2e2e");
  });

  it("overwrites a previously injected value", () => {
    injectVar("--color-border", "#2e2e2e");
    injectVar("--color-border", "#ffffff");
    expect(getVar("--color-border")).toBe("#ffffff");
  });

  it("does not affect other variables when updating one", () => {
    injectVar("--radius", "0.5rem");
    injectVar("--border-width", "2px");
    injectVar("--radius", "1rem");
    expect(getVar("--border-width")).toBe("2px");
  });
});

describe("applyModeClass", () => {
  it("adds design-neo class to :root", () => {
    applyModeClass("design-neo");
    expect(root().classList.contains("design-neo")).toBe(true);
  });

  it("adds design-glass class to :root", () => {
    applyModeClass("design-glass");
    expect(root().classList.contains("design-glass")).toBe(true);
  });

  it("adds design-minimal class to :root", () => {
    applyModeClass("design-minimal");
    expect(root().classList.contains("design-minimal")).toBe(true);
  });

  it("removes previous mode class when switching modes", () => {
    applyModeClass("design-neo");
    applyModeClass("design-glass");
    expect(root().classList.contains("design-neo")).toBe(false);
    expect(root().classList.contains("design-glass")).toBe(true);
  });

  it("removes all mode classes when called with no argument (classic mode)", () => {
    applyModeClass("design-neo");
    applyModeClass();
    expect(root().classList.contains("design-neo")).toBe(false);
    expect(root().classList.contains("design-glass")).toBe(false);
    expect(root().classList.contains("design-minimal")).toBe(false);
  });

  it("calling with undefined is idempotent — no class added", () => {
    applyModeClass(undefined);
    expect(root().className).toBe("");
  });

  it("only one mode class is active at a time across all three", () => {
    const modes = ["design-neo", "design-glass", "design-minimal"] as const;
    for (const mode of modes) {
      applyModeClass(mode);
      const active = modes.filter((m) => root().classList.contains(m));
      expect(active).toEqual([mode]);
    }
  });

  it("does not touch non-mode classes already on :root", () => {
    root().classList.add("dark", "my-app-class");
    applyModeClass("design-neo");
    expect(root().classList.contains("dark")).toBe(true);
    expect(root().classList.contains("my-app-class")).toBe(true);
  });
});
