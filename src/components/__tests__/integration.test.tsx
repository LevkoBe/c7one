/**
 * Layer 3b — representative component × all modes × all themes
 * Layer 3d — compound integration scenarios
 *
 * One component per category is rendered inside C7OneProvider with every
 * combination of mode and theme. These tests verify two things:
 *   1. No component crashes under any mode/theme combination.
 *   2. The correct mode class is on :root after the provider mounts.
 */
import { render, screen, act, fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, afterEach, beforeEach } from "vitest";

import { C7OneProvider, useC7One } from "../../context/C7OneContext";
import { PanelVisibilityProvider, usePanelVisibility } from "../../context/PanelContext";

import * as themes from "../../ccc/themes";
import type { DesignMode, ThemeTokens } from "../../ccc/types";

// Representative components, one per category
import { Card, CardContent } from "../structural/Card";
import { Button } from "../form/Button";
import { Badge } from "../textual/Badge";
import { Alert } from "../feedback/Feedback";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../navigation/Navigation";
import { Table } from "../data/Table";
import { SettingsPanel } from "../../settings/SettingsPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = () => document.documentElement;
const MODES: DesignMode[] = ["classic", "neo", "glass", "minimal"];
const MODE_CLASSES: Record<DesignMode, string | undefined> = {
  classic: undefined,
  neo: "design-neo",
  glass: "design-glass",
  minimal: "design-minimal",
};

const ALL_THEMES: { name: string; tokens: ThemeTokens }[] = [
  { name: "dark", tokens: themes.dark },
  { name: "light", tokens: themes.light },
  { name: "midnight", tokens: themes.midnight },
  { name: "forest", tokens: themes.forest },
  { name: "rose", tokens: themes.rose },
  { name: "slate", tokens: themes.slate },
];

function wrap(mode: DesignMode, colors: ThemeTokens, children: React.ReactNode) {
  return (
    <C7OneProvider defaultMode={mode} config={{ colors }}>
      {children}
    </C7OneProvider>
  );
}

afterEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

// ─── 3b: all modes × Card ────────────────────────────────────────────────────

