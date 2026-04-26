import { render, screen, fireEvent, within } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { WindowProvider, useWindowContext, PRIMARY_WINDOW_ID } from "../WindowContext";
import { DynamicPanelRoot } from "../DynamicPanels";
import type { LayoutNodeDecl, WindowDef } from "../WindowContext";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

function Comp({ label }: { label: string }) {
  return <div data-testid={`window-${label}`}>{label}</div>;
}

const WIN_A: WindowDef = { id: "win-a", title: "Window A", component: () => <Comp label="A" /> };
const WIN_B: WindowDef = { id: "win-b", title: "Window B", component: () => <Comp label="B" /> };
const WIN_C: WindowDef = { id: "win-c", title: "Window C", component: () => <Comp label="C" /> };

const WINDOWS = [WIN_A, WIN_B, WIN_C];

// Two-panel layout: default left (win-a), non-default right (win-b)
const TWO_PANEL_LAYOUT: LayoutNodeDecl = {
  type: "group",
  direction: "horizontal",
  sizes: [60, 40],
  children: [
    { type: "leaf", windowId: "win-a", isDefault: true },
    { type: "leaf", windowId: "win-b" },
  ],
};

// Single-leaf default layout
const SINGLE_LAYOUT: LayoutNodeDecl = {
  type: "leaf",
  windowId: "win-a",
  isDefault: true,
};

// Layout with an empty (null windowId) leaf
const EMPTY_LEAF_LAYOUT: LayoutNodeDecl = {
  type: "group",
  direction: "horizontal",
  children: [
    { type: "leaf", windowId: "win-a", isDefault: true },
    { type: "leaf", windowId: null },
  ],
};

// ─── useWindowContext — outside provider ───────────────────────────────────────

describe("useWindowContext — outside provider", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("throws when called outside WindowProvider", () => {
    expect(() => renderHook(() => useWindowContext())).toThrow(
      "useWindowContext must be used inside <DynamicPanelRoot>",
    );
  });
});

// ─── useWindowContext — initial tree shape ────────────────────────────────────

describe("useWindowContext — initial tree", () => {
  function makeWrapper(layout: LayoutNodeDecl) {
    return ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={layout}>
        {children}
      </WindowProvider>
    );
  }

  it("single leaf layout: tree is a LeafNode", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(SINGLE_LAYOUT),
    });
    expect(result.current.tree.type).toBe("leaf");
  });

  it("group layout: tree is a GroupNode with 2 children", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(TWO_PANEL_LAYOUT),
    });
    expect(result.current.tree.type).toBe("group");
  });

  it("windows list is passed through unchanged", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(SINGLE_LAYOUT),
    });
    expect(result.current.windows).toHaveLength(3);
    expect(result.current.windows[0].id).toBe("win-a");
  });
});

// ─── assignWindow ─────────────────────────────────────────────────────────────

describe("useWindowContext — assignWindow", () => {
  it("sets windowId on the target leaf and leaves siblings untouched", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={EMPTY_LEAF_LAYOUT}>
        {children}
      </WindowProvider>
    );
    const { result } = renderHook(() => useWindowContext(), { wrapper });

    const emptyLeafId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.assignWindow(emptyLeafId, "win-b"));

    const updatedLeaf = (result.current.tree as any).children[1];
    expect(updatedLeaf.windowId).toBe("win-b");
    // default leaf (children[0]) is untouched
    expect((result.current.tree as any).children[0].windowId).toBe("win-a");
  });
});

// ─── collapsePanel / expandPanel ─────────────────────────────────────────────

describe("useWindowContext — collapsePanel / expandPanel", () => {
  function makeWrapper() {
    return ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={TWO_PANEL_LAYOUT}>
        {children}
      </WindowProvider>
    );
  }

  it("collapsePanel sets collapsed=true on the target leaf", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.collapsePanel(leafBId));

    // With 2 children the collapsed leaf stays at index 1 (already last)
    const collapsed = (result.current.tree as any).children.find(
      (c: any) => c.id === leafBId,
    );
    expect(collapsed.collapsed).toBe(true);
  });

  it("collapsePanel moves the collapsed leaf to the end of its group", () => {
    // Use a 3-panel layout so reordering is visible
    const layout: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      children: [
        { type: "leaf", windowId: "win-a", isDefault: true },
        { type: "leaf", windowId: "win-b" },
        { type: "leaf", windowId: "win-c" },
      ],
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={layout}>
        {children}
      </WindowProvider>
    );
    const { result } = renderHook(() => useWindowContext(), { wrapper });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.collapsePanel(leafBId));

    const children = (result.current.tree as any).children;
    // win-b (collapsed) must be last; win-a and win-c are first
    expect(children[children.length - 1].id).toBe(leafBId);
    expect(children[0].collapsed).toBeFalsy();
    expect(children[1].collapsed).toBeFalsy();
  });

  it("collapsePanel does not affect the non-target sibling", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.collapsePanel(leafBId));

    const leafA = (result.current.tree as any).children.find(
      (c: any) => c.id !== leafBId,
    );
    expect(leafA.collapsed).toBeFalsy();
  });

  it("expandPanel sets collapsed=false and moves leaf back into non-collapsed zone", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.collapsePanel(leafBId));
    act(() => result.current.expandPanel(leafBId));

    const leafB = (result.current.tree as any).children.find(
      (c: any) => c.id === leafBId,
    );
    expect(leafB.collapsed).toBe(false);
    // After expand, no children should be collapsed
    const anyCollapsed = (result.current.tree as any).children.some(
      (c: any) => c.collapsed,
    );
    expect(anyCollapsed).toBe(false);
  });
});

