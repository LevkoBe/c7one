import React from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import * as RadixSwitch from "@radix-ui/react-switch";
import * as RadixSlider from "@radix-ui/react-slider";
import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "../../utils/cn";

// ─── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[80px] px-3 py-2 text-sm resize-y",
        "bg-[--color-bg-elevated] text-[--color-fg-primary]",
        "border-[length:--border-width] rounded-[--radius]",
        "placeholder:text-[--color-fg-disabled]",
        "transition-[border-color,box-shadow] duration-[--transition-speed]",
        "focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:ring-offset-1 focus:ring-offset-[--color-bg-base]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error ? "border-[--color-error]" : "border-[--color-border]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps extends RadixCheckbox.CheckboxProps {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <RadixCheckbox.Root
        ref={ref}
        id={id}
        className={cn(
          "size-4 rounded-[calc(var(--radius)*0.5)] shrink-0",
          "border-[length:--border-width] border-[--color-border]",
          "bg-[--color-bg-elevated]",
          "transition-[background-color,border-color] duration-[--transition-speed]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]",
          "data-[state=checked]:bg-[--color-accent] data-[state=checked]:border-[--color-accent]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <RadixCheckbox.Indicator className="flex items-center justify-center text-[--color-bg-base]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1.5 5L4 7.5L8.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-[--color-fg-primary] cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  ),
);
Checkbox.displayName = "Checkbox";

// ─── Toggle (Switch) ──────────────────────────────────────────────────────────

export interface ToggleProps extends RadixSwitch.SwitchProps {
  label?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ label, className, id, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <RadixSwitch.Root
        ref={ref}
        id={id}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full",
          "border-[length:--border-width] border-transparent",
          "bg-[--color-bg-overlay] transition-colors duration-[--transition-speed]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]",
          "data-[state=checked]:bg-[--color-accent]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <RadixSwitch.Thumb
          className={cn(
            "pointer-events-none block size-4 rounded-full bg-white shadow-sm",
            "transition-transform duration-[--transition-speed]",
            "translate-x-0 data-[state=checked]:translate-x-4",
          )}
        />
      </RadixSwitch.Root>
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-[--color-fg-primary] cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  ),
);
Toggle.displayName = "Toggle";

// ─── Slider ───────────────────────────────────────────────────────────────────

export interface SliderProps extends RadixSlider.SliderProps {
  showValue?: boolean;
}

export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ showValue = false, className, ...props }, ref) => (
    <div className="flex items-center gap-3 w-full">
      <RadixSlider.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
        )}
        {...props}
      >
        <RadixSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[--color-bg-overlay]">
          <RadixSlider.Range className="absolute h-full bg-[--color-accent] transition-all duration-[--transition-speed]" />
        </RadixSlider.Track>
        {(props.value ?? props.defaultValue ?? [0]).map((_, i) => (
          <RadixSlider.Thumb
            key={i}
            className={cn(
              "block size-4 rounded-full bg-[--color-accent]",
              "border-2 border-[--color-bg-base]",
              "shadow-sm transition-transform duration-[--transition-speed]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]",
              "hover:scale-110",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        ))}
      </RadixSlider.Root>
      {showValue && (
        <span className="text-xs text-[--color-fg-muted] w-8 text-right tabular-nums">
          {props.value?.[0] ?? props.defaultValue?.[0] ?? 0}
        </span>
      )}
    </div>
  ),
);
Slider.displayName = "Slider";

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends RadixSelect.SelectProps {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  placeholder = "Select…",
  className,
  ...props
}: SelectProps) {
  return (
    <RadixSelect.Root {...props}>
      <RadixSelect.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between px-3 text-sm",
          "bg-[--color-bg-elevated] text-[--color-fg-primary]",
          "border-[length:--border-width] border-[--color-border] rounded-[--radius]",
          "transition-[border-color,box-shadow] duration-[--transition-speed]",
          "focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:ring-offset-1 focus:ring-offset-[--color-bg-base]",
          "data-placeholder:text-[--color-fg-disabled]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn(
            "relative z-50 min-w-[8rem] overflow-hidden",
            "bg-[--color-bg-elevated] border-[length:--border-width] border-[--color-border]",
            "rounded-[--radius] shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  "relative flex cursor-pointer select-none items-center",
                  "rounded-[calc(var(--radius)*0.75)] px-3 py-1.5 text-sm",
                  "text-[--color-fg-primary] outline-none",
                  "transition-colors duration-[--transition-speed]",
                  "focus:bg-[--color-bg-overlay] focus:text-[--color-fg-primary]",
                  "data-disabled:pointer-events-none data-disabled:opacity-50",
                )}
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
