import React, { useState } from "react";
import { cn } from "../../utils/cn";

// ─── Navbar ───────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  icon?: React.ReactNode;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  items?: NavItem[];
  trailing?: React.ReactNode;
  sticky?: boolean;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    { logo, items = [], trailing, sticky = false, className, ...props },
    ref,
  ) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
      <nav
        ref={ref}
        className={cn(
          "w-full bg-bg-base border-b border-border",
          "transition-[background-color,border-color] duration-[--transition-speed]",
          sticky && "sticky top-0 z-40",
          className,
        )}
        {...props}
      >
        {/* ── Desktop ─────────────────────────────────────────────── */}
        <div className="flex items-center h-14 px-5 gap-6">
          {logo && <div className="shrink-0">{logo}</div>}

          {/* Nav items — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.href ?? "#"}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[calc(var(--radius)*0.75)]",
                  "transition-colors duration-[--transition-speed]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  item.active
                    ? "bg-bg-elevated text-fg-primary font-medium"
                    : "text-fg-muted hover:text-fg-primary hover:bg-bg-elevated",
                )}
                aria-current={item.active ? "page" : undefined}
              >
                {item.icon && (
                  <span className="size-4 shrink-0">{item.icon}</span>
                )}
                {item.label}
              </a>
            ))}
          </div>

          {/* Trailing slot */}
          {trailing && (
            <div className="ml-auto shrink-0 hidden md:block">{trailing}</div>
          )}

          {/* Mobile hamburger */}
          {items.length > 0 && (
            <button
              className="ml-auto md:hidden flex flex-col gap-1.5 p-1.5 rounded-[calc(var(--radius)*0.75)] text-fg-muted hover:text-fg-primary hover:bg-bg-elevated transition-colors duration-[--transition-speed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 3L15 15M15 3L3 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <>
                  <span className="block w-5 h-0.5 bg-current rounded-full" />
                  <span className="block w-5 h-0.5 bg-current rounded-full" />
                  <span className="block w-5 h-0.5 bg-current rounded-full" />
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-bg-base px-3 py-2 flex flex-col gap-0.5">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.href ?? "#"}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-[calc(var(--radius)*0.75)]",
                  "transition-colors duration-[--transition-speed]",
                  item.active
                    ? "bg-bg-elevated text-fg-primary font-medium"
                    : "text-fg-muted hover:bg-bg-elevated hover:text-fg-primary",
                )}
              >
                {item.icon && (
                  <span className="size-4 shrink-0">{item.icon}</span>
                )}
                {item.label}
              </a>
            ))}
            {trailing && (
              <div className="pt-2 border-t border-border mt-1">{trailing}</div>
            )}
          </div>
        )}
      </nav>
    );
  },
);
Navbar.displayName = "Navbar";

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export interface SidebarGroup {
  label?: string;
  items: NavItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  groups?: SidebarGroup[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  width?: string;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      groups = [],
      header,
      footer,
      collapsed = false,
      width = "15rem",
      className,
      ...props
    },
    ref,
  ) => (
    <aside
      ref={ref}
      style={{ width: collapsed ? "3.5rem" : width }}
      className={cn(
        "flex flex-col h-full overflow-hidden",
        "bg-bg-elevated border-r border-border",
        "transition-[width] duration-[--transition-speed]",
        className,
      )}
      aria-label="Sidebar navigation"
      {...props}
    >
      {header && (
        <div
          className={cn(
            "shrink-0 border-b border-border",
            collapsed ? "px-2 py-3" : "px-4 py-3",
          )}
        >
          {header}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group.label && !collapsed && (
              <p className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-fg-disabled">
                {group.label}
              </p>
            )}
            {group.items.map((item, ii) => (
              <a
                key={ii}
                href={item.href ?? "#"}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 mx-2 rounded-[calc(var(--radius)*0.75)]",
                  "text-sm transition-colors duration-[--transition-speed]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                  item.active
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-fg-muted hover:bg-bg-overlay hover:text-fg-primary",
                )}
                aria-current={item.active ? "page" : undefined}
              >
                {item.icon && (
                  <span
                    className={cn("shrink-0", item.active ? "text-accent" : "")}
                  >
                    {item.icon}
                  </span>
                )}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {footer && (
        <div
          className={cn(
            "shrink-0 border-t border-border",
            collapsed ? "px-2 py-3" : "px-4 py-3",
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  ),
);
Sidebar.displayName = "Sidebar";