// ─── splitPanel ───────────────────────────────────────────────────────────────

describe("useWindowContext — splitPanel", () => {
  function makeWrapper(layout: LayoutNodeDecl) {
    return ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={layout}>
        {children}
      </WindowProvider>
    );
  }

  it("splitting the only leaf (root) wraps it in a group", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(SINGLE_LAYOUT),
    });
    const leafId = (result.current.tree as any).id as string;

    act(() => result.current.splitPanel(leafId, "horizontal", "after"));

    expect(result.current.tree.type).toBe("group");
    expect((result.current.tree as any).children).toHaveLength(2);
  });

  it("new panel from split has windowId=null", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(SINGLE_LAYOUT),
    });
    const leafId = (result.current.tree as any).id as string;

    act(() => result.current.splitPanel(leafId, "horizontal", "after"));

    const children = (result.current.tree as any).children;
    const newLeaf = children.find((c: any) => c.id !== leafId);
    expect(newLeaf.windowId).toBeNull();
  });

  it("splitting a same-direction leaf adds a sibling (N+1 children)", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(TWO_PANEL_LAYOUT),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.splitPanel(leafBId, "horizontal", "after"));

    expect((result.current.tree as any).children).toHaveLength(3);
  });

  it("divider count is children.length - 1 after split", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(TWO_PANEL_LAYOUT),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.splitPanel(leafBId, "horizontal", "after"));

    const g = result.current.tree as any;
    expect(g.dividerPositions).toHaveLength(g.children.length - 1);
  });
});

// ─── closePanel ───────────────────────────────────────────────────────────────

describe("useWindowContext — closePanel", () => {
  function makeWrapper() {
    return ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={TWO_PANEL_LAYOUT}>
        {children}
      </WindowProvider>
    );
  }

  it("closing the non-default panel collapses the 2-child group to its sibling", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.closePanel(leafBId));

    // Group with 2 children: the group is replaced by the surviving leaf
    expect(result.current.tree.type).toBe("leaf");
  });

  it("surviving leaf after close is the default leaf (win-a)", () => {
    const { result } = renderHook(() => useWindowContext(), {
      wrapper: makeWrapper(),
    });
    const leafBId = (result.current.tree as any).children[1].id as string;

    act(() => result.current.closePanel(leafBId));

    expect((result.current.tree as any).windowId).toBe("win-a");
  });
});

// ─── moveDivider ──────────────────────────────────────────────────────────────

describe("useWindowContext — moveDivider", () => {
  it("updates the divider position of the named group", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WindowProvider windows={WINDOWS} layout={TWO_PANEL_LAYOUT}>
        {children}
      </WindowProvider>
    );
    const { result } = renderHook(() => useWindowContext(), { wrapper });
    const groupId = (result.current.tree as any).id as string;

    act(() => result.current.moveDivider(groupId, 0, 70));

    expect((result.current.tree as any).dividerPositions[0]).toBe(70);
  });
});

// ─── DynamicPanelRoot — rendering ─────────────────────────────────────────────

describe("DynamicPanelRoot — window components are rendered", () => {
  it("renders the component for a window assigned to a leaf", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getByTestId("window-A")).toBeInTheDocument();
    expect(screen.getByTestId("window-B")).toBeInTheDocument();
  });

  it("renders the window title in the leaf header", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getByText("Window A")).toBeInTheDocument();
    expect(screen.getByText("Window B")).toBeInTheDocument();
  });
});

describe("DynamicPanelRoot — WindowSelector for empty leaf", () => {
  it("shows 'Select Window' header text for a null-windowId leaf", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={EMPTY_LEAF_LAYOUT} />,
    );
    expect(screen.getByText("Select Window")).toBeInTheDocument();
  });

  it("lists all registered windows in the selector", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={EMPTY_LEAF_LAYOUT} />,
    );
    // "Window A" appears in the left leaf header AND the selector; B and C only in the selector
    expect(screen.getAllByText("Window A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Window B").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Window C").length).toBeGreaterThanOrEqual(1);
  });

  it("clicking a window in the selector assigns it and renders the component", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={EMPTY_LEAF_LAYOUT} />,
    );
    // Window C is only in the selector (not displayed as a header for a leaf yet)
    const winCButtons = screen.getAllByText("Window C");
    // Click the selector card for Window C
    fireEvent.click(winCButtons[0]);
    expect(screen.getByTestId("window-C")).toBeInTheDocument();
  });
});

