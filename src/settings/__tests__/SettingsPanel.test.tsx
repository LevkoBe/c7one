/**
 * SettingsPanel — generic, data-driven panel tests.
 *
 * Principle: test runtime DOM effects, not internal shape.
 * Every test that says "a slider appears" also verifies that interacting with
 * it actually updates the CSS variable on :root.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { C7OneProvider } from "../../context/C7OneContext";
import { SettingsPanel } from "../SettingsPanel";
import * as themes from "../../ccc/themes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = () => document.documentElement;
const getVar = (name: string) => root().style.getPropertyValue(name);

function wrap(
  ui: React.ReactNode,
  extraConfig: Record<string, unknown> = {},
) {
  return render(
    <C7OneProvider
      defaultMode="classic"
      config={{ colors: themes.dark, ...extraConfig }}
    >
      {ui}
    </C7OneProvider>,
  );
}

beforeEach(() => {
  root().removeAttribute("style");
  root().className = "";
});
afterEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

// ─── expose filtering ─────────────────────────────────────────────────────────

describe("SettingsPanel expose — renders only the requested sections", () => {
  it("expose=['mode']: mode buttons present", () => {
    wrap(<SettingsPanel expose={["mode"]} />);
    expect(screen.getByText("classic")).toBeInTheDocument();
    expect(screen.getByText("neo")).toBeInTheDocument();
    expect(screen.getByText("glass")).toBeInTheDocument();
    expect(screen.getByText("minimal")).toBeInTheDocument();
  });

  it("expose=['mode']: no color swatches or sliders from system tokens", () => {
    wrap(<SettingsPanel expose={["mode"]} />);
    expect(document.querySelector('input[type="color"]')).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("expose=['colors']: theme swatches present, no mode buttons as section", () => {
    wrap(<SettingsPanel expose={["colors"]} />);
    // Built-in theme swatches identified by title attribute
    expect(document.querySelector('[title="dark"]')).toBeInTheDocument();
    expect(document.querySelector('[title="light"]')).toBeInTheDocument();
  });

  it("expose=['colors']: individual color pickers rendered for all 12 tokens", () => {
    wrap(<SettingsPanel expose={["colors"]} />);
    const pickers = document.querySelectorAll('input[type="color"]');
    expect(pickers.length).toBe(12);
  });

  it("expose=['--radius']: slider rendered for radius token", () => {
    wrap(<SettingsPanel expose={["--radius"]} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("expose=['--radius']: no mode buttons or theme swatches", () => {
    wrap(<SettingsPanel expose={["--radius"]} />);
    expect(screen.queryByText("classic")).toBeNull();
    expect(document.querySelector('[title="dark"]')).toBeNull();
  });

  it("expose default (omitted): mode buttons and theme swatches both present", () => {
    wrap(<SettingsPanel />);
    expect(screen.getByText("classic")).toBeInTheDocument();
    expect(document.querySelector('[title="dark"]')).toBeInTheDocument();
  });
});

// ─── Control inference — color ────────────────────────────────────────────────

describe("SettingsPanel — color control inferred from token name", () => {
  it("custom '--graph-node-color' token renders a color picker", () => {
    wrap(<SettingsPanel expose={["--graph-node-color"]} />, {
      tokens: { "--graph-node-color": "#6366f1" },
    });
    expect(document.querySelector('input[type="color"]')).toBeInTheDocument();
  });

  it("color picker shows the current token value as its value", () => {
    wrap(<SettingsPanel expose={["--graph-node-color"]} />, {
      tokens: { "--graph-node-color": "#6366f1" },
    });
    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    expect(picker.value).toBe("#6366f1");
  });

  it("changing the color picker updates :root immediately", () => {
    wrap(<SettingsPanel expose={["--graph-node-color"]} />, {
      tokens: { "--graph-node-color": "#6366f1" },
    });
    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    fireEvent.change(picker, { target: { value: "#ff0000" } });
    expect(getVar("--graph-node-color")).toBe("#ff0000");
  });

  it("'--color-accent' exposed alone renders a color picker", () => {
    wrap(<SettingsPanel expose={["--color-accent"]} />);
    expect(document.querySelector('input[type="color"]')).toBeInTheDocument();
  });
});

// ─── Control inference — slider ───────────────────────────────────────────────

describe("SettingsPanel — slider control inferred from token value unit", () => {
  it("px token renders a slider", () => {
    wrap(<SettingsPanel expose={["--sidebar-width"]} />, {
      tokens: { "--sidebar-width": "260px" },
    });
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("rem token renders a slider", () => {
    wrap(<SettingsPanel expose={["--radius"]} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("ms token renders a slider", () => {
    wrap(<SettingsPanel expose={["--transition-speed"]} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("bare number token renders a slider", () => {
    wrap(<SettingsPanel expose={["--shadow-intensity"]} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });
});

// ─── Control inference — text fallback ───────────────────────────────────────

describe("SettingsPanel — text input fallback for non-numeric, non-color tokens", () => {
  it("a token with a non-unit string value renders a text input", () => {
    wrap(<SettingsPanel expose={["--layout-mode"]} />, {
      tokens: { "--layout-mode": "auto" },
    });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("changing the text input updates :root immediately", () => {
    wrap(<SettingsPanel expose={["--layout-mode"]} />, {
      tokens: { "--layout-mode": "auto" },
    });
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "grid" },
    });
    expect(getVar("--layout-mode")).toBe("grid");
  });
});

// ─── Color deduplication — 'colors' + '--color-*' ────────────────────────────

describe("SettingsPanel — no duplication when 'colors' and '--color-*' both exposed", () => {
  it("expose=['colors','--color-accent']: --color-accent not duplicated as extra picker", () => {
    wrap(<SettingsPanel expose={["colors", "--color-accent"]} />);
    // 'colors' renders 12 pickers; --color-accent is filtered out of token groups
    const pickers = document.querySelectorAll('input[type="color"]');
    expect(pickers.length).toBe(12);
  });

  it("expose=['--color-accent'] without 'colors': renders exactly one picker", () => {
    wrap(<SettingsPanel expose={["--color-accent"]} />);
    const pickers = document.querySelectorAll('input[type="color"]');
    expect(pickers.length).toBe(1);
  });
});

// ─── Grouping — section headings ──────────────────────────────────────────────

describe("SettingsPanel — tokens auto-grouped by first CSS var segment", () => {
  it("'--radius' appears under a 'radius' section", () => {
    wrap(<SettingsPanel expose={["--radius"]} />);
    expect(screen.getByText("radius")).toBeInTheDocument();
  });

  it("'--transition-speed' appears under a 'transition' section", () => {
    wrap(<SettingsPanel expose={["--transition-speed"]} />);
    expect(screen.getByText("transition")).toBeInTheDocument();
  });

  it("--radius and --border-width have separate section headings", () => {
    wrap(<SettingsPanel expose={["--radius", "--border-width"]} />);
    // --radius → group "radius", --border-width → group "border"
    expect(screen.getByText("radius")).toBeInTheDocument();
    expect(screen.getByText("border")).toBeInTheDocument();
  });

  it("two custom tokens with the same prefix share one section heading", () => {
    wrap(
      <SettingsPanel
        expose={["--graph-node-color", "--graph-edge-color"]}
      />,
      {
        tokens: {
          "--graph-node-color": "#6366f1",
          "--graph-edge-color": "#f43f5e",
        },
      },
    );
    const graphHeadings = screen.getAllByText("graph");
    expect(graphHeadings).toHaveLength(1);
  });
});

// ─── DOM effects — theme swatch ───────────────────────────────────────────────

describe("SettingsPanel — theme swatch click updates :root colors", () => {
  it("clicking 'light' swatch sets --color-bg-base to the light value", () => {
    wrap(<SettingsPanel expose={["colors"]} />);
    fireEvent.click(document.querySelector('[title="light"]')!);
    expect(getVar("--color-bg-base")).toBe(themes.light["--color-bg-base"]);
  });

  it("clicking 'midnight' swatch sets --color-accent to the midnight value", () => {
    wrap(<SettingsPanel expose={["colors"]} />);
    fireEvent.click(document.querySelector('[title="midnight"]')!);
    expect(getVar("--color-accent")).toBe(themes.midnight["--color-accent"]);
  });
});

// ─── renderAppSettings slot ───────────────────────────────────────────────────

describe("SettingsPanel — renderAppSettings slot", () => {
  it("renders app-specific content when provided", () => {
    wrap(
      <SettingsPanel
        expose={["mode"]}
        renderAppSettings={() => <div>Custom App Controls</div>}
      />,
    );
    expect(screen.getByText("Custom App Controls")).toBeInTheDocument();
  });

  it("does not render the App Settings section when renderAppSettings is omitted", () => {
    wrap(<SettingsPanel expose={["mode"]} />);
    expect(screen.queryByText("APP SETTINGS")).toBeNull();
  });
});
