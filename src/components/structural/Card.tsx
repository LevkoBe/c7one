import React from "react";
import { cn } from "../../utils/cn";

export type CardVariant = "flat" | "elevated" | "outlined" | "glass";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  flat: "bg-bg-elevated border-border",
  elevated:
    "bg-bg-elevated border-border shadow-[0_4px_24px_rgba(0,0,0,calc(0.18*var(--shadow-intensity,1)))]",
  outlined: "bg-transparent border-border",
  glass: "bg-white/5 border-white/10 backdrop-blur-md",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "flat", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-radius border-[length:--border-width] p-5",
        "transition-[background-color,border-color,box-shadow] duration-transition-speed",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold text-fg-primary leading-snug",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-fg-muted mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-fg-primary", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-5 flex items-center gap-3", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
