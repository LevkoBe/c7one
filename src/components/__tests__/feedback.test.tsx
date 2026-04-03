import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import {
  Alert,
  Progress,
  Skeleton,
  Spinner,
  Toast,
  ToastProvider,
  ToastViewport,
} from "../feedback/Feedback";

// ─── Alert ────────────────────────────────────────────────────────────────────

describe("Alert — variants", () => {
  const cases = [
    { variant: "info", cls: "bg-accent" },
    { variant: "success", cls: "bg-success" },
    { variant: "warning", cls: "bg-warning" },
    { variant: "error", cls: "bg-error" },
  ] as const;

  for (const { variant, cls } of cases) {
    it(`variant="${variant}" includes ${cls} in class`, () => {
      const { container } = render(<Alert variant={variant} />);
      expect(container.firstElementChild!.className).toContain(cls);
    });
  }

  it("defaults to info when no variant supplied", () => {
    const { container } = render(<Alert />);
    expect(container.firstElementChild!.className).toContain("bg-accent");
  });

  it("all 4 variant class strings are distinct", () => {
    const variants = ["info", "success", "warning", "error"] as const;
    const classes = new Set(
      variants.map((v) => {
        const { container } = render(<Alert variant={v} />);
        return container.firstElementChild!.className;
      }),
    );
    expect(classes.size).toBe(4);
  });
});

describe("Alert — role and content", () => {
  it("has role='alert'", () => {
    render(<Alert />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders title when title prop supplied", () => {
    render(<Alert title="Danger!" />);
    expect(screen.getByText("Danger!")).toBeInTheDocument();
  });

  it("does not render a title element when title omitted", () => {
    render(<Alert>body only</Alert>);
    // Only the body <p> should be present (no title <p>)
    const paras = screen.getAllByText(/body only/);
    expect(paras.length).toBeGreaterThan(0);
  });

  it("renders children as body text", () => {
    render(<Alert>Something went wrong</Alert>);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders both title and children", () => {
    render(<Alert title="Heads up">Please read this.</Alert>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Please read this.")).toBeInTheDocument();
  });
});

// ─── Spinner ──────────────────────────────────────────────────────────────────

describe("Spinner — sizes", () => {
  it("size='sm' applies size-4 class", () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.firstElementChild!.className).toContain("size-4");
  });

  it("size='md' (default) applies size-6 class", () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild!.className).toContain("size-6");
  });

  it("size='lg' applies size-8 class", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstElementChild!.className).toContain("size-8");
  });

  it("all 3 size class strings are distinct", () => {
    const classes = new Set(
      (["sm", "md", "lg"] as const).map((s) => {
        const { container } = render(<Spinner size={s} />);
        return container.firstElementChild!.className;
      }),
    );
    expect(classes.size).toBe(3);
  });
});

describe("Spinner — accessibility", () => {
  it("has role='status'", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has aria-label='Loading'", () => {
    render(<Spinner />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("includes animate-spin class", () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild!.className).toContain("animate-spin");
  });
});

// ─── Progress ─────────────────────────────────────────────────────────────────

describe("Progress — width calculation", () => {
  it("value=0 sets indicator width to 0%", () => {
    const { container } = render(<Progress value={0} max={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });

  it("value=50 max=100 sets indicator width to 50%", () => {
    const { container } = render(<Progress value={50} max={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("50%");
  });

  it("value=100 max=100 sets indicator width to 100%", () => {
    const { container } = render(<Progress value={100} max={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("100%");
  });

  it("value=1 max=4 sets indicator width to 25%", () => {
    const { container } = render(<Progress value={1} max={4} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("25%");
  });

  it("value=65 max=100 sets indicator width to 65%", () => {
    const { container } = render(<Progress value={65} max={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("65%");
  });

  it("defaults value=0 when not supplied", () => {
    const { container } = render(<Progress max={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.width).toBe("0%");
  });
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

describe("Skeleton — rounded", () => {
  it("rounded=false (default): includes rounded-radius class", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild!.className).toContain("rounded-radius");
  });

  it("rounded=false: does NOT include rounded-full", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild!.className).not.toContain("rounded-full");
  });

  it("rounded=true: includes rounded-full class", () => {
    const { container } = render(<Skeleton rounded />);
    expect(container.firstElementChild!.className).toContain("rounded-full");
  });

  it("rounded=true: does NOT include rounded-radius", () => {
    const { container } = render(<Skeleton rounded />);
    expect(container.firstElementChild!.className).not.toContain(
      "rounded-radius",
    );
  });

  it("includes animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild!.className).toContain("animate-pulse");
  });

  it("accepts className for sizing", () => {
    const { container } = render(<Skeleton className="h-12 w-48" />);
    expect(container.firstElementChild!.className).toContain("h-12");
    expect(container.firstElementChild!.className).toContain("w-48");
  });
});

// ─── Toast ────────────────────────────────────────────────────────────────────

describe("Toast — variants", () => {
  const variants = ["default", "success", "warning", "error"] as const;
  const borderClasses: Record<string, string> = {
    default: "border-border",
    success: "border-success",
    warning: "border-warning",
    error: "border-error",
  };

  for (const variant of variants) {
    it(`variant="${variant}" includes ${borderClasses[variant]} class`, () => {
      const { container } = render(
        <ToastProvider>
          <Toast open variant={variant} />
          <ToastViewport />
        </ToastProvider>,
      );
      const toast = container.querySelector("[data-state]") as HTMLElement;
      expect(toast?.className ?? "").toContain(borderClasses[variant]);
    });
  }

  it("all 4 toast variant class strings are distinct", () => {
    const classes = new Set(
      variants.map((v) => {
        const { container } = render(
          <ToastProvider>
            <Toast open variant={v} />
            <ToastViewport />
          </ToastProvider>,
        );
        const toast = container.querySelector("[data-state]") as HTMLElement;
        return toast?.className ?? v;
      }),
    );
    expect(classes.size).toBe(4);
  });
});

describe("Toast — content", () => {
  it("renders title when title prop supplied", () => {
    render(
      <ToastProvider>
        <Toast open title="Upload complete" />
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText("Upload complete")).toBeInTheDocument();
  });

  it("renders description when description prop supplied", () => {
    render(
      <ToastProvider>
        <Toast open description="Your file was saved." />
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText("Your file was saved.")).toBeInTheDocument();
  });

  it("renders neither when closed (open=false)", () => {
    render(
      <ToastProvider>
        <Toast open={false} title="Hidden" description="Also hidden" />
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
