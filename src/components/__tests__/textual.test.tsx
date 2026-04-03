import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "../textual/Badge";
import {
  Body,
  Code,
  H1, H2, H3, H4, H5, H6,
  Kbd,
  Label,
} from "../textual/Typography";

// ─── Headings ─────────────────────────────────────────────────────────────────

describe("Headings — element + size class", () => {
  const cases = [
    { Tag: H1, level: 1, sizeClass: "text-4xl" },
    { Tag: H2, level: 2, sizeClass: "text-3xl" },
    { Tag: H3, level: 3, sizeClass: "text-2xl" },
    { Tag: H4, level: 4, sizeClass: "text-xl" },
    { Tag: H5, level: 5, sizeClass: "text-lg" },
    { Tag: H6, level: 6, sizeClass: "text-base" },
  ] as const;

  for (const { Tag, level, sizeClass } of cases) {
    it(`H${level} renders as <h${level}>`, () => {
      render(<Tag>Heading {level}</Tag>);
      expect(
        screen.getByRole("heading", { level }),
      ).toBeInTheDocument();
    });

    it(`H${level} has ${sizeClass} class`, () => {
      const { container } = render(<Tag>x</Tag>);
      expect(container.firstElementChild!.className).toContain(sizeClass);
    });

    it(`H${level} renders text content`, () => {
      render(<Tag>My heading</Tag>);
      expect(screen.getByText("My heading")).toBeInTheDocument();
    });

    it(`H${level} applies extra className`, () => {
      const { container } = render(<Tag className="extra">x</Tag>);
      expect(container.firstElementChild!.className).toContain("extra");
    });
  }

  it("all headings share font-semibold base class", () => {
    const tags = [H1, H2, H3, H4, H5, H6];
    for (const Tag of tags) {
      const { container } = render(<Tag>x</Tag>);
      expect(container.firstElementChild!.className).toContain("font-semibold");
    }
  });
});

// ─── Body ─────────────────────────────────────────────────────────────────────

describe("Body — sizes", () => {
  it("size='sm' applies text-xs", () => {
    const { container } = render(<Body size="sm">x</Body>);
    expect(container.firstElementChild!.className).toContain("text-xs");
  });

  it("size='md' (default) applies text-sm", () => {
    const { container } = render(<Body>x</Body>);
    expect(container.firstElementChild!.className).toContain("text-sm");
  });

  it("size='lg' applies text-base", () => {
    const { container } = render(<Body size="lg">x</Body>);
    expect(container.firstElementChild!.className).toContain("text-base");
  });
});

describe("Body — muted", () => {
  it("muted=false (default) uses text-fg-primary", () => {
    const { container } = render(<Body>x</Body>);
    expect(container.firstElementChild!.className).toContain("text-fg-primary");
  });

  it("muted=true uses text-fg-muted", () => {
    const { container } = render(<Body muted>x</Body>);
    expect(container.firstElementChild!.className).toContain("text-fg-muted");
    expect(container.firstElementChild!.className).not.toContain(
      "text-fg-primary",
    );
  });

  it("renders as <p>", () => {
    render(<Body>text</Body>);
    expect(screen.getByText("text").tagName).toBe("P");
  });

  it("all three sizes × muted produce different class strings", () => {
    const classes = new Set<string>();
    for (const size of ["sm", "md", "lg"] as const) {
      for (const muted of [false, true]) {
        const { container } = render(<Body size={size} muted={muted}>x</Body>);
        classes.add(container.firstElementChild!.className);
      }
    }
    expect(classes.size).toBe(6);
  });
});

// ─── Code ─────────────────────────────────────────────────────────────────────

describe("Code — inline vs block", () => {
  it("inline (default) renders as <code>", () => {
    render(<Code>snippet</Code>);
    const el = screen.getByText("snippet");
    expect(el.tagName).toBe("CODE");
  });

  it("inline includes text-accent class", () => {
    render(<Code>snippet</Code>);
    const el = screen.getByText("snippet");
    expect(el.className).toContain("text-accent");
  });

  it("block=true renders a <pre> wrapping a <code>", () => {
    const { container } = render(<Code block>code block</Code>);
    expect(container.querySelector("pre")).toBeInTheDocument();
    expect(container.querySelector("code")).toBeInTheDocument();
  });

  it("block=true renders text content", () => {
    render(<Code block>const x = 1</Code>);
    expect(screen.getByText("const x = 1")).toBeInTheDocument();
  });

  it("inline does NOT render a <pre>", () => {
    const { container } = render(<Code>snippet</Code>);
    expect(container.querySelector("pre")).not.toBeInTheDocument();
  });
});

// ─── Label ────────────────────────────────────────────────────────────────────

describe("Label", () => {
  it("renders as a <label> element", () => {
    render(<Label>My label</Label>);
    expect(screen.getByText("My label").tagName).toBe("LABEL");
  });

  it("passes htmlFor through to the label", () => {
    const { container } = render(<Label htmlFor="my-input">Name</Label>);
    expect(container.querySelector("label")!.htmlFor).toBe("my-input");
  });

  it("renders children", () => {
    render(<Label>Field name</Label>);
    expect(screen.getByText("Field name")).toBeInTheDocument();
  });
});

// ─── Kbd ──────────────────────────────────────────────────────────────────────

describe("Kbd", () => {
  it("renders as a <kbd> element", () => {
    render(<Kbd>⌘K</Kbd>);
    expect(screen.getByText("⌘K").tagName).toBe("KBD");
  });

  it("renders children text", () => {
    render(<Kbd>Ctrl+S</Kbd>);
    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
  });

  it("includes font-mono class", () => {
    const { container } = render(<Kbd>x</Kbd>);
    expect(container.firstElementChild!.className).toContain("font-mono");
  });
});

// ─── Badge ────────────────────────────────────────────────────────────────────

describe("Badge — variants", () => {
  it("neutral variant includes bg-bg-overlay", () => {
    const { container } = render(<Badge variant="neutral">n</Badge>);
    expect(container.firstElementChild!.className).toContain("bg-bg-overlay");
  });

  it("success variant includes bg-success", () => {
    const { container } = render(<Badge variant="success">s</Badge>);
    expect(container.firstElementChild!.className).toContain("bg-success");
  });

  it("warning variant includes bg-warning", () => {
    const { container } = render(<Badge variant="warning">w</Badge>);
    expect(container.firstElementChild!.className).toContain("bg-warning");
  });

  it("error variant includes bg-error", () => {
    const { container } = render(<Badge variant="error">e</Badge>);
    expect(container.firstElementChild!.className).toContain("bg-error");
  });

  it("accent variant includes bg-accent", () => {
    const { container } = render(<Badge variant="accent">a</Badge>);
    expect(container.firstElementChild!.className).toContain("bg-accent");
  });

  it("defaults to neutral when no variant supplied", () => {
    const { container } = render(<Badge>x</Badge>);
    expect(container.firstElementChild!.className).toContain("bg-bg-overlay");
  });

  it("all 5 variant class strings are distinct", () => {
    const variants = ["neutral", "success", "warning", "error", "accent"] as const;
    const classes = variants.map((v) => {
      const { container } = render(<Badge variant={v}>x</Badge>);
      return container.firstElementChild!.className;
    });
    expect(new Set(classes).size).toBe(5);
  });

  it("renders as <span>", () => {
    render(<Badge>tag</Badge>);
    expect(screen.getByText("tag").tagName).toBe("SPAN");
  });

  it("renders children", () => {
    render(<Badge variant="success">active</Badge>);
    expect(screen.getByText("active")).toBeInTheDocument();
  });
});
