import React from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-bg-overlay text-fg-muted border-border",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-error/15   text-error   border-error/30",
  accent: "bg-accent/15  text-accent  border-accent/30",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "neutral", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5",
        "text-xs font-medium rounded-[calc(var(--radius)*0.75)]",
        "[border-width:var(--border-width)]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = "Badge";
