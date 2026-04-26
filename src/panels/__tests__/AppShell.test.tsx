import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { C7OneProvider } from "../../context/C7OneContext";
import { AppShell } from "../AppShell";
import { PRIMARY_WINDOW_ID } from "../WindowContext";
import type { WindowDef, LayoutNodeDecl } from "../WindowContext";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function Canvas() {
  return <div data-testid="canvas">canvas</div>;
}

function PanelA() {
  return <div data-testid="panel-a">Panel A content</div>;
}

function PanelB() {
  return <div data-testid="panel-b">Panel B content</div>;
}

const WINDOWS: WindowDef[] = [
  { id: "panel-a", title: "Panel A", component: PanelA },
  { id: "panel-b", title: "Panel B", component: PanelB },
];

// Left slot: transparent primary placeholder; right slot: Panel A
const LAYOUT: LayoutNodeDecl = {
  type: "group",
  direction: "horizontal",
  sizes: [50, 50],
  children: [
    { type: "leaf", windowId: PRIMARY_WINDOW_ID, isDefault: true },
    { type: "leaf", windowId: "panel-a" },
  ],
};

function wrap(ui: React.ReactNode) {
  return render(
    <C7OneProvider defaultMode="classic">{ui}</C7OneProvider>,
  );
}

// ─── matchMedia mock ──────────────────────────────────────────────────────────
// useIsMobile reads window.matchMedia — jsdom does not provide it.

function mockMatchMedia(mobile: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: mobile && query === "(max-width: 767px)",
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: mobile ? 375 : 1440,
  });
}

// ─── Basic rendering ──────────────────────────────────────────────────────────

describe("AppShell — basic rendering", () => {
  beforeEach(() => mockMatchMedia(false));

  it("renders a <header> element", () => {
    const { container } = wrap(<AppShell><Canvas /></AppShell>);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders children (canvas content)", () => {
    wrap(<AppShell><Canvas /></AppShell>);
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("renders logo in the header", () => {
    wrap(<AppShell logo={<span>MyLogo</span>}><Canvas /></AppShell>);
    expect(screen.getByText("MyLogo")).toBeInTheDocument();
  });

  it("renders headerActions in the header", () => {
    wrap(
      <AppShell headerActions={<button>Custom</button>}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: "Custom" })).toBeInTheDocument();
  });
});

// ─── Built-in header buttons ──────────────────────────────────────────────────

describe("AppShell — built-in header buttons", () => {
  beforeEach(() => mockMatchMedia(false));

  it("showSettings=true renders an 'Open settings' button", () => {
    wrap(<AppShell showSettings><Canvas /></AppShell>);
    expect(
      screen.getByRole("button", { name: "Open settings" }),
    ).toBeInTheDocument();
  });

  it("showSettings=false (default) does not render the settings button", () => {
    wrap(<AppShell><Canvas /></AppShell>);
    expect(
      screen.queryByRole("button", { name: "Open settings" }),
    ).not.toBeInTheDocument();
  });

  it("showThemeSwitcher=true renders a button in the header", () => {
    wrap(<AppShell showThemeSwitcher><Canvas /></AppShell>);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(1);
  });

  it("showThemeSwitcher=false (default) renders no extra buttons", () => {
    wrap(<AppShell><Canvas /></AppShell>);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("showSettings and showThemeSwitcher together render at least two buttons", () => {
    wrap(<AppShell showSettings showThemeSwitcher><Canvas /></AppShell>);
    expect(screen.getByRole("button", { name: "Open settings" })).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Desktop: floating panel layer ────────────────────────────────────────────

describe("AppShell — desktop panel layer", () => {
  beforeEach(() => mockMatchMedia(false));

  it("renders panel window content when windows and layout are provided", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.getByTestId("panel-a")).toBeInTheDocument();
  });

  it("canvas is still rendered alongside the panel layer", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("does not render a <footer> on desktop", () => {
    const { container } = wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });

  it("without windows, no panel window content is rendered", () => {
    wrap(<AppShell><Canvas /></AppShell>);
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument();
    expect(screen.queryByTestId("panel-b")).not.toBeInTheDocument();
  });
});

// ─── Mobile: footer tab bar ───────────────────────────────────────────────────

describe("AppShell — mobile footer tab bar", () => {
  beforeEach(() => mockMatchMedia(true));
  afterEach(() => mockMatchMedia(false));

  it("renders a <footer> on mobile when windows are provided", () => {
    const { container } = wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("footer contains a tab button for each non-primary window", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: "Panel A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Panel B" })).toBeInTheDocument();
  });

  it("PRIMARY_WINDOW_ID is not shown as a tab button", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(
      screen.queryByRole("button", { name: "Primary" }),
    ).not.toBeInTheDocument();
  });

  it("does not render DynamicPanelRoot panel content on mobile", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument();
  });

  it("canvas is always visible on mobile", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("does not render a footer when no windows are provided", () => {
    const { container } = wrap(<AppShell><Canvas /></AppShell>);
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });
});

// ─── Mobile: bottom sheet ─────────────────────────────────────────────────────

describe("AppShell — mobile bottom sheet", () => {
  beforeEach(() => mockMatchMedia(true));
  afterEach(() => mockMatchMedia(false));

  it("no bottom sheet is visible before a tab is clicked", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument();
  });

  it("clicking a tab renders the window component in the bottom sheet", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    expect(screen.getByTestId("panel-a")).toBeInTheDocument();
  });

  it("bottom sheet header shows the window title", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    // title appears in both the tab button and the sheet header
    expect(screen.getAllByText("Panel A").length).toBeGreaterThanOrEqual(2);
  });

  it("clicking the close button on the bottom sheet hides it", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    expect(screen.getByTestId("panel-a")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument();
  });

  it("clicking the active tab again closes the bottom sheet", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    expect(screen.getByTestId("panel-a")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument();
  });

  it("canvas remains visible behind an open bottom sheet", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });

  it("switching tabs replaces the active sheet content", () => {
    wrap(
      <AppShell windows={WINDOWS} layout={LAYOUT}>
        <Canvas />
      </AppShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Panel A" }));
    expect(screen.getByTestId("panel-a")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Panel B" }));
    expect(screen.queryByTestId("panel-a")).not.toBeInTheDocument();
    expect(screen.getByTestId("panel-b")).toBeInTheDocument();
  });
});
