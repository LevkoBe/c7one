import React from "react";
import { cn } from "../../utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GalleryAspect = "square" | "video" | "portrait" | "auto";
export type GalleryCols = 2 | 3 | 4 | 5 | 6;

export interface GalleryProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  cols?: GalleryCols;
  aspect?: GalleryAspect;
  gap?: "sm" | "md" | "lg";
  className?: string;
  emptyMessage?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const colClasses: Record<GalleryCols, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
};

const gapClasses = { sm: "gap-2", md: "gap-4", lg: "gap-6" };

const aspectClasses: Record<GalleryAspect, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Gallery<T>({
  items,
  renderItem,
  keyExtractor,
  cols = 3,
  aspect = "square",
  gap = "md",
  className,
  emptyMessage = "Nothing to show",
}: GalleryProps<T>) {
  if (items.length === 0) {
    return (
      <p
        className={cn("py-10 text-center text-sm text-fg-disabled", className)}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
      {items.map((item, i) => (
        <div
          key={keyExtractor ? keyExtractor(item, i) : i}
          className={cn(
            "overflow-hidden rounded",
            aspect !== "auto" && aspectClasses[aspect],
          )}
        >
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}

// ─── GalleryCard — convenience item wrapper ───────────────────────────────────

export interface GalleryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  label?: string;
  sublabel?: string;
  overlay?: boolean;
}

export function GalleryCard({
  src,
  alt,
  label,
  sublabel,
  overlay = false,
  className,
  children,
  ...props
}: GalleryCardProps) {
  return (
    <div
      className={cn(
        "relative group w-full h-full",
        "bg-bg-elevated [border-width:var(--border-width)] border-border",
        "overflow-hidden transition-[transform,box-shadow] duration-(--transition-speed)",
        "hover:scale-[1.02]",
        className,
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt ?? ""}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      {children}
      {(label || sublabel) && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 px-3 py-2",
            overlay
              ? "bg-linear-to-t from-black/70 to-transparent"
              : "bg-bg-elevated border-t border-border",
          )}
        >
          {label && (
            <p
              className={cn(
                "text-xs font-medium truncate",
                overlay ? "text-white" : "text-fg-primary",
              )}
            >
              {label}
            </p>
          )}
          {sublabel && (
            <p
              className={cn(
                "text-[10px] truncate mt-0.5",
                overlay ? "text-white/70" : "text-fg-muted",
              )}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
