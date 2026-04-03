/**
 * Layer 3a — every component × dark theme + classic mode baseline
 *
 * Each component is mounted inside C7OneProvider at the canonical baseline
 * (defaultMode="classic", config.colors=themes.dark). Tests verify:
 *   1. The component renders without crashing in a real provider context.
 *   2. The provider injected its tokens onto :root (spot-check per describe).
 *   3. The component's own key default class / aria attribute is still present.
 *
 * Isolated component tests (structural.test, form.test, etc.) prove the
 * component logic in isolation. These tests prove the component + provider
 * work correctly together as a unit.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, afterEach } from "vitest";

import { C7OneProvider } from "../../context/C7OneContext";
import * as themes from "../../ccc/themes";

// ── Structural ────────────────────────────────────────────────────────────────
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../structural/Card";
import { Modal, ModalContent } from "../structural/Modal";
import { Drawer, DrawerContent } from "../structural/Drawer";
import { Header, Footer, Section } from "../structural/Layout";

// ── Textual ───────────────────────────────────────────────────────────────────
import {
  H1, H2, H3, H4, H5, H6,
  Body, Code, Label, Kbd,
} from "../textual/Typography";
import { Badge } from "../textual/Badge";

// ── Form ──────────────────────────────────────────────────────────────────────
import { Button } from "../form/Button";
import { Input } from "../form/Input";
import {
  Textarea, Checkbox, Toggle, Slider,
} from "../form/FormControls";

// ── Feedback ──────────────────────────────────────────────────────────────────
import {
  Alert, Spinner, Progress, Skeleton,
  Toast, ToastProvider, ToastViewport,
} from "../feedback/Feedback";

// ── Visual ────────────────────────────────────────────────────────────────────
import { Divider, Avatar, A } from "../visual/Visual";

// ── Navigation ────────────────────────────────────────────────────────────────
import {
  Breadcrumb,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "../navigation/Navigation";
import { Navbar, Sidebar } from "../navigation/NavSidebar";

// ── Data ──────────────────────────────────────────────────────────────────────
import { Table, Pagination } from "../data/Table";
import { List, ListItem } from "../data/List";
import { Gallery, GalleryCard } from "../data/Gallery";
import { DataGrid } from "../data/DataGrid";

// ── Settings ──────────────────────────────────────────────────────────────────
import { SettingsPanel } from "../../settings/SettingsPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const root = () => document.documentElement;

function baseline(children: React.ReactNode) {
  return (
    <C7OneProvider defaultMode="classic" config={{ colors: themes.dark }}>
      {children}
    </C7OneProvider>
  );
}

afterEach(() => {
  root().removeAttribute("style");
  root().className = "";
});

// ─── Provider state at baseline ───────────────────────────────────────────────

describe("baseline provider — dark + classic", () => {
  it("injects --color-accent from dark theme onto :root", () => {
    render(baseline(<div />));
    expect(root().style.getPropertyValue("--color-accent")).toBe(
      themes.dark["--color-accent"],
    );
  });

  it("injects all 12 dark color tokens onto :root", () => {
    render(baseline(<div />));
    for (const [token, value] of Object.entries(themes.dark)) {
      expect(root().style.getPropertyValue(token)).toBe(value);
    }
  });

  it("classic mode: no design-* class added to :root", () => {
    render(baseline(<div />));
    expect(root().classList.contains("design-neo")).toBe(false);
    expect(root().classList.contains("design-glass")).toBe(false);
    expect(root().classList.contains("design-minimal")).toBe(false);
  });
});

// ─── 3a: Structural ──────────────────────────────────────────────────────────

describe("Card — baseline render inside provider", () => {
  it("Card with all sub-components renders", () => {
    render(
      baseline(
        <Card>
          <CardHeader><CardTitle>Title</CardTitle></CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      ),
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("Card default (flat) variant: includes bg-bg-elevated class", () => {
    const { container } = render(baseline(<Card />));
    // flat is the default; it uses bg-bg-elevated (slightly raised surface)
    expect(container.querySelector("div")!.className).toContain("bg-bg-elevated");
  });
});

describe("Modal — baseline render inside provider", () => {
  it("closed Modal does not render content", () => {
    render(baseline(<Modal open={false}><ModalContent>hidden</ModalContent></Modal>));
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("open Modal renders content", () => {
    render(baseline(<Modal open><ModalContent>open content</ModalContent></Modal>));
    expect(screen.getByText("open content")).toBeInTheDocument();
  });
});

describe("Drawer — baseline render inside provider", () => {
  it("closed Drawer does not render content", () => {
    render(baseline(<Drawer open={false}><DrawerContent>hidden</DrawerContent></Drawer>));
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("open Drawer renders content via portal", () => {
    render(baseline(<Drawer open><DrawerContent>drawer body</DrawerContent></Drawer>));
    expect(screen.getByText("drawer body")).toBeInTheDocument();
  });
});

describe("Header, Footer, Section — baseline render inside provider", () => {
  it("Header renders as <header>", () => {
    render(baseline(<Header>top</Header>));
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("Footer renders as <footer>", () => {
    render(baseline(<Footer>bottom</Footer>));
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("Section renders a <section> element", () => {
    const { container } = render(baseline(<Section>content</Section>));
    // Section wraps children in an inner <div> for max-width; the outer element is <section>
    expect(container.querySelector("section")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

// ─── 3a: Textual ─────────────────────────────────────────────────────────────

describe("Headings — baseline render inside provider", () => {
  it("H1 renders as h1", () => {
    render(baseline(<H1>Heading</H1>));
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
  it("H2 renders as h2", () => {
    render(baseline(<H2>Heading</H2>));
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
  it("H3 renders as h3", () => {
    render(baseline(<H3>Heading</H3>));
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
  it("H4 renders as h4", () => {
    render(baseline(<H4>Heading</H4>));
    expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
  });
  it("H5 renders as h5", () => {
    render(baseline(<H5>Heading</H5>));
    expect(screen.getByRole("heading", { level: 5 })).toBeInTheDocument();
  });
  it("H6 renders as h6", () => {
    render(baseline(<H6>Heading</H6>));
    expect(screen.getByRole("heading", { level: 6 })).toBeInTheDocument();
  });
});

describe("Body, Code, Label, Kbd, Badge — baseline render inside provider", () => {
  it("Body renders a paragraph", () => {
    render(baseline(<Body>text</Body>));
    expect(screen.getByText("text").tagName).toBe("P");
  });

  it("Code inline renders <code> with text-accent class", () => {
    const { container } = render(baseline(<Code>console.log</Code>));
    expect(container.querySelector("code")!.className).toContain("text-accent");
  });

  it("Label renders a <label>", () => {
    render(baseline(<Label>Name</Label>));
    expect(screen.getByText("Name").tagName).toBe("LABEL");
  });

  it("Kbd renders a <kbd>", () => {
    render(baseline(<Kbd>Enter</Kbd>));
    expect(screen.getByText("Enter").tagName).toBe("KBD");
  });

  it("Badge default (neutral) renders as <span>", () => {
    const { container } = render(baseline(<Badge>tag</Badge>));
    expect(container.querySelector("span")).toBeInTheDocument();
    expect(screen.getByText("tag")).toBeInTheDocument();
  });
});

// ─── 3a: Form ────────────────────────────────────────────────────────────────

describe("Button — baseline render inside provider", () => {
  it("primary Button renders with bg-accent class", () => {
    const { container } = render(baseline(<Button variant="primary">Go</Button>));
    expect(container.querySelector("button")!.className).toContain("bg-accent");
  });

  it("secondary Button renders as button", () => {
    render(baseline(<Button variant="secondary">Cancel</Button>));
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});

describe("Input — baseline render inside provider", () => {
  it("Input renders as textbox", () => {
    render(baseline(<Input placeholder="Enter value" />));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("Input error state: has border-error class", () => {
    const { container } = render(baseline(<Input error />));
    expect(container.querySelector("input")!.className).toContain("border-error");
  });
});

describe("Textarea — baseline render inside provider", () => {
  it("Textarea renders", () => {
    render(baseline(<Textarea placeholder="Write here" />));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

describe("Checkbox — baseline render inside provider", () => {
  it("Checkbox renders with role=checkbox", () => {
    render(baseline(<Checkbox />));
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});

describe("Toggle — baseline render inside provider", () => {
  it("Toggle renders with role=switch", () => {
    render(baseline(<Toggle />));
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});

describe("Slider — baseline render inside provider", () => {
  it("Slider renders with role=slider", () => {
    render(baseline(<Slider defaultValue={[50]} />));
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("Slider showValue=true renders value text", () => {
    render(baseline(<Slider value={[42]} showValue />));
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});

// ─── 3a: Feedback ────────────────────────────────────────────────────────────

describe("Alert — baseline render inside provider", () => {
  it("Alert renders with role=alert", () => {
    render(baseline(<Alert>message</Alert>));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("Spinner — baseline render inside provider", () => {
  it("Spinner renders with role=status and aria-label=Loading", () => {
    render(baseline(<Spinner />));
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});

describe("Progress — baseline render inside provider", () => {
  it("Progress value=60 sets indicator width to 60%", () => {
    const { container } = render(baseline(<Progress value={60} max={100} />));
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("60%");
  });
});

describe("Skeleton — baseline render inside provider", () => {
  it("Skeleton includes animate-pulse class", () => {
    const { container } = render(baseline(<Skeleton />));
    expect(container.firstElementChild!.className).toContain("animate-pulse");
  });
});

describe("Toast — baseline render inside provider", () => {
  it("open Toast renders its title inside the provider", () => {
    render(
      baseline(
        <ToastProvider>
          <Toast open title="Saved!" />
          <ToastViewport />
        </ToastProvider>,
      ),
    );
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });
});

// ─── 3a: Visual ──────────────────────────────────────────────────────────────

describe("Divider — baseline render inside provider", () => {
  it("horizontal Divider renders with role=separator", () => {
    render(baseline(<Divider />));
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});

describe("Avatar — baseline render inside provider", () => {
  it("Avatar shows fallback initials", () => {
    render(baseline(<Avatar fallback="AB" />));
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

describe("A (Link) — baseline render inside provider", () => {
  it("A renders as an anchor with text-accent class", () => {
    const { container } = render(baseline(<A href="/home">Home</A>));
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(container.querySelector("a")!.className).toContain("text-accent");
  });
});

// ─── 3a: Navigation ──────────────────────────────────────────────────────────

describe("Breadcrumb — baseline render inside provider", () => {
  it("Breadcrumb renders all items and last has aria-current=page", () => {
    render(
      baseline(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Page" },
          ]}
        />,
      ),
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Page")).toHaveAttribute("aria-current", "page");
  });
});

describe("Tabs — baseline render inside provider", () => {
  it("Tabs render with default active panel visible", () => {
    render(
      baseline(
        <Tabs defaultValue="x">
          <TabsList>
            <TabsTrigger value="x">X</TabsTrigger>
            <TabsTrigger value="y">Y</TabsTrigger>
          </TabsList>
          <TabsContent value="x">Panel X</TabsContent>
          <TabsContent value="y">Panel Y</TabsContent>
        </Tabs>,
      ),
    );
    expect(screen.getByText("Panel X")).toBeInTheDocument();
    expect(screen.queryByText("Panel Y")).not.toBeInTheDocument();
  });
});

describe("Navbar — baseline render inside provider", () => {
  it("Navbar renders as nav with logo and items", () => {
    render(
      baseline(
        <Navbar
          logo={<span>Logo</span>}
          items={[{ label: "Home", href: "/" }]}
        />,
      ),
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Logo")).toBeInTheDocument();
  });
});

describe("Sidebar — baseline render inside provider", () => {
  it("Sidebar renders as complementary landmark with groups", () => {
    render(
      baseline(
        <Sidebar
          groups={[
            { label: "Nav", items: [{ label: "Dashboard", href: "/" }] },
          ]}
        />,
      ),
    );
    expect(
      screen.getByRole("complementary", { name: "Sidebar navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});

// ─── 3a: Data ────────────────────────────────────────────────────────────────

const TABLE_COLS = [
  { key: "name" as const, header: "Name" },
  { key: "age" as const, header: "Age" },
];
const TABLE_DATA = [{ name: "Alice", age: 30 }];

describe("Table — baseline render inside provider", () => {
  it("Table renders header and row data", () => {
    render(baseline(<Table data={TABLE_DATA} columns={TABLE_COLS} />));
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});

describe("Pagination — baseline render inside provider", () => {
  it("Pagination renders page buttons", () => {
    render(
      baseline(
        <Pagination page={1} pageCount={3} onPageChange={() => {}} />,
      ),
    );
    // Page buttons render their number as content
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

describe("List — baseline render inside provider", () => {
  it("List renders items as list", () => {
    render(
      baseline(
        <List
          items={["Alpha", "Beta"]}
          keyExtractor={(s) => s}
          renderItem={(s) => <ListItem>{s}</ListItem>}
        />,
      ),
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});

describe("Gallery — baseline render inside provider", () => {
  it("Gallery renders card items", () => {
    render(
      baseline(
        <Gallery
          items={[{ id: "1", label: "Photo 1" }]}
          keyExtractor={(i) => i.id}
          renderItem={(i) => <GalleryCard label={i.label} />}
        />,
      ),
    );
    expect(screen.getByText("Photo 1")).toBeInTheDocument();
  });
});

describe("DataGrid — baseline render inside provider", () => {
  it("DataGrid renders columns and row data", () => {
    render(
      baseline(
        <DataGrid
          columns={[{ key: "name" as const, header: "Name" }]}
          data={[{ name: "Bob" }]}
        />,
      ),
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});

// ─── 3a: SettingsPanel ───────────────────────────────────────────────────────

describe("SettingsPanel — baseline render inside provider", () => {
  it("SettingsPanel renders without crash (expose=all)", () => {
    render(baseline(<SettingsPanel />));
    // "Settings" heading is always present
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("expose=['mode']: renders mode buttons only", () => {
    render(baseline(<SettingsPanel expose={["mode"]} />));
    expect(screen.getByText("classic")).toBeInTheDocument();
    expect(screen.getByText("neo")).toBeInTheDocument();
    // Color section header should NOT be present
    expect(screen.queryByText("Theme")).not.toBeInTheDocument();
  });

  it("expose=['colors']: renders theme swatches only", () => {
    render(baseline(<SettingsPanel expose={["colors"]} />));
    expect(screen.getByText("Theme")).toBeInTheDocument();
    // Mode buttons should NOT be present
    expect(screen.queryByText("Design Mode")).not.toBeInTheDocument();
  });

  it("expose=['shape.radius']: renders Shape section", () => {
    render(baseline(<SettingsPanel expose={["shape.radius"]} />));
    expect(screen.getByText("Shape")).toBeInTheDocument();
  });

  it("expose=['motion.transitionSpeed']: renders Motion section", () => {
    render(baseline(<SettingsPanel expose={["motion.transitionSpeed"]} />));
    expect(screen.getByText("Motion")).toBeInTheDocument();
  });

  it("expose=['depth.shadowIntensity']: renders Depth section", () => {
    render(baseline(<SettingsPanel expose={["depth.shadowIntensity"]} />));
    expect(screen.getByText("Depth")).toBeInTheDocument();
  });

  it("renderAppSettings slot is rendered when provided", () => {
    render(
      baseline(
        <SettingsPanel
          expose={[]}
          renderAppSettings={() => <span>custom-slot</span>}
        />,
      ),
    );
    expect(screen.getByText("custom-slot")).toBeInTheDocument();
  });
});
