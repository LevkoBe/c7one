// No react-resizable-panels — layout is plain CSS flex with custom drag handles.
// Sizing model: each GroupNode stores dividerPositions (N-1 percentages for N
// children). Moving divider[i] only affects children[i] and children[i+1].
// All other panels are completely unaffected — correct VSCode-style behavior.

import React, { useCallback, useEffect, useRef, useState } from "react";
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

const HEADER_H    = 32;  // px — matches h-8
const EDGE_T      = 28;  // px — proximity threshold for showing [+]
const COMPACT_W   = 120; // px — header narrower than this shows only the expand button

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

  // Track which child IDs have already been rendered so we can detect newly
  // added panels (from a split) and animate them in from zero.
  const isFirstRender = useRef(true);
  const seenIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    isFirstRender.current = false;
    node.children.forEach((c) => seenIds.current.add(c.id));
  });
  const isNewChild = (id: string) =>
    !isFirstRender.current && !seenIds.current.has(id);

  // Collapsed panels are always at the end (invariant maintained by collapse/expand ops).
  // They take a fixed HEADER_H px each, so we subtract that from containerSize before
  // computing drag percentages — otherwise moving 1px would shift the divider by more
  // than 1px of visual space (or less, depending on how many panels are collapsed).
  const startDrag = useCallback(
    (dividerIndex: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const containerSize = isH ? rect.width : rect.height;
      const containerStart = isH ? rect.left : rect.top;

      const nCollapsed = node.children.filter(
        (c) => c.type === "leaf" && (c as LeafNode).collapsed,
      ).length;
      const effectiveSize = containerSize - nCollapsed * HEADER_H;
      if (effectiveSize <= 0) return;

      const onMove = (ev: MouseEvent) => {
        const raw = isH ? ev.clientX : ev.clientY;
        const pct = ((raw - containerStart) / effectiveSize) * 100;
        moveDivider(node.id, dividerIndex, pct);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [isH, moveDivider, node.id, node.children],
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
        const isCollapsed = child.type === "leaf" && ((child as LeafNode).collapsed ?? false);
        const prevChild = node.children[i - 1];
        const prevIsCollapsed =
          prevChild?.type === "leaf" && ((prevChild as LeafNode).collapsed ?? false);
        const targetFlex = isCollapsed ? `0 0 ${HEADER_H}px` : `${sizes[i]} 1 0%`;
        return (
          <React.Fragment key={child.id}>
            {/* No handle adjacent to collapsed panels — they're fixed-size header strips */}
            {i > 0 && !prevIsCollapsed && !isCollapsed && (
              <ResizeHandle
                direction={node.direction}
                onStartDrag={startDrag(i - 1)}
              />
            )}
            <PanelSlot
              isNew={isNewChild(child.id)}
              targetFlex={targetFlex}
              innerDirection={isH ? "flex-col" : "flex-row"}
            >
              <TreeNode node={child} />
            </PanelSlot>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── PanelSlot ────────────────────────────────────────────────────────────────
//
// Wraps a single flex child in a DynamicGroup. Applies CSS transitions on
// flex-grow/flex-basis so collapse, expand, and resize all animate smoothly.
//
// For newly split-in panels (isNew=true) the slot starts at flex 0 0 0px and
// transitions to the real target on the next paint via a double-RAF, matching
// the shrink animation of the sibling panels.

function PanelSlot({
  isNew,
  targetFlex,
  innerDirection,
  children,
}: {
  isNew: boolean;
  targetFlex: string;
  innerDirection: "flex-col" | "flex-row";
  children: React.ReactNode;
}) {
  const [flex, setFlex] = useState(isNew ? "0 0 0px" : targetFlex);

  // Keep flex in sync with external target (collapse/expand changes targetFlex
  // on subsequent renders while the slot is already mounted).
  const prevTarget = useRef(targetFlex);
  if (!isNew && prevTarget.current !== targetFlex) {
    prevTarget.current = targetFlex;
    setFlex(targetFlex);
  }

  useEffect(() => {
    if (!isNew) return;
    // Double-RAF: first frame commits the initial 0px style, second frame
    // triggers the transition to the real size.
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        prevTarget.current = targetFlex;
        setFlex(targetFlex);
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn("min-w-0 min-h-0 overflow-hidden flex", innerDirection)}
      style={{
        flex,
        transition: "flex-grow var(--transition-speed) ease, flex-basis var(--transition-speed) ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── ResizeHandle ─────────────────────────────────────────────────────────────

function ResizeHandle({
  direction,
  onStartDrag,
}: {
  direction: SplitDirection;
  onStartDrag: (e: React.MouseEvent) => void;
}) {
  const isH = direction === "horizontal";
  return (
    <div
      onMouseDown={onStartDrag}
      className={cn(
        "shrink-0 relative flex items-center justify-center select-none",
        "bg-transparent hover:bg-accent/20 transition-colors duration-(--transition-speed)",
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

      {/* Content area — not rendered when collapsed */}
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
        "absolute z-20 w-5 h-5 rounded-full [border-width:var(--border-width)] border-transparent",
        "bg-accent text-bg-base",
        "flex items-center justify-center",
        "hover:scale-110 active:scale-95 transition-transform duration-(--transition-speed)",
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
  "transition-[color,background-color] duration-(--transition-speed)",
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
  const headerRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width < COMPACT_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={headerRef}
      className={cn(
        "flex items-center gap-2 px-3 h-8 shrink-0",
        "bg-bg-elevated border-b border-border",
        "transition-[background-color,border-color] duration-(--transition-speed)",
        compact && "justify-center px-1",
      )}
    >
      {!compact && windowDef?.icon && (
        <span className="w-4 h-4 text-fg-muted flex items-center justify-center shrink-0">
          {windowDef.icon}
        </span>
      )}
      {!compact && (
        <span className="flex-1 min-w-0 text-xs font-medium text-fg-primary truncate">
          {windowDef?.title ?? "Select Window"}
        </span>
      )}
      {!isDefault && (
        <div className="flex items-center gap-0.5">
          {compact ? (
            /* Narrow slot: only show expand (if collapsed) or minimize */
            <button
              onClick={isCollapsed ? onExpand : onCollapse}
              className={headerBtnCls}
              title={isCollapsed ? "Expand" : "Minimize"}
              aria-label={isCollapsed ? "Expand panel" : "Minimize panel"}
            >
              {isCollapsed ? <ExpandIcon /> : <MinimizeIcon />}
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

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