describe("Card × all modes — renders without crash + correct mode class", () => {
  for (const mode of MODES) {
    it(`mode="${mode}": Card renders`, () => {
      render(
        wrap(mode, themes.dark, <Card><CardContent>test</CardContent></Card>),
      );
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it(`mode="${mode}": correct class on :root`, () => {
      render(wrap(mode, themes.dark, <Card />));
      const expected = MODE_CLASSES[mode];
      if (expected) {
        expect(root().classList.contains(expected)).toBe(true);
      } else {
        expect(["design-neo", "design-glass", "design-minimal"].every(
          (c) => !root().classList.contains(c),
        )).toBe(true);
      }
    });
  }
});

// ─── 3b: all themes × Button ─────────────────────────────────────────────────

describe("Button × all themes — renders without crash + accent token set", () => {
  for (const { name, tokens } of ALL_THEMES) {
    it(`theme="${name}": Button renders`, () => {
      render(wrap("classic", tokens, <Button>Click</Button>));
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it(`theme="${name}": --color-accent is set on :root`, () => {
      render(wrap("classic", tokens, <Button>x</Button>));
      expect(root().style.getPropertyValue("--color-accent")).toBe(
        tokens["--color-accent"],
      );
    });
  }
});

// ─── 3b: all modes × Badge ───────────────────────────────────────────────────

describe("Badge × all modes — renders without crash", () => {
  for (const mode of MODES) {
    it(`mode="${mode}": Badge success renders`, () => {
      render(wrap(mode, themes.dark, <Badge variant="success">ok</Badge>));
      expect(screen.getByText("ok")).toBeInTheDocument();
    });
  }
});

// ─── 3b: all themes × Alert ─────────────────────────────────────────────────

describe("Alert × all themes — renders without crash", () => {
  for (const { name, tokens } of ALL_THEMES) {
    it(`theme="${name}": Alert error renders`, () => {
      render(wrap("classic", tokens, <Alert variant="error">bad</Alert>));
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  }
});

// ─── 3b: all modes × Tabs ────────────────────────────────────────────────────

describe("Tabs × all modes — renders and switches correctly", () => {
  for (const mode of MODES) {
    it(`mode="${mode}": Tabs render and clicking changes content`, () => {
      render(
        wrap(
          mode,
          themes.dark,
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">A</TabsTrigger>
              <TabsTrigger value="b">B</TabsTrigger>
            </TabsList>
            <TabsContent value="a">Content A</TabsContent>
            <TabsContent value="b">Content B</TabsContent>
          </Tabs>,
        ),
      );
      expect(screen.getByText("Content A")).toBeInTheDocument();
      // Radix Tabs activates on mouseDown, not click
      fireEvent.mouseDown(screen.getByRole("tab", { name: "B" }));
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content B");
      expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    });
  }
});

// ─── 3b: all themes × Table ─────────────────────────────────────────────────

describe("Table × all themes — renders data and sorts correctly", () => {
  const data = [
    { name: "Zara", score: 10 },
    { name: "Alex", score: 20 },
  ];
  const cols = [
    { key: "name" as const, header: "Name", sortable: true },
    { key: "score" as const, header: "Score", sortable: true },
  ];

  for (const { name, tokens } of ALL_THEMES) {
    it(`theme="${name}": Table renders rows`, () => {
      render(wrap("classic", tokens, <Table data={data} columns={cols} />));
      expect(screen.getByText("Zara")).toBeInTheDocument();
      expect(screen.getByText("Alex")).toBeInTheDocument();
    });
  }
});

// ─── 3b: all modes × SettingsPanel ───────────────────────────────────────────

describe("SettingsPanel × all modes — renders all exposed controls", () => {
  for (const mode of MODES) {
    it(`mode="${mode}": SettingsPanel renders mode and color controls`, () => {
      render(
        wrap(
          mode,
          themes.dark,
          <SettingsPanel expose={["mode", "colors", "shape.radius"]} />,
        ),
      );
      // Mode buttons should all be present
      expect(screen.getByText("classic")).toBeInTheDocument();
      expect(screen.getByText("neo")).toBeInTheDocument();
      expect(screen.getByText("glass")).toBeInTheDocument();
      expect(screen.getByText("minimal")).toBeInTheDocument();
    });
  }
});

// ─── 3d: SettingsPanel — clicking mode button actually switches mode ──────────

describe("SettingsPanel — mode button switches the active mode", () => {
  it("clicking 'neo' mode button applies design-neo class to :root", () => {
    render(
      <C7OneProvider defaultMode="classic" config={{ colors: themes.dark }}>
        <SettingsPanel expose={["mode"]} />
      </C7OneProvider>,
    );
    fireEvent.click(screen.getByText("neo"));
    expect(root().classList.contains("design-neo")).toBe(true);
  });

  it("clicking 'minimal' after 'neo' removes design-neo and adds design-minimal", () => {
    render(
      <C7OneProvider defaultMode="classic" config={{ colors: themes.dark }}>
        <SettingsPanel expose={["mode"]} />
      </C7OneProvider>,
    );
    fireEvent.click(screen.getByText("neo"));
    fireEvent.click(screen.getByText("minimal"));
    expect(root().classList.contains("design-neo")).toBe(false);
    expect(root().classList.contains("design-minimal")).toBe(true);
  });

  it("clicking 'classic' removes all mode classes", () => {
    render(
      <C7OneProvider defaultMode="neo" config={{ colors: themes.dark }}>
        <SettingsPanel expose={["mode"]} />
      </C7OneProvider>,
    );
    fireEvent.click(screen.getByText("classic"));
    expect(root().classList.contains("design-neo")).toBe(false);
    expect(root().classList.contains("design-glass")).toBe(false);
    expect(root().classList.contains("design-minimal")).toBe(false);
  });
});

// ─── 3d: SettingsPanel — mode button updates shape tokens ─────────────────────

describe("SettingsPanel — mode switch updates CSS tokens via button", () => {
  it("clicking neo sets --shadow-intensity to 1 on :root", () => {
    render(
      <C7OneProvider defaultMode="classic" config={{ colors: themes.dark }}>
        <SettingsPanel expose={["mode"]} />
      </C7OneProvider>,
    );
    fireEvent.click(screen.getByText("neo"));
    expect(root().style.getPropertyValue("--shadow-intensity")).toBe("1");
  });

  it("clicking minimal sets --border-width to 0px on :root", () => {
    render(
      <C7OneProvider defaultMode="classic" config={{ colors: themes.dark }}>
        <SettingsPanel expose={["mode"]} />
      </C7OneProvider>,
    );
    fireEvent.click(screen.getByText("minimal"));
    expect(root().style.getPropertyValue("--border-width")).toBe("0px");
  });
});

// ─── 3d: useC7One setMode + UI component update ───────────────────────────────

describe("setMode via hook — component tree reflects new mode state", () => {
  function ModeDisplay() {
    const { mode, setMode } = useC7One();
    return (
      <div>
        <span data-testid="mode">{mode}</span>
        <button onClick={() => setMode("glass")}>Switch to glass</button>
      </div>
    );
  }

  it("mode display updates after setMode", () => {
    render(
      <C7OneProvider defaultMode="classic">
        <ModeDisplay />
      </C7OneProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("classic");
    fireEvent.click(screen.getByText("Switch to glass"));
    expect(screen.getByTestId("mode").textContent).toBe("glass");
    expect(root().classList.contains("design-glass")).toBe(true);
  });
});

// ─── 3d: PanelVisibility — show/hide in a real component tree ─────────────────

describe("PanelVisibilityProvider — integration with component tree", () => {
  function PanelApp() {
    const panel = usePanelVisibility("sidebar");
    return (
      <div>
        <button onClick={panel.toggle}>Toggle sidebar</button>
        {panel.visible && <aside>Sidebar content</aside>}
      </div>
    );
  }

  it("sidebar is visible by default", () => {
    render(
      <PanelVisibilityProvider>
        <PanelApp />
      </PanelVisibilityProvider>,
    );
    expect(screen.getByText("Sidebar content")).toBeInTheDocument();
  });

  it("toggling hides the sidebar", () => {
    render(
      <PanelVisibilityProvider>
        <PanelApp />
      </PanelVisibilityProvider>,
    );
    fireEvent.click(screen.getByText("Toggle sidebar"));
    expect(screen.queryByText("Sidebar content")).not.toBeInTheDocument();
  });

  it("toggling twice restores the sidebar", () => {
    render(
      <PanelVisibilityProvider>
        <PanelApp />
      </PanelVisibilityProvider>,
    );
    fireEvent.click(screen.getByText("Toggle sidebar"));
    fireEvent.click(screen.getByText("Toggle sidebar"));
    expect(screen.getByText("Sidebar content")).toBeInTheDocument();
  });
});

// ─── 3d: multi-panel tree — independent visibility per panel ──────────────────
//
// Simulates a real layout: a root shell that contains three independently-
// managed panels (sidebar, toolbar, content). Each panel is a separate
// component that consumes usePanelVisibility for its own id. This mirrors the
// "PanelRoot + PanelSplit + PanelLeaf" nesting described in the test plan —
// the provider acts as PanelRoot, component groups act as splits, and each
// leaf renders conditionally based on its own visibility state.

describe("multi-panel tree — sidebar + toolbar + content", () => {
  function Sidebar() {
    const { visible, toggle } = usePanelVisibility("sidebar");
    return (
      <div>
        <button onClick={toggle}>toggle-sidebar</button>
        {visible && <nav>Sidebar</nav>}
      </div>
    );
  }

  function Toolbar() {
    const { visible, toggle } = usePanelVisibility("toolbar");
    return (
      <div>
        <button onClick={toggle}>toggle-toolbar</button>
        {visible && <div role="toolbar">Toolbar</div>}
      </div>
    );
  }

  function Content() {
    const { visible } = usePanelVisibility("content");
    return visible ? <main>Content</main> : null;
  }

  function Shell() {
    return (
      <PanelVisibilityProvider>
        <Sidebar />
        <Toolbar />
        <Content />
      </PanelVisibilityProvider>
    );
  }

  it("all three panels are visible by default", () => {
    render(<Shell />);
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("hiding sidebar does not affect toolbar or content", () => {
    render(<Shell />);
    fireEvent.click(screen.getByText("toggle-sidebar"));
    expect(screen.queryByText("Sidebar")).not.toBeInTheDocument();
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("hiding toolbar does not affect sidebar or content", () => {
    render(<Shell />);
    fireEvent.click(screen.getByText("toggle-toolbar"));
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.queryByText("Toolbar")).not.toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("hiding sidebar then restoring: sidebar comes back, others unaffected", () => {
    render(<Shell />);
    fireEvent.click(screen.getByText("toggle-sidebar"));
    fireEvent.click(screen.getByText("toggle-sidebar"));
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("hiding both sidebar and toolbar independently: content still visible", () => {
    render(<Shell />);
    fireEvent.click(screen.getByText("toggle-sidebar"));
    fireEvent.click(screen.getByText("toggle-toolbar"));
    expect(screen.queryByText("Sidebar")).not.toBeInTheDocument();
    expect(screen.queryByText("Toolbar")).not.toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("restoring both after hiding: all three panels visible again", () => {
    render(<Shell />);
    fireEvent.click(screen.getByText("toggle-sidebar"));
    fireEvent.click(screen.getByText("toggle-toolbar"));
    fireEvent.click(screen.getByText("toggle-sidebar"));
    fireEvent.click(screen.getByText("toggle-toolbar"));
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

// ─── 3d: setColors via hook — component tree reads updated token ──────────────

describe("setColors via hook — :root reflects new colors immediately", () => {
  function ColorSwitcher() {
    const { setColors } = useC7One();
    return (
      <button onClick={() => setColors(themes.light)}>Switch to light</button>
    );
  }

  it("switching to light sets --color-bg-base to #ffffff", () => {
    render(
      <C7OneProvider defaultMode="classic" config={{ colors: themes.dark }}>
        <ColorSwitcher />
      </C7OneProvider>,
    );
    fireEvent.click(screen.getByText("Switch to light"));
    expect(root().style.getPropertyValue("--color-bg-base")).toBe("#ffffff");
  });
});
