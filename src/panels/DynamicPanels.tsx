// No react-resizable-panels — layout is plain CSS flex with custom drag handles.
// Sizing model: each GroupNode stores dividerPositions (N-1 percentages for N
// children). Moving divider[i] only affects children[i] and children[i+1].
// All other panels are completely unaffected — correct VSCode-style behavior.

import React, { useCallback, useRef, useState } from "react";
import { WindowProvider, useWindowContext } from "./WindowContext";
import type {
  GroupNode,
  LayoutNodeDecl,
  LeafNode,
  PanelTreeNode,
  SplitDirection,
  WindowDef,
} from "./WindowContext";
import { WindowSelector } from "./WindowSelector";
import { cn } from "../utils/cn";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_H = 32;     // px — matches h-8
const EDGE_T   = 28;     // px — proximity threshold for showing [+]

// ─── DynamicPanelRoot ─────────────────────────────────────────────────────────

export interface DynamicPanelRootProps {
  windows: WindowDef[];
  layout: LayoutNodeDecl;
  /** Reserved for future localStorage persistence of divider positions. */
  storageKey?: string;
  className?: string;
}

export function DynamicPanelRoot({ windows, layout, className }: DynamicPanelRootProps) {
  return (
    <WindowProvider windows={windows} layout={layout}>
      <DynamicPanelInner className={className} />
    </WindowProvider>
  );
}

function DynamicPanelInner({ className }: { className?: string }) {
  const { tree } = useWindowContext();
  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      <TreeNode node={tree} />
    </div>
  );
}

// ─── TreeNode ─────────────────────────────────────────────────────────────────

function TreeNode({ node }: { node: PanelTreeNode }) {
  if (node.type === "group") return <DynamicGroup node={node} />;
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <LeafContent node={node} />
    </div>
  );
}

// ─── DynamicGroup ─────────────────────────────────────────────────────────────
//
// Renders a flex row/col. Each child gets a flex-basis derived from its
// divider-bounded percentage. Collapsed leaves get a fixed HEADER_H px slot.
//
// SIZING CORRECTNESS
// flex: {size} 1 0%  →  flex-grow = size (proportional weight), flex-shrink=1,
//                        flex-basis=0%.
// Since flex-basis is 0 for all slots, the container distributes all available
// space by grow weights. Collapsed slots use `flex: 0 0 {HEADER_H}px` and are
// excluded from proportional distribution. The remaining non-collapsed slots
// share the rest proportionally to their intended sizes — exactly right.

function computeSizes(dividerPositions: number[], n: number): number[] {
  const sizes: number[] = [];
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const end = i < dividerPositions.length ? dividerPositions[i] : 100;
    sizes.push(end - prev);
    prev = end;
  }
  return sizes;
}

