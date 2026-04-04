import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../structural/Card";
import { Drawer } from "../structural/Drawer";
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

// ─── Drawer ───────────────────────────────────────────────────────────────────

describe("Drawer — open/closed", () => {
  it("content is absent when closed", () => {
    render(
      <Drawer open={false}>
        <Drawer.Content>Hidden</Drawer.Content>
      </Drawer>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("content is present when open", () => {
    render(
      <Drawer open={true}>
        <Drawer.Content>Visible</Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("close button has aria-label='Close'", () => {
    render(
      <Drawer open={true}>
        <Drawer.Content>Content</Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});

describe("Drawer — sides", () => {
  const sides = ["left", "right", "top", "bottom"] as const;
  for (const side of sides) {
    it(`side="${side}" includes slide-out-to-${side} class`, () => {
      render(
        <Drawer open={true}>
          <Drawer.Content side={side}>X</Drawer.Content>
        </Drawer>,
      );
      // DrawerContent uses Dialog.Content which has role="dialog".
      // [data-state="open"] also matches the Overlay — select by role instead.
      const content = screen.getByRole("dialog") as HTMLElement;
      expect(content.className).toContain(`slide-out-to-${side}`);
    });
  }
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

  it("uses duration-[var(--transition-speed)] for dynamic transition", () => {
    const { container } = render(<Card />);
    expect(container.firstElementChild!.className).toContain(
      "duration-[var(--transition-speed)]",
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
