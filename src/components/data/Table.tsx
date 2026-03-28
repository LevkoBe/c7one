import React, { useState, useMemo } from "react";
import { cn } from "../../utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export interface ColumnDef<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Controlled pagination slot — render your own pagination UI here */
  paginationSlot?: React.ReactNode;
  className?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <span className="inline-flex flex-col gap-px ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        className={direction === "asc" ? "opacity-100" : "opacity-30"}
      >
        <path d="M4 0.5L7.5 4.5H0.5L4 0.5Z" fill="currentColor" />
      </svg>
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        className={direction === "desc" ? "opacity-100" : "opacity-30"}
      >
        <path d="M4 4.5L0.5 0.5H7.5L4 4.5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Table<T extends object>({
  data,
  columns,
  paginationSlot,
  className,
  rowClassName,
  onRowClick,
  emptyMessage = "No data",
  stickyHeader = false,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full overflow-x-auto rounded-[--radius] border-[length:--border-width] border-border">
        <table className="w-full border-collapse text-sm">
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr className="bg-bg-elevated">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    "px-4 py-3 font-semibold text-fg-muted border-b border-border",
                    alignClass[col.align ?? "left"],
                    col.sortable &&
                      "cursor-pointer select-none group hover:text-fg-primary transition-colors duration-[--transition-speed]",
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {col.sortable && (
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-fg-disabled text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border last:border-0",
                    "bg-bg-base transition-colors duration-[--transition-speed]",
                    onRowClick && "cursor-pointer hover:bg-bg-elevated",
                    rowClassName?.(row, i),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-fg-primary",
                        alignClass[col.align ?? "left"],
                      )}
                    >
                      {col.render
                        ? col.render(
                            (row as Record<string, unknown>)[col.key],
                            row,
                          )
                        : String(
                            (row as Record<string, unknown>)[col.key] ?? "",
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginationSlot && (
        <div className="mt-3 flex items-center justify-between px-1">
          {paginationSlot}
        </div>
      )}
    </div>
  );
}

// ─── Pagination helper ────────────────────────────────────────────────────────

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1 text-xs rounded-[calc(var(--radius)*0.75)] text-fg-muted hover:bg-bg-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors duration-[--transition-speed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        ←
      </button>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            "w-7 h-7 text-xs rounded-[calc(var(--radius)*0.75)]",
            "transition-colors duration-[--transition-speed]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            p === page
              ? "bg-accent text-bg-base font-semibold"
              : "text-fg-muted hover:bg-bg-elevated",
          )}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1 text-xs rounded-[calc(var(--radius)*0.75)] text-fg-muted hover:bg-bg-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors duration-[--transition-speed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        →
      </button>
      <span className="ml-2 text-xs text-fg-disabled">
        {page} / {pageCount}
      </span>
    </div>
  );
}
