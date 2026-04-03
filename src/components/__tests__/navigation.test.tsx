import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "../navigation/Navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../navigation/Navigation";
import { Navbar, Sidebar } from "../navigation/NavSidebar";
import type { NavItem, SidebarGroup } from "../navigation/NavSidebar";

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

describe("Breadcrumb — structure", () => {
  const items = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumb" },
  ];

  it("has aria-label='Breadcrumb' on the nav", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders all item labels", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Breadcrumb")).toBeInTheDocument();
  });

  it("last item has aria-current='page'", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Breadcrumb")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("non-last items do NOT have aria-current='page'", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Home")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Components")).not.toHaveAttribute("aria-current");
  });

  it("non-last items with href render as <a> links", () => {
    render(<Breadcrumb items={items} />);
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("last item renders as <span> (not a link)", () => {
    render(<Breadcrumb items={items} />);
    const last = screen.getByText("Breadcrumb");
    expect(last.tagName).toBe("SPAN");
  });

  it("single item: only item has aria-current='page'", () => {
    render(<Breadcrumb items={[{ label: "Only" }]} />);
    expect(screen.getByText("Only")).toHaveAttribute("aria-current", "page");
  });
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

describe("Tabs — behavior", () => {
  function TabsExample() {
    return (
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
          <TabsTrigger value="c" disabled>
            Tab C
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
        <TabsContent value="c">Content C</TabsContent>
      </Tabs>
    );
  }

  it("renders all tab triggers", () => {
    render(<TabsExample />);
    expect(screen.getByText("Tab A")).toBeInTheDocument();
    expect(screen.getByText("Tab B")).toBeInTheDocument();
    expect(screen.getByText("Tab C")).toBeInTheDocument();
  });

  it("default tab content is visible", () => {
    render(<TabsExample />);
    expect(screen.getByText("Content A")).toBeInTheDocument();
  });

  it("non-default tab content is not visible initially", () => {
    render(<TabsExample />);
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("clicking Tab B shows Content B and hides Content A", () => {
    render(<TabsExample />);
    // Radix Tabs activates on mouseDown, not click
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Tab B" }));
    // After switch, only the active tabpanel is accessible (inactive ones get hidden="")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content B");
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });

  it("active trigger has data-state='active'", () => {
    render(<TabsExample />);
    const triggerA = screen.getByText("Tab A");
    expect(triggerA).toHaveAttribute("data-state", "active");
  });

  it("inactive trigger has data-state='inactive'", () => {
    render(<TabsExample />);
    const triggerB = screen.getByText("Tab B");
    expect(triggerB).toHaveAttribute("data-state", "inactive");
  });

  it("disabled trigger is disabled", () => {
    render(<TabsExample />);
    expect(screen.getByText("Tab C").closest("button")).toBeDisabled();
  });

  it("switching tabs updates active state", () => {
    render(<TabsExample />);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Tab B" }));
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute("data-state", "inactive");
  });
});

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Components", href: "/components" },
  { label: "Settings", href: "/settings" },
];

describe("Navbar — rendering", () => {
  it("renders as a <nav> element", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders logo slot", () => {
    render(<Navbar logo={<span>MyApp</span>} />);
    expect(screen.getByText("MyApp")).toBeInTheDocument();
  });

  it("renders nav item labels", () => {
    render(<Navbar items={NAV_ITEMS} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
  });

  it("renders trailing slot", () => {
    render(<Navbar trailing={<span>v1.0</span>} />);
    expect(screen.getByText("v1.0")).toBeInTheDocument();
  });

  it("active item has aria-current='page'", () => {
    render(<Navbar items={NAV_ITEMS} />);
    const activeLinks = screen.getAllByText("Dashboard");
    const withCurrent = activeLinks.filter(
      (el) => el.getAttribute("aria-current") === "page",
    );
    expect(withCurrent.length).toBeGreaterThan(0);
  });

  it("inactive items do NOT have aria-current='page'", () => {
    render(<Navbar items={NAV_ITEMS} />);
    const components = screen.getAllByText("Components");
    components.forEach((el) =>
      expect(el).not.toHaveAttribute("aria-current", "page"),
    );
  });
});

describe("Navbar — sticky", () => {
  it("sticky=false: no 'sticky' class on nav", () => {
    const { container } = render(<Navbar sticky={false} />);
    expect(container.querySelector("nav")!.className).not.toContain("sticky");
  });

  it("sticky=true: adds 'sticky' class", () => {
    const { container } = render(<Navbar sticky />);
    expect(container.querySelector("nav")!.className).toContain("sticky");
  });
});

describe("Navbar — mobile hamburger", () => {
  it("hamburger button present when items exist", () => {
    render(<Navbar items={NAV_ITEMS} />);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });

  it("hamburger button has aria-expanded=false initially", () => {
    render(<Navbar items={NAV_ITEMS} />);
    const btn = screen.getByRole("button", { name: "Open menu" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking hamburger changes aria-label to 'Close menu'", () => {
    render(<Navbar items={NAV_ITEMS} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(
      screen.getByRole("button", { name: "Close menu" }),
    ).toBeInTheDocument();
  });

  it("clicking hamburger again closes the menu", () => {
    render(<Navbar items={NAV_ITEMS} />);
    const btn = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(btn);
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });

  it("no hamburger button when items list is empty", () => {
    render(<Navbar items={[]} />);
    expect(
      screen.queryByRole("button", { name: "Open menu" }),
    ).not.toBeInTheDocument();
  });

  it("item onClick is called when mobile menu item is clicked", () => {
    const onClick = vi.fn();
    const items: NavItem[] = [{ label: "Go", onClick }];
    render(<Navbar items={items} />);
    // Open mobile menu
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    // Click the item in the mobile menu (second occurrence)
    const links = screen.getAllByText("Go");
    fireEvent.click(links[links.length - 1]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const GROUPS: SidebarGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", active: true },
      { label: "Components", href: "/components" },
    ],
  },
  {
    label: "Help",
    items: [{ label: "Docs", href: "/docs" }],
  },
];

describe("Sidebar — rendering", () => {
  it("renders as <aside> with aria-label='Sidebar navigation'", () => {
    render(<Sidebar />);
    expect(
      screen.getByRole("complementary", { name: "Sidebar navigation" }),
    ).toBeInTheDocument();
  });

  it("renders group labels", () => {
    render(<Sidebar groups={GROUPS} />);
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders item labels", () => {
    render(<Sidebar groups={GROUPS} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("active item has aria-current='page'", () => {
    render(<Sidebar groups={GROUPS} />);
    // Item text is in a <span> inside <a aria-current="page">
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("inactive items do NOT have aria-current='page'", () => {
    render(<Sidebar groups={GROUPS} />);
    expect(screen.getByText("Components")).not.toHaveAttribute("aria-current");
  });

  it("renders header slot", () => {
    render(<Sidebar header={<span>Nav header</span>} />);
    expect(screen.getByText("Nav header")).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    render(<Sidebar footer={<span>Nav footer</span>} />);
    expect(screen.getByText("Nav footer")).toBeInTheDocument();
  });
});

describe("Sidebar — collapsed", () => {
  it("collapsed=false: width is the default '15rem'", () => {
    const { container } = render(<Sidebar groups={GROUPS} collapsed={false} />);
    const aside = container.querySelector("aside")!;
    expect(aside.style.width).toBe("15rem");
  });

  it("collapsed=true: width collapses to '3.5rem'", () => {
    const { container } = render(<Sidebar groups={GROUPS} collapsed={true} />);
    const aside = container.querySelector("aside")!;
    expect(aside.style.width).toBe("3.5rem");
  });

  it("collapsed=true: group labels are hidden", () => {
    render(<Sidebar groups={GROUPS} collapsed={true} />);
    expect(screen.queryByText("Main")).not.toBeInTheDocument();
    expect(screen.queryByText("Help")).not.toBeInTheDocument();
  });

  it("collapsed=false: group labels are visible", () => {
    render(<Sidebar groups={GROUPS} collapsed={false} />);
    expect(screen.getByText("Main")).toBeInTheDocument();
  });

  it("custom width prop is applied when not collapsed", () => {
    const { container } = render(
      <Sidebar groups={GROUPS} collapsed={false} width="20rem" />,
    );
    expect(container.querySelector("aside")!.style.width).toBe("20rem");
  });
});
