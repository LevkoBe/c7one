import React from "react";
import { cn } from "../../utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  dividers?: boolean;
  className?: string;
  itemClassName?: string;
  emptyMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  dividers = true,
  className,
  itemClassName,
  emptyMessage = "No items",
}: ListProps<T>) {
  if (items.length === 0) {
    return (
      <p className={cn("py-6 text-center text-sm text-fg-disabled", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "rounded-[--radius] border-[length:--border-width] border-border overflow-hidden",
        className,
      )}
      role="list"
    >
      {items.map((item, i) => (
        <li
          key={keyExtractor ? keyExtractor(item, i) : i}
          className={cn(
            "bg-bg-elevated",
            dividers && i < items.length - 1 && "border-b border-border",
            itemClassName,
          )}
        >
          {renderItem(item, i)}
        </li>
      ))}
    </ul>
  );
}

// ─── Convenience: simple text list item ───────────────────────────────────────

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  description?: string;
}

export function ListItem({
  leading,
  trailing,
  description,
  className,
  children,
  ...props
}: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "transition-colors duration-[--transition-speed]",
        props.onClick && "cursor-pointer hover:bg-bg-overlay",
        className,
      )}
      {...props}
    >
      {leading && <span className="shrink-0 text-fg-muted">{leading}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-fg-primary truncate">{children}</p>
        {description && (
          <p className="text-xs text-fg-muted truncate mt-0.5">{description}</p>
        )}
      </div>
      {trailing && <span className="shrink-0 text-fg-muted">{trailing}</span>}
    </div>
  );
}
