import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../structural/Card";
import { Header, Footer, Section } from "../structural/Layout";
import { Modal } from "../structural/Modal";

// ─── Card ─────────────────────────────────────────────────────────────────────

describe("Card — variants", () => {
  it("flat variant includes bg-bg-elevated and border-border", () => {
    const { container } = render(<Card variant="flat" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("bg-bg-elevated");
    expect(el.className).toContain("border-border");
  });

  it("elevated variant includes shadow expression", () => {
    const { container } = render(<Card variant="elevated" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("shadow-");
  });

  it("outlined variant is bg-transparent", () => {
    const { container } = render(<Card variant="outlined" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("bg-transparent");
  });

  it("glass variant includes backdrop-blur", () => {
    const { container } = render(<Card variant="glass" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("backdrop-blur");
  });

  it("defaults to flat when no variant supplied", () => {
    const { container } = render(<Card />);
    const el = container.firstElementChild!;
    expect(el.className).toContain("bg-bg-elevated");
    expect(el.className).not.toContain("backdrop-blur");
  });

  it("flat and elevated produce different class strings", () => {
    const { container: a } = render(<Card variant="flat" />);
    const { container: b } = render(<Card variant="elevated" />);
    expect(a.firstElementChild!.className).not.toBe(
      b.firstElementChild!.className,
    );
  });
});

describe("Card — rendering", () => {
  it("renders children", () => {
    render(<Card>hello</Card>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies extra className", () => {
    const { container } = render(<Card className="my-custom" />);
    expect(container.firstElementChild!.className).toContain("my-custom");
  });

  it("CardHeader, CardTitle, CardDescription, CardContent, CardFooter all render", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("CardTitle renders as h3", () => {
    render(<CardTitle>Hello</CardTitle>);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
});

// ─── Modal ────────────────────────────────────────────────────────────────────

describe("Modal — open/closed", () => {
  it("content is not in the DOM when closed", () => {
    render(
      <Modal open={false}>
        <Modal.Content title="Secret" />
      </Modal>,
    );
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("content is in the DOM when open", () => {
    render(
      <Modal open={true}>
        <Modal.Content title="Visible Title" />
      </Modal>,
    );
    expect(screen.getByText("Visible Title")).toBeInTheDocument();
  });

  it("renders description when open", () => {
    render(
      <Modal open={true}>
        <Modal.Content title="T" description="My description" />
      </Modal>,
    );
    expect(screen.getByText("My description")).toBeInTheDocument();
  });

  it("renders children when open", () => {
    render(
      <Modal open={true}>
        <Modal.Content>
          <span>child content</span>
        </Modal.Content>
      </Modal>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("close button has aria-label='Close'", () => {
    render(
      <Modal open={true}>
        <Modal.Content title="T" />
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("clicking close calls onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <Modal.Content title="T" />
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// ─── Header ───────────────────────────────────────────────────────────────────

describe("Header", () => {
  it("renders as a <header> element", () => {
    const { container } = render(<Header />);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Header>Logo</Header>);
    expect(screen.getByText("Logo")).toBeInTheDocument();
  });

  it("non-sticky: does not include 'sticky' class", () => {
    const { container } = render(<Header sticky={false} />);
    expect(container.querySelector("header")!.className).not.toContain(
      "sticky",
    );
  });

  it("sticky=true adds 'sticky' class", () => {
    const { container } = render(<Header sticky={true} />);
    expect(container.querySelector("header")!.className).toContain("sticky");
  });
});

describe("Header — logo slot", () => {
  it("renders logo content", () => {
    render(<Header logo={<span>MyLogo</span>} />);
    expect(screen.getByText("MyLogo")).toBeInTheDocument();
  });

  it("logo wrapper has shrink-0 so it does not compress in flex", () => {
    const { container } = render(<Header logo={<span>L</span>} />);
    const logoWrapper = container.querySelector(".shrink-0");
    expect(logoWrapper).toBeInTheDocument();
    expect(logoWrapper).toContainElement(screen.getByText("L"));
  });

  it("logo renders alongside children", () => {
    render(<Header logo={<span>Logo</span>}><nav>Nav</nav></Header>);
    expect(screen.getByText("Logo")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});

describe("Header — actions slot", () => {
  it("renders actions content", () => {
    render(<Header actions={<button>Action</button>} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders all three slots together", () => {
    render(
      <Header logo={<span>Logo</span>} actions={<button>Act</button>}>
        <nav>Nav</nav>
      </Header>,
    );
    expect(screen.getByText("Logo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("without logo or actions, justify-between layout is used (no shrink-0 logo wrapper)", () => {
    const { container } = render(<Header><span>child</span></Header>);
    // In unstructured mode the header does not wrap children in a shrink-0 div
    const header = container.querySelector("header")!;
    expect(header.className).not.toContain("justify-between");
    // The child renders directly
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});

// ─── Footer ───────────────────────────────────────────────────────────────────

describe("Footer", () => {
  it("renders as a <footer> element", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Footer>Links</Footer>);
    expect(screen.getByText("Links")).toBeInTheDocument();
  });
});

describe("Footer — scrollable prop", () => {
  it("scrollable=true adds h-14 class", () => {
    const { container } = render(<Footer scrollable />);
    expect(container.querySelector("footer")!.className).toContain("h-14");
  });

  it("scrollable=true adds overflow-x-auto class", () => {
    const { container } = render(<Footer scrollable />);
    expect(container.querySelector("footer")!.className).toContain(
      "overflow-x-auto",
    );
  });

  it("scrollable=false (default) includes py-8 padding", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")!.className).toContain("py-8");
  });

  it("scrollable=true does not include py-8", () => {
    const { container } = render(<Footer scrollable />);
    expect(container.querySelector("footer")!.className).not.toContain("py-8");
  });

  it("scrollable footer renders children", () => {
    render(<Footer scrollable><button>Tab</button></Footer>);
    expect(screen.getByRole("button", { name: "Tab" })).toBeInTheDocument();
  });
});

// ─── Section ──────────────────────────────────────────────────────────────────

describe("Section — maxWidth", () => {
  const cases = [
    { maxWidth: "sm", cls: "max-w-xl" },
    { maxWidth: "md", cls: "max-w-3xl" },
    { maxWidth: "lg", cls: "max-w-5xl" },
    { maxWidth: "xl", cls: "max-w-6xl" },
    { maxWidth: "2xl", cls: "max-w-7xl" },
    { maxWidth: "full", cls: "max-w-none" },
  ] as const;

  for (const { maxWidth, cls } of cases) {
    it(`maxWidth="${maxWidth}" applies ${cls} to inner div`, () => {
      const { container } = render(<Section maxWidth={maxWidth} />);
      const inner = container.querySelector("div")!;
      expect(inner.className).toContain(cls);
    });
  }

  it("renders as a <section> element", () => {
    const { container } = render(<Section />);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Section>body content</Section>);
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("defaults to maxWidth='lg' (max-w-5xl)", () => {
    const { container } = render(<Section />);
    expect(container.querySelector("div")!.className).toContain("max-w-5xl");
  });
});

// ─── CSS token classes ────────────────────────────────────────────────────────
// Guards against broken Tailwind v4 arbitrary-value patterns that silently
// generate invalid CSS (no var() wrapper). See: border-[length:--x],
// duration-[--x], rounded-radius — all produce non-functional CSS declarations.

describe("Card — CSS token classes", () => {
  it("uses [border-width:var(--border-width)] for dynamic border", () => {
    const { container } = render(<Card />);
    expect(container.firstElementChild!.className).toContain(
      "[border-width:var(--border-width)]",
    );
  });

  it("uses duration-(--transition-speed) for dynamic transition", () => {
    const { container } = render(<Card />);
    expect(container.firstElementChild!.className).toContain(
      "duration-(--transition-speed)",
    );
  });

  it("uses 'rounded' (not 'rounded-radius') for dynamic border-radius", () => {
    const { container } = render(<Card />);
    const classes = container.firstElementChild!.className.split(" ");
    expect(classes).toContain("rounded");
    expect(classes).not.toContain("rounded-radius");
  });

  it("does not use broken border-[length:--border-width] syntax", () => {
    const { container } = render(<Card />);
    expect(container.firstElementChild!.className).not.toContain(
      "border-[length:--border-width]",
    );
  });
});
