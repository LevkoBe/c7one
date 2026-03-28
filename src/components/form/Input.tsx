import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-9 px-3 text-sm",
        "bg-bg-elevated text-fg-primary",
        "border-[length:--border-width] rounded-radius",
        "placeholder:text-fg-disabled",
        "transition-[border-color,box-shadow] duration-transition-speed",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg-base",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error ? "border-error focus:ring-error" : "border-border",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
