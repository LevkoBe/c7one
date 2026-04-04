import React, { useRef, useState, useCallback, useMemo } from "react";
import { cn } from "../../utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataGridColumn<T> {
  key: keyof T & string;
  header: string;
  width: number; // px — required for virtualization math
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  frozen?: boolean; // pin column to the left
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  rowHeight?: number; // px, default 40
  visibleRows?: number; // how many rows fit in viewport before scrolling, default 12
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  selectedIndex?: number;
  emptyMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataGrid<T extends object>({
  data,
  columns,
  rowHeight = 40,
  visibleRows = 12,
  className,
  onRowClick,
  selectedIndex,
  emptyMessage = "No data",
}: DataGridProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const viewportHeight = rowHeight * visibleRows;
  const totalHeight = rowHeight * data.length;

  // Virtualization window
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(
    data.length - 1,
    Math.ceil((scrollTop + viewportHeight) / rowHeight),
  );
  const overscan = 3;
  const renderStart = Math.max(0, startIndex - overscan);
  const renderEnd = Math.min(data.length - 1, endIndex + overscan);

  const visibleData = useMemo(
    () => data.slice(renderStart, renderEnd + 1),
    [data, renderStart, renderEnd],
  );

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalWidth = columns.reduce((acc, c) => acc + c.width, 0);
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded",
        "[border-width:var(--border-width)] border-border",
        className,
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-bg-elevated border-b border-border">
        <div style={{ minWidth: totalWidth }}>
          <div className="flex">
            {columns.map((col) => (
              <div
                key={col.key}
                style={{ width: col.width, minWidth: col.width }}
                className={cn(
                  "px-3 py-2.5 text-xs font-semibold text-fg-muted shrink-0",
                  alignClass[col.align ?? "left"],
                  col.frozen && "sticky left-0 z-10 bg-bg-elevated",
                )}
              >
                {col.header}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ────────────────────────────────────────── */}
      {data.length === 0 ? (
        <div
          className="flex items-center justify-center text-sm text-fg-disabled"
          style={{ height: Math.min(viewportHeight, 160) }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="overflow-auto"
          style={{ height: viewportHeight }}
        >
          {/* Full height spacer for the scrollbar */}
          <div
            style={{
              height: totalHeight,
              minWidth: totalWidth,
              position: "relative",
            }}
          >
            {visibleData.map((row, i) => {
              const rowIndex = renderStart + i;
              const isSelected = selectedIndex === rowIndex;

              return (
                <div
                  key={rowIndex}
                  onClick={
                    onRowClick ? () => onRowClick(row, rowIndex) : undefined
                  }
                  style={{
                    position: "absolute",
                    top: rowIndex * rowHeight,
                    left: 0,
                    right: 0,
                    height: rowHeight,
                  }}
                  className={cn(
                    "flex border-b border-border last:border-0",
                    "transition-colors duration-(--transition-speed)",
                    isSelected
                      ? "bg-accent/10"
                      : "bg-bg-base hover:bg-bg-elevated",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      style={{ width: col.width, minWidth: col.width }}
                      className={cn(
                        "px-3 flex items-center text-xs text-fg-primary shrink-0 truncate",
                        alignClass[col.align ?? "left"],
                        col.frozen && "sticky left-0 z-10",
                        col.frozen &&
                          (isSelected ? "bg-accent/10" : "bg-bg-base"),
                      )}
                    >
                      <span className="truncate">
                        {col.render
                          ? col.render(
                              (row as Record<string, unknown>)[col.key],
                              row,
                              rowIndex,
                            )
                          : String(
                              (row as Record<string, unknown>)[col.key] ?? "",
                            )}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer: row count ──────────────────────────────────────── */}
      <div className="px-3 py-1.5 border-t border-border bg-bg-elevated">
        <span className="text-[10px] text-fg-disabled">
          {data.length.toLocaleString()} row{data.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