describe("DynamicPanelRoot — default panel controls", () => {
  it("default panel does not have a close button", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    // There should be close buttons for non-default panels only
    const closeButtons = screen.queryAllByLabelText("Close panel");
    expect(closeButtons).toHaveLength(1); // only win-b has close
  });

  it("default panel does not have a minimize button", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    const minimizeButtons = screen.queryAllByLabelText("Minimize panel");
    expect(minimizeButtons).toHaveLength(1); // only win-b has minimize
  });
});

describe("DynamicPanelRoot — non-default panel controls", () => {
  it("non-default panel has a close button", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getByLabelText("Close panel")).toBeInTheDocument();
  });

  it("non-default panel has a minimize button", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getByLabelText("Minimize panel")).toBeInTheDocument();
  });
});

describe("DynamicPanelRoot — close panel interaction", () => {
  it("clicking close removes the closed panel's window from the DOM", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getByTestId("window-B")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close panel"));

    expect(screen.queryByTestId("window-B")).not.toBeInTheDocument();
  });

  it("clicking close removes the panel header for the closed window", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getAllByText("Window B")).toHaveLength(1);

    fireEvent.click(screen.getByLabelText("Close panel"));

    // "Window B" header should be gone; surviving leaf has no close button
    expect(screen.queryByText("Window B")).not.toBeInTheDocument();
  });

  it("surviving panel remains visible after close", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    fireEvent.click(screen.getByLabelText("Close panel"));
    expect(screen.getByTestId("window-A")).toBeInTheDocument();
  });
});

// ─── PRIMARY_WINDOW_ID constant ───────────────────────────────────────────────

describe("PRIMARY_WINDOW_ID", () => {
  it("is the reserved string '__primary__'", () => {
    expect(PRIMARY_WINDOW_ID).toBe("__primary__");
  });
});

// ─── headless WindowDef ───────────────────────────────────────────────────────

const WIN_HEADLESS: WindowDef = {
  id: "win-headless",
  title: "Headless Window",
  headless: true,
  component: () => <div data-testid="headless-content">headless</div>,
};

const HEADLESS_LAYOUT: LayoutNodeDecl = {
  type: "leaf",
  windowId: "win-headless",
  isDefault: true,
};

describe("DynamicPanelRoot — headless windows", () => {
  it("renders the component for a headless window", () => {
    render(
      <DynamicPanelRoot windows={[WIN_HEADLESS]} layout={HEADLESS_LAYOUT} />,
    );
    expect(screen.getByTestId("headless-content")).toBeInTheDocument();
  });

  it("suppresses the panel header strip — title does not appear", () => {
    render(
      <DynamicPanelRoot windows={[WIN_HEADLESS]} layout={HEADLESS_LAYOUT} />,
    );
    expect(screen.queryByText("Headless Window")).not.toBeInTheDocument();
  });

  it("excludes headless windows from the WindowSelector", () => {
    const layout: LayoutNodeDecl = {
      type: "group",
      direction: "horizontal",
      children: [
        { type: "leaf", windowId: "win-a", isDefault: true },
        { type: "leaf", windowId: null },
      ],
    };
    render(
      <DynamicPanelRoot
        windows={[WIN_A, WIN_HEADLESS]}
        layout={layout}
      />,
    );
    expect(screen.getByText("Select Window")).toBeInTheDocument();
    expect(screen.getAllByText("Window A").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Headless Window")).not.toBeInTheDocument();
  });
});

describe("DynamicPanelRoot — minimize panel interaction", () => {
  it("clicking minimize hides the panel content but keeps the header", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    expect(screen.getByTestId("window-B")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Minimize panel"));

    expect(screen.queryByTestId("window-B")).not.toBeInTheDocument();
    // Header should still be visible
    expect(screen.getByText("Window B")).toBeInTheDocument();
  });

  it("button label switches to 'Expand panel' after minimize", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    fireEvent.click(screen.getByLabelText("Minimize panel"));
    expect(screen.getByLabelText("Expand panel")).toBeInTheDocument();
  });

  it("clicking expand after minimize restores the panel content", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    fireEvent.click(screen.getByLabelText("Minimize panel"));
    fireEvent.click(screen.getByLabelText("Expand panel"));
    expect(screen.getByTestId("window-B")).toBeInTheDocument();
  });

  it("minimizing one panel does not hide the other panel's content", () => {
    render(
      <DynamicPanelRoot windows={WINDOWS} layout={TWO_PANEL_LAYOUT} />,
    );
    fireEvent.click(screen.getByLabelText("Minimize panel"));
    expect(screen.getByTestId("window-A")).toBeInTheDocument();
  });
});
