import React from "react";
import { cn } from "../../utils/cn";

// ─── Header ───────────────────────────────────────────────────────────────────

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  /** Left slot: logo, wordmark, or icon. */
  logo?: React.ReactNode;
  /** Right slot: action buttons, controls. Horizontally scrollable if it overflows. */
  actions?: React.ReactNode;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ sticky = false, className, children, logo, actions, ...props }, ref) => {
    const structured = !!logo || !!actions;
    return (
      <header
        ref={ref}
        className={cn(
          "flex items-center shrink-0 px-5 h-14",
          !structured && "justify-between",
          "bg-bg-base border-b border-b-border",
          "transition-[background-color,border-color] duration-(--transition-speed)",
          sticky && "sticky top-0 z-40",
          className,
        )}
        {...props}
      >
        {structured ? (
          <>
            {logo && (
              <div className="flex items-center gap-2 shrink-0 mr-4">{logo}</div>
            )}
            {children && (
              <div className="flex-1 min-w-0 flex items-center">{children}</div>
            )}
            {actions && (
              <div className="flex items-center gap-2 min-w-0 ml-auto overflow-x-auto">
                {actions}
              </div>
            )}
          </>
        ) : (
          children
        )}
      </header>
    );
  },
);
Header.displayName = "Header";

// ─── Footer ───────────────────────────────────────────────────────────────────

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * When true, the footer becomes a horizontally-scrollable icon bar (h-14,
   * no vertical padding). Designed for the mobile window-tab bar in AppShell.
   */
  scrollable?: boolean;
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, children, scrollable = false, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        "border-t border-t-border shrink-0",
        "bg-bg-base text-fg-muted",
        "transition-[background-color,border-color] duration-(--transition-speed)",
        scrollable
          ? "flex items-center h-14 px-2 gap-1 overflow-x-auto"
          : "px-5 py-8",
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  ),
);
Footer.displayName = "Footer";

// ─── Section ─────────────────────────────────────────────────────────────────

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses: Record<NonNullable<SectionProps["maxWidth"]>, string> = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ maxWidth = "lg", className, children, ...props }, ref) => (
    <section ref={ref} className={cn("py-12 px-5", className)} {...props}>
      <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </section>
  ),
);
Section.displayName = "Section";
