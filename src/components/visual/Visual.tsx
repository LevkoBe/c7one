import React from "react";
import { cn } from "../../utils/cn";

// ─── Divider ──────────────────────────────────────────────────────────────────

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = "horizontal", label, className, ...props }, ref) => {
    if (orientation === "vertical") {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="vertical"
          className={cn("w-px self-stretch bg-border", className)}
          {...props}
        />
      );
    }
    if (label) {
      return (
        <div
          ref={ref}
          role="separator"
          className={cn("flex items-center gap-3", className)}
          {...props}
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-fg-disabled shrink-0">{label}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      );
    }
    return (
      <div
        ref={ref}
        role="separator"
        className={cn("h-px w-full bg-border", className)}
        {...props}
      />
    );
  },
);
Divider.displayName = "Divider";

// ─── Avatar ───────────────────────────────────────────────────────────────────

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
}

const avatarSizes: Record<AvatarSize, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
  xl: "size-14 text-lg",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = "md", className, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const initials = fallback
      ? fallback.slice(0, 2).toUpperCase()
      : (alt
          ?.split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() ?? "?");

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden",
          "bg-bg-overlay text-fg-muted font-semibold select-none",
          "border-[length:--border-width] border-border",
          avatarSizes[size],
          className,
        )}
        {...props}
      >
        {src && !error ? (
          <img
            src={src}
            alt={alt ?? ""}
            onError={() => setError(true)}
            className="size-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

// ─── A (Link) ─────────────────────────────────────────────────────────────────

export const A = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "text-accent underline-offset-4 hover:underline",
      "transition-colors duration-[--transition-speed]",
      "hover:text-accent-hover",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
      className,
    )}
    {...props}
  />
));
A.displayName = "A";