function DynamicGroup({ node }: { node: GroupNode }) {
  const { moveDivider } = useWindowContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const isH = node.direction === "horizontal";
  const sizes = computeSizes(node.dividerPositions, node.children.length);

  const startDrag = useCallback(
    (dividerIndex: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const containerSize = isH ? rect.width : rect.height;
      const containerStart = isH ? rect.left : rect.top;
      if (containerSize === 0) return;

      const onMove = (ev: MouseEvent) => {
        const raw = isH ? ev.clientX : ev.clientY;
        const pct = ((raw - containerStart) / containerSize) * 100;
        moveDivider(node.id, dividerIndex, pct);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [isH, moveDivider, node.id],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full h-full min-h-0",
        isH ? "flex-row" : "flex-col",
      )}
    >
      {node.children.map((child, i) => {
        const isCollapsed = child.type === "leaf" && (child.collapsed ?? false);
        return (
          <React.Fragment key={child.id}>
            {i > 0 && (
              <ResizeHandle
                direction={node.direction}
                prevChild={node.children[i - 1]}
                nextChild={child}
                onStartDrag={startDrag(i - 1)}
              />
            )}
            <div
              className={cn("min-w-0 min-h-0 overflow-hidden flex", isH ? "flex-col" : "flex-row")}
              style={{
                flex: isCollapsed
                  ? `0 0 ${HEADER_H}px`
                  : `${sizes[i]} 1 0%`,
              }}
            >
              <TreeNode node={child} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── ResizeHandle ─────────────────────────────────────────────────────────────
//
// When either adjacent panel is collapsed: shows a restore chevron button
// instead of a drag target (dragging a handle next to a collapsed panel is
// confusing and effectively does nothing visible).

interface ResizeHandleProps {
  direction: SplitDirection;
  prevChild: PanelTreeNode;
  nextChild: PanelTreeNode;
  onStartDrag: (e: React.MouseEvent) => void;
}

function ResizeHandle({
  direction,
  prevChild,
  nextChild,
  onStartDrag,
}: ResizeHandleProps) {
  const { expandPanel } = useWindowContext();
  const isH = direction === "horizontal";

  const prevCollapsed = prevChild.type === "leaf" && (prevChild.collapsed ?? false);
  const nextCollapsed = nextChild.type === "leaf" && (nextChild.collapsed ?? false);
  const prevLeafId = prevChild.type === "leaf" ? prevChild.id : undefined;
  const nextLeafId = nextChild.type === "leaf" ? nextChild.id : undefined;

  if (prevCollapsed || nextCollapsed) {
    return (
      <div
        className={cn(
          "shrink-0 flex items-center justify-center gap-0.5",
          "bg-bg-elevated border-border",
          isH ? "flex-col w-5 border-x" : "flex-row h-5 border-y",
        )}
      >
        {prevCollapsed && prevLeafId && (
          <button
            onClick={() => expandPanel(prevLeafId)}
            className={restoreBtnCls}
            title="Restore panel"
            aria-label="Restore panel"
          >
            {isH ? <ChevronRight /> : <ChevronDown />}
          </button>
        )}
        {nextCollapsed && nextLeafId && (
          <button
            onClick={() => expandPanel(nextLeafId)}
            className={restoreBtnCls}
            title="Restore panel"
            aria-label="Restore panel"
          >
            {isH ? <ChevronLeft /> : <ChevronUp />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onMouseDown={onStartDrag}
      className={cn(
        "shrink-0 relative flex items-center justify-center select-none",
        "bg-transparent hover:bg-accent/20 transition-colors duration-transition-speed",
        "focus-visible:outline-none",
        isH ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
      )}
    >
      <div
        className={cn(
          "bg-border rounded-full pointer-events-none",
          isH ? "w-px h-8" : "h-px w-8",
        )}
      />
    </div>
  );
}

// ─── LeafContent ─────────────────────────────────────────────────────────────
//
// [+] button: tracks mouse position on the leaf container (no blocking overlay).
// When the cursor is within EDGE_T px of any edge (excluding the header area),
// a single [+] button is rendered at that edge. The button is positioned inside
// the content area so it doesn't overlap the resize handle.

function LeafContent({ node }: { node: LeafNode }) {
  const { windows, collapsePanel, expandPanel, closePanel, splitPanel } =
    useWindowContext();
  const isDefault = node.isDefault ?? false;
  const windowDef = windows.find((w) => w.id === node.windowId) ?? null;

  const [hoveredEdge, setHoveredEdge] = useState<
    "top" | "bottom" | "left" | "right" | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    // Don't trigger inside the header strip
    if (y < HEADER_H) { setHoveredEdge(null); return; }

    const cy = y - HEADER_H;
    const ch = h - HEADER_H;

    const candidates = [
      { edge: "top"    as const, dist: cy },
      { edge: "bottom" as const, dist: ch - cy },
      { edge: "left"   as const, dist: x },
      { edge: "right"  as const, dist: w - x },
    ];
    const best = candidates.reduce((a, b) => (a.dist < b.dist ? a : b));
    setHoveredEdge(best.dist <= EDGE_T ? best.edge : null);
  }, []);

  const onMouseLeave = useCallback(() => setHoveredEdge(null), []);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex flex-col w-full h-full"
    >
      {/* Header strip — always visible, even when collapsed */}
      <DynamicLeafHeader
        node={node}
        windowDef={windowDef}
        isDefault={isDefault}
        onClose={() => closePanel(node.id)}
        onCollapse={() => collapsePanel(node.id)}
        onExpand={() => expandPanel(node.id)}
      />

      {/* Content area — hidden when collapsed so header fills the slot */}
      {!node.collapsed && (
        <div className="flex-1 min-h-0 overflow-auto">
          {windowDef ? (
            <windowDef.component />
          ) : (
            <WindowSelector leafId={node.id} />
          )}
        </div>
      )}

      {/* Single [+] button at the detected edge — no blocking overlay */}
      {hoveredEdge && (
        <AddPanelButton
          edge={hoveredEdge}
          onSplit={(dir, pos) => splitPanel(node.id, dir, pos)}
        />
      )}
    </div>
  );
}

// ─── AddPanelButton ───────────────────────────────────────────────────────────

interface AddPanelButtonProps {
  edge: "top" | "bottom" | "left" | "right";
  onSplit: (direction: SplitDirection, position: "before" | "after") => void;
}

function AddPanelButton({ edge, onSplit }: AddPanelButtonProps) {
  const direction: SplitDirection =
    edge === "left" || edge === "right" ? "horizontal" : "vertical";
  const position: "before" | "after" =
    edge === "top" || edge === "left" ? "before" : "after";

  const posCls = {
    top:    "top-9 left-1/2 -translate-x-1/2",
    bottom: "bottom-1 left-1/2 -translate-x-1/2",
    left:   "left-1 top-1/2 -translate-y-1/2",
    right:  "right-1 top-1/2 -translate-y-1/2",
  }[edge];

  return (
    <button
      onClick={() => onSplit(direction, position)}
      className={cn(
        "absolute z-20 w-5 h-5 rounded-full border-0",
        "bg-accent text-accent-fg",
        "flex items-center justify-center",
        "hover:scale-110 active:scale-95 transition-transform duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
        posCls,
      )}
      title={`Split ${direction === "horizontal" ? "left/right" : "top/bottom"}`}
      aria-label={`Split panel ${edge}`}
    >
      <PlusIcon />
    </button>
  );
}

// ─── DynamicLeafHeader ────────────────────────────────────────────────────────

const headerBtnCls = cn(
  "flex items-center justify-center w-5 h-5 rounded-sm",
  "text-fg-muted hover:text-fg-primary hover:bg-bg-overlay",
  "transition-[color,background-color] duration-transition-speed",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
);

function DynamicLeafHeader({
  node,
  windowDef,
  isDefault,
  onClose,
  onCollapse,
  onExpand,
}: {
  node: LeafNode;
  windowDef: WindowDef | null;
  isDefault: boolean;
  onClose: () => void;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  const isCollapsed = node.collapsed ?? false;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 h-8 shrink-0",
        "bg-bg-elevated border-b border-border",
        "transition-[background-color,border-color] duration-transition-speed",
      )}
    >
      {windowDef?.icon && (
        <span className="w-4 h-4 text-fg-muted flex items-center justify-center shrink-0">
          {windowDef.icon}
        </span>
      )}
      <span className="flex-1 min-w-0 text-xs font-medium text-fg-primary truncate">
        {windowDef?.title ?? "Select Window"}
      </span>
      {!isDefault && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={isCollapsed ? onExpand : onCollapse}
            className={headerBtnCls}
            title={isCollapsed ? "Expand" : "Minimize"}
            aria-label={isCollapsed ? "Expand panel" : "Minimize panel"}
          >
            {isCollapsed ? <ExpandIcon /> : <MinimizeIcon />}
          </button>
          <button
            onClick={onClose}
            className={headerBtnCls}
            title="Close panel"
            aria-label="Close panel"
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Restore button ───────────────────────────────────────────────────────────

const restoreBtnCls = cn(
  "flex items-center justify-center w-4 h-4 rounded-sm",
  "text-fg-muted hover:text-fg-primary transition-colors cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
);

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function MinimizeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ExpandIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 3.5h6M2 6.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M3.5 2L7 5l-3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M6.5 2L3 5l3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 3.5L5 7l3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 6.5L5 3l3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
