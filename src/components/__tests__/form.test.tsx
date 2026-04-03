import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../form/Button";
import { Input } from "../form/Input";
import {
  Checkbox,
  Slider,
  Textarea,
  Toggle,
} from "../form/FormControls";

// ─── Button — variants ────────────────────────────────────────────────────────

describe("Button — variants", () => {
  const cases = [
    { variant: "primary", cls: "bg-accent" },
    { variant: "secondary", cls: "bg-bg-elevated" },
    { variant: "ghost", cls: "bg-transparent" },
    { variant: "destructive", cls: "bg-error" },
    { variant: "outline", cls: "border-accent" },
  ] as const;

  for (const { variant, cls } of cases) {
    it(`variant="${variant}" includes ${cls}`, () => {
      const { container } = render(<Button variant={variant}>x</Button>);
      expect(container.firstElementChild!.className).toContain(cls);
    });
  }

  it("defaults to primary (bg-accent)", () => {
    const { container } = render(<Button>x</Button>);
    expect(container.firstElementChild!.className).toContain("bg-accent");
  });

  it("all 5 variant class strings are distinct", () => {
    const variants = ["primary", "secondary", "ghost", "destructive", "outline"] as const;
    const classes = new Set(
      variants.map((v) => {
        const { container } = render(<Button variant={v}>x</Button>);
        return container.firstElementChild!.className;
      }),
    );
    expect(classes.size).toBe(5);
  });
});

// ─── Button — sizes ───────────────────────────────────────────────────────────

describe("Button — sizes", () => {
  it("size='sm' applies h-8", () => {
    const { container } = render(<Button size="sm">x</Button>);
    expect(container.firstElementChild!.className).toContain("h-8");
  });

  it("size='md' (default) applies h-9", () => {
    const { container } = render(<Button>x</Button>);
    expect(container.firstElementChild!.className).toContain("h-9");
  });

  it("size='lg' applies h-11", () => {
    const { container } = render(<Button size="lg">x</Button>);
    expect(container.firstElementChild!.className).toContain("h-11");
  });
});

// ─── Button — states ──────────────────────────────────────────────────────────

describe("Button — loading state", () => {
  it("loading=true makes the button disabled", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("loading=true renders the spinner element", () => {
    const { container } = render(<Button loading>Save</Button>);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("loading=false renders no spinner", () => {
    const { container } = render(<Button loading={false}>Save</Button>);
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("loading=true does not fire onClick", () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Button — disabled state", () => {
  it("disabled=true makes the button disabled", () => {
    render(<Button disabled>Delete</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disabled button does not fire onClick", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Button — interaction", () => {
  it("onClick fires when enabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders children", () => {
    render(<Button>Submit</Button>);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("applies extra className", () => {
    const { container } = render(<Button className="my-cls">x</Button>);
    expect(container.firstElementChild!.className).toContain("my-cls");
  });
});

// ─── Input ────────────────────────────────────────────────────────────────────

describe("Input — normal state", () => {
  it("renders as an <input>", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("no-error: includes border-border class", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).toContain("border-border");
  });

  it("no-error: does NOT include border-error class", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).not.toContain("border-error");
  });

  it("passes placeholder through", () => {
    render(<Input placeholder="Type here…" />);
    expect(screen.getByPlaceholderText("Type here…")).toBeInTheDocument();
  });

  it("fires onChange when typed", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes value through", () => {
    render(<Input value="hello" onChange={() => {}} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "hello",
    );
  });
});

describe("Input — error state", () => {
  it("error=true includes border-error class", () => {
    render(<Input error />);
    expect(screen.getByRole("textbox").className).toContain("border-error");
  });

  it("error=true includes focus:ring-error class", () => {
    render(<Input error />);
    expect(screen.getByRole("textbox").className).toContain("focus:ring-error");
  });

  it("error=true does NOT include border-border class", () => {
    render(<Input error />);
    expect(screen.getByRole("textbox").className).not.toContain("border-border");
  });
});

// ─── Textarea ────────────────────────────────────────────────────────────────

describe("Textarea — normal/error state", () => {
  it("renders as a <textarea>", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("no-error: includes border-border", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").className).toContain("border-border");
  });

  it("error=true includes border-error", () => {
    render(<Textarea error />);
    expect(screen.getByRole("textbox").className).toContain("border-error");
  });

  it("error=true does NOT include border-border", () => {
    render(<Textarea error />);
    expect(screen.getByRole("textbox").className).not.toContain("border-border");
  });

  it("passes placeholder through", () => {
    render(<Textarea placeholder="Write here…" />);
    expect(screen.getByPlaceholderText("Write here…")).toBeInTheDocument();
  });

  it("fires onChange", () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

// ─── Checkbox ─────────────────────────────────────────────────────────────────

describe("Checkbox", () => {
  it("renders a button with role='checkbox'", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("unchecked by default", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("renders label text when label prop supplied", () => {
    render(<Checkbox id="cb1" label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("label is associated via htmlFor", () => {
    render(<Checkbox id="cb1" label="Accept" />);
    const label = screen.getByText("Accept").closest("label");
    expect(label).toHaveAttribute("for", "cb1");
  });

  it("no label element when label prop omitted", () => {
    render(<Checkbox />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("disabled prop disables the checkbox", () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("controlled: reflects checked prop", () => {
    render(<Checkbox checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });
});

// ─── Toggle (Switch) ──────────────────────────────────────────────────────────

describe("Toggle", () => {
  it("renders a button with role='switch'", () => {
    render(<Toggle />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("unchecked by default (aria-checked=false)", () => {
    render(<Toggle />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("renders label text when label prop supplied", () => {
    render(<Toggle id="tog1" label="Enable notifications" />);
    expect(screen.getByText("Enable notifications")).toBeInTheDocument();
  });

  it("disabled prop disables the switch", () => {
    render(<Toggle disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("controlled: reflects checked prop", () => {
    render(<Toggle checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});

// ─── Slider ───────────────────────────────────────────────────────────────────

describe("Slider", () => {
  it("renders a slider element", () => {
    render(<Slider defaultValue={[50]} min={0} max={100} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("showValue=false (default): no value span rendered", () => {
    const { container } = render(
      <Slider value={[42]} min={0} max={100} onValueChange={() => {}} />,
    );
    // The value span has tabular-nums class
    expect(container.querySelector(".tabular-nums")).not.toBeInTheDocument();
  });

  it("showValue=true: renders the current value as text", () => {
    render(
      <Slider
        showValue
        value={[42]}
        min={0}
        max={100}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("showValue=true updates displayed value when value prop changes", () => {
    const { rerender } = render(
      <Slider showValue value={[10]} min={0} max={100} onValueChange={() => {}} />,
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    rerender(
      <Slider showValue value={[80]} min={0} max={100} onValueChange={() => {}} />,
    );
    expect(screen.getByText("80")).toBeInTheDocument();
  });
});
