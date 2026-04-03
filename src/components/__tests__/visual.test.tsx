import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { A, Avatar, Divider } from "../visual/Visual";

// ─── Divider ──────────────────────────────────────────────────────────────────

describe("Divider — horizontal (default)", () => {
  it("has role='separator'", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("includes h-px class", () => {
    const { container } = render(<Divider />);
    expect(container.firstElementChild!.className).toContain("h-px");
  });

  it("does NOT have aria-orientation='vertical'", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).not.toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });
});

describe("Divider — vertical", () => {
  it("has role='separator'", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("has aria-orientation='vertical'", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("includes w-px class", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstElementChild!.className).toContain("w-px");
  });

  it("does NOT include h-px class", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstElementChild!.className).not.toContain("h-px");
  });
});

describe("Divider — labeled", () => {
  it("renders label text", () => {
    render(<Divider label="or continue with" />);
    expect(screen.getByText("or continue with")).toBeInTheDocument();
  });

  it("still has role='separator'", () => {
    render(<Divider label="or" />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("label is not shown when label prop omitted", () => {
    render(<Divider />);
    expect(screen.queryByText("or continue with")).not.toBeInTheDocument();
  });
});

// ─── Avatar ───────────────────────────────────────────────────────────────────

describe("Avatar — sizes", () => {
  const cases = [
    { size: "sm", cls: "size-7" },
    { size: "md", cls: "size-9" },
    { size: "lg", cls: "size-11" },
    { size: "xl", cls: "size-14" },
  ] as const;

  for (const { size, cls } of cases) {
    it(`size="${size}" applies ${cls} class`, () => {
      const { container } = render(<Avatar size={size} />);
      expect(container.firstElementChild!.className).toContain(cls);
    });
  }

  it("defaults to size='md' (size-9)", () => {
    const { container } = render(<Avatar />);
    expect(container.firstElementChild!.className).toContain("size-9");
  });

  it("all 4 size class strings are distinct", () => {
    const sizes = ["sm", "md", "lg", "xl"] as const;
    const classes = new Set(
      sizes.map((s) => {
        const { container } = render(<Avatar size={s} />);
        return container.firstElementChild!.className;
      }),
    );
    expect(classes.size).toBe(4);
  });
});

describe("Avatar — fallback initials", () => {
  it("displays fallback text when no src provided", () => {
    render(<Avatar fallback="LK" />);
    expect(screen.getByText("LK")).toBeInTheDocument();
  });

  it("uppercases fallback and takes first 2 chars", () => {
    render(<Avatar fallback="abc" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("derives initials from alt when fallback omitted", () => {
    render(<Avatar alt="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("shows '?' when neither fallback nor alt provided", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});

describe("Avatar — src", () => {
  it("renders an <img> when src is provided", () => {
    const { container } = render(
      <Avatar src="https://example.com/avatar.jpg" alt="User" />,
    );
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("img has the correct src attribute", () => {
    const { container } = render(
      <Avatar src="https://example.com/avatar.jpg" alt="User" />,
    );
    expect(container.querySelector("img")!.src).toBe(
      "https://example.com/avatar.jpg",
    );
  });

  it("falls back to initials when img errors", () => {
    render(<Avatar src="bad-url" alt="Jane Smith" fallback="JS" />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("does NOT render <img> when no src", () => {
    const { container } = render(<Avatar fallback="AB" />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});

// ─── A (Link) ─────────────────────────────────────────────────────────────────

describe("A (Link)", () => {
  it("renders as an <a> element", () => {
    render(<A href="/home">Home</A>);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("href is passed through correctly", () => {
    render(<A href="/about">About</A>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/about");
  });

  it("renders children", () => {
    render(<A href="#">Click here</A>);
    expect(screen.getByText("Click here")).toBeInTheDocument();
  });

  it("includes text-accent class", () => {
    const { container } = render(<A href="#">link</A>);
    expect(container.firstElementChild!.className).toContain("text-accent");
  });

  it("includes hover:underline class", () => {
    const { container } = render(<A href="#">link</A>);
    expect(container.firstElementChild!.className).toContain("hover:underline");
  });

  it("applies extra className", () => {
    const { container } = render(
      <A href="#" className="no-underline">
        link
      </A>,
    );
    expect(container.firstElementChild!.className).toContain("no-underline");
  });
});
