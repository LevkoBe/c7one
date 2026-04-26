import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Window Registry ──────────────────────────────────────────────────────────

/**
 * Reserved window ID for the primary (canvas) slot in AppShell layouts.
 * Place a leaf with this ID in your layout declaration to reserve space for the
 * primary window. AppShell substitutes it with a transparent placeholder so the
 * canvas content (rendered behind the panel layer) shows through.
 */
export const PRIMARY_WINDOW_ID = "__primary__";

export interface WindowDef {
  id: string;
  title: string;
  icon?: React.ReactNode;
  component: React.ComponentType;
  /**
   * When true the 32 px panel header strip is suppressed entirely.
   * Used internally for the PRIMARY_WINDOW_ID slot; also available for any
   * window that should fill its panel edge-to-edge (e.g. an image viewer).
   */
  headless?: boolean;
}

// ─── Panel Tree (N-ary group model) ──────────────────────────────────────────
//
// A GroupNode contains N children (leaves or nested groups) and N-1 dividers.
// dividerPositions[i] is the percentage position of the i-th divider within
// this group's container (0–100). children[i] occupies the space from
// dividerPositions[i-1] (or 0) to dividerPositions[i] (or 100).
//
// Moving divider[i] only adjusts children[i] and children[i+1]. All other
// children are completely unaffected — this is the key correctness invariant.

export type SplitDirection = "horizontal" | "vertical";

export interface GroupNode {
  type: "group";
  id: string;
  direction: SplitDirection;
  /** Length = children.length - 1. Each value is a percentage in (0, 100). */
  dividerPositions: number[];
  children: PanelTreeNode[];
}

export interface LeafNode {
  type: "leaf";
  id: string;
  windowId: string | null;
  isDefault?: boolean;
  collapsed?: boolean;
}

export type PanelTreeNode = GroupNode | LeafNode;

// ─── Layout Declarations (developer-facing, no IDs required) ─────────────────

export interface LayoutLeafDecl {
  type: "leaf";
  windowId: string | null;
  isDefault?: boolean;
  collapsed?: boolean;
}

export interface LayoutGroupDecl {
  type: "group";
  direction: SplitDirection;
  children: LayoutNodeDecl[];
  /**
   * Optional initial sizes as percentages. Must have same length as children.
   * Defaults to equal split. E.g. [78, 22] for a 78/22 split.
   */
  sizes?: number[];
}

export type LayoutNodeDecl = LayoutGroupDecl | LayoutLeafDecl;

// ─── Context Value ────────────────────────────────────────────────────────────

export interface WindowContextValue {
  windows: WindowDef[];
  tree: PanelTreeNode;
  splitPanel: (leafId: string, direction: SplitDirection, position: "before" | "after", newPanelSizePct?: number) => void;
  closePanel: (leafId: string) => void;
  collapsePanel: (leafId: string) => void;
  expandPanel: (leafId: string) => void;
  assignWindow: (leafId: string, windowId: string) => void;
  moveDivider: (groupId: string, dividerIndex: number, newPosition: number) => void;
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function makeIdGen(start = 0) {
  let n = start;
  return () => `p${++n}`;
}

function maxIdInTree(node: PanelTreeNode): number {
  const n = parseInt(node.id.replace(/^p/, ""), 10);
  const self = isNaN(n) ? 0 : n;
  if (node.type === "leaf") return self;
  return Math.max(self, ...node.children.map(maxIdInTree));
}

export function initTree(decl: LayoutNodeDecl, idGen: () => string): PanelTreeNode {
  if (decl.type === "leaf") {
    return { ...decl, id: idGen() };
  }
  const children = decl.children.map((c) => initTree(c, idGen));
  const n = children.length;
  let positions: number[];
  if (decl.sizes && decl.sizes.length === n) {
    let acc = 0;
    positions = [];
    for (let i = 0; i < n - 1; i++) {
      acc += decl.sizes[i];
      positions.push(Math.min(Math.max(acc, 0), 100));
    }
  } else {
    positions = Array.from({ length: n - 1 }, (_, i) => ((i + 1) * 100) / n);
  }
  return {
    type: "group",
    id: idGen(),
    direction: decl.direction,
    dividerPositions: positions,
    children,
  };
}

// ─── Size helpers ─────────────────────────────────────────────────────────────

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

// ─── Collapse / expand with reordering ───────────────────────────────────────
//
// Invariant maintained by both functions:
//   • Non-collapsed children come first (stable relative order preserved).
//   • Collapsed children are always last (stable relative order preserved).
//   • dividerPositions[0..n_nc-2] cover only non-collapsed panels (normalized 0–100).
//   • dividerPositions[n_nc-1..] are set to 100 (unused fixed-size slots).
//
// This invariant lets the drag handler use effectiveSize = containerSize − n_collapsed×32px
// without needing to account for where the collapsed panels sit in the layout.

// Returns null when leafId is not a direct child (caller should recurse).
// Returns root unchanged when the leaf is already in the target state (idempotent).
// Returns a new GroupNode when the collapse state and child order actually changed.
function reorderCollapseInGroup(
  root: GroupNode,
  leafId: string,
  newCollapsed: boolean,
): GroupNode | null {
  const childIdx = root.children.findIndex(
    (c) => c.id === leafId && c.type === "leaf",
  );
  if (childIdx === -1) return null; // not a direct child — caller recurses
  const leaf = root.children[childIdx] as LeafNode;
  if ((leaf.collapsed ?? false) === newCollapsed) return root; // idempotent

  const oldSizes = computeSizes(root.dividerPositions, root.children.length);

  // Update collapsed state on the target leaf
  const updatedChildren = root.children.map((c, i) =>
    i === childIdx ? { ...(c as LeafNode), collapsed: newCollapsed } : c,
  );

  // Partition: groups are always non-collapsed; only leaves can be collapsed
  const nonCollapsed = updatedChildren.filter(
    (c) => c.type !== "leaf" || !(c as LeafNode).collapsed,
  );
  const collapsed = updatedChildren.filter(
    (c) => c.type === "leaf" && (c as LeafNode).collapsed,
  );
  const reordered = [...nonCollapsed, ...collapsed];

  // Rebuild divider positions for non-collapsed panels.
  // COLLAPSE: normalize the remaining non-collapsed sizes (the removed panel's
  //   proportional space is distributed among survivors automatically).
  // EXPAND: the expanding panel's stored size was a meaningless boundary marker (0),
  //   so give it an equal share of the total non-collapsed space instead of 0.
  let ncSizes: number[];
  if (newCollapsed) {
    ncSizes = nonCollapsed.map((c) => {
      const oldIdx = root.children.findIndex((x) => x.id === c.id);
      return oldSizes[oldIdx];
    });
  } else {
    const existingSizes = nonCollapsed
      .filter((c) => c.id !== leafId)
      .map((c) => {
        const oldIdx = root.children.findIndex((x) => x.id === c.id);
        return oldSizes[oldIdx];
      });
    const totalExisting = existingSizes.reduce((a, b) => a + b, 0);
    const fairShare = nonCollapsed.length > 1 ? totalExisting / (nonCollapsed.length - 1) : 1;
    ncSizes = nonCollapsed.map((c) => {
      if (c.id === leafId) return fairShare;
      const oldIdx = root.children.findIndex((x) => x.id === c.id);
      return oldSizes[oldIdx];
    });
  }
  const totalNc = ncSizes.reduce((a, b) => a + b, 0) || 1;

  const newPositions: number[] = [];
  let acc = 0;
  for (let i = 0; i < nonCollapsed.length - 1; i++) {
    acc += (ncSizes[i] / totalNc) * 100;
    newPositions.push(acc);
  }
  for (let i = 0; i < collapsed.length; i++) {
    newPositions.push(100);
  }

  return { ...root, children: reordered, dividerPositions: newPositions };
}

export function collapseLeafInTree(
  root: PanelTreeNode,
  leafId: string,
): PanelTreeNode {
  if (root.type === "leaf") {
    if (root.id !== leafId) return root;
    return (root.collapsed ?? false) ? root : { ...root, collapsed: true };
  }
  const updated = reorderCollapseInGroup(root, leafId, true);
  if (updated !== null) return updated; // found (changed or idempotent) — no recursion
  const newChildren = root.children.map((c) => collapseLeafInTree(c, leafId));
  if (newChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: newChildren };
}

export function expandLeafInTree(
  root: PanelTreeNode,
  leafId: string,
): PanelTreeNode {
  if (root.type === "leaf") {
    if (root.id !== leafId) return root;
    return (root.collapsed ?? false) ? { ...root, collapsed: false } : root;
  }
  const updated = reorderCollapseInGroup(root, leafId, false);
  if (updated !== null) return updated; // found (changed or idempotent) — no recursion
  const newChildren = root.children.map((c) => expandLeafInTree(c, leafId));
  if (newChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: newChildren };
}

// ─── Exported for testing ─────────────────────────────────────────────────────
// splitLeafInTree
// ─ If the leaf's parent group shares the split direction → add as sibling.
// ─ If different direction → wrap the leaf in a new perpendicular group.
// ─ If the leaf IS the root → wrap it in a new group.
export function splitLeafInTree(
  root: PanelTreeNode,
  leafId: string,
  direction: SplitDirection,
  position: "before" | "after",
  idGen: () => string,
  /**
   * Percentage of the leaf's current slot that the new (empty) panel should
   * occupy. Clamped to [5, 95]. Defaults to 50 (equal split).
   */
  newPanelSizePct?: number,
): PanelTreeNode {
  const p = newPanelSizePct !== undefined ? Math.min(Math.max(newPanelSizePct, 5), 95) : 50;

  if (root.type === "leaf") {
    if (root.id !== leafId) return root;
    const newLeaf: LeafNode = { type: "leaf", id: idGen(), windowId: null };
    // position "before": [newLeaf, root] — newLeaf takes p%, root takes (100-p)%
    // position "after":  [root, newLeaf] — root takes (100-p)%, newLeaf takes p%
    const divPos = position === "before" ? p : 100 - p;
    return {
      type: "group",
      id: idGen(),
      direction,
      dividerPositions: [divPos],
      children: position === "before" ? [newLeaf, root] : [root, newLeaf],
    };
  }

  const childIdx = root.children.findIndex(
    (c) => c.type === "leaf" && c.id === leafId,
  );
  if (childIdx !== -1) {
    const leaf = root.children[childIdx] as LeafNode;
    const newLeaf: LeafNode = { type: "leaf", id: idGen(), windowId: null };

    if (root.direction === direction) {
      // Add sibling directly in this group
      const insertAt = position === "before" ? childIdx : childIdx + 1;
      const newChildren = [...root.children];
      newChildren.splice(insertAt, 0, newLeaf);

      const positions = [...root.dividerPositions];
      const leafStart = childIdx > 0 ? positions[childIdx - 1] : 0;
      const leafEnd = childIdx < positions.length ? positions[childIdx] : 100;
      const leafSize = leafEnd - leafStart;
      // New panel takes p% of the leaf's slot; the existing leaf keeps the rest.
      // "before": newLeaf occupies [leafStart, splitPoint], leaf [splitPoint, leafEnd]
      // "after":  leaf occupies [leafStart, splitPoint], newLeaf [splitPoint, leafEnd]
      const splitPoint =
        position === "before"
          ? leafStart + leafSize * (p / 100)
          : leafEnd - leafSize * (p / 100);
      positions.splice(childIdx, 0, splitPoint);

      return { ...root, children: newChildren, dividerPositions: positions };
    } else {
      // Wrap the leaf in a new perpendicular group.
      // position "before": [newLeaf, leaf] — newLeaf takes p%, leaf takes (100-p)%
      // position "after":  [leaf, newLeaf] — leaf takes (100-p)%, newLeaf takes p%
      const divPos = position === "before" ? p : 100 - p;
      const newGroup: GroupNode = {
        type: "group",
        id: idGen(),
        direction,
        dividerPositions: [divPos],
        children: position === "before" ? [newLeaf, leaf] : [leaf, newLeaf],
      };
      const newChildren = [...root.children];
      newChildren[childIdx] = newGroup;
      return { ...root, children: newChildren };
    }
  }

  const newChildren = root.children.map((c) =>
    splitLeafInTree(c, leafId, direction, position, idGen),
  );
  if (newChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: newChildren };
}

// closeLeafInTree
// Removes the leaf from its parent group. If the group only had 2 children,
// the group itself is replaced by the surviving sibling. Dividers are adjusted
// so the adjacent panel absorbs the freed space.
export function closeLeafInTree(
  root: PanelTreeNode,
  leafId: string,
): PanelTreeNode {
  if (root.type === "leaf") return root;

  const childIdx = root.children.findIndex(
    (c) => c.type === "leaf" && c.id === leafId,
  );
  if (childIdx !== -1) {
    if (root.children.length === 2) {
      return root.children[childIdx === 0 ? 1 : 0];
    }
    const newChildren = root.children.filter((_, i) => i !== childIdx);
    const newDividers = [...root.dividerPositions];
    // Remove the divider "after" the removed child when possible,
    // otherwise the one "before" it (last child case).
    const dividerIdx = childIdx < newDividers.length ? childIdx : childIdx - 1;
    newDividers.splice(dividerIdx, 1);
    return { ...root, children: newChildren, dividerPositions: newDividers };
  }

  const newChildren = root.children.map((c) => closeLeafInTree(c, leafId));
  if (newChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: newChildren };
}

export function updateLeafInTree(
  root: PanelTreeNode,
  leafId: string,
  patch: Partial<LeafNode>,
): PanelTreeNode {
  if (root.type === "leaf") {
    return root.id === leafId ? { ...root, ...patch } : root;
  }
  const newChildren = root.children.map((c) =>
    updateLeafInTree(c, leafId, patch),
  );
  if (newChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: newChildren };
}

// moveDividerInTree
// Moves exactly one divider in the named group. No other groups or dividers
// are affected. This gives the "only adjacent panels resize" behavior.
export function moveDividerInTree(
  root: PanelTreeNode,
  groupId: string,
  idx: number,
  newPos: number,
): PanelTreeNode {
  if (root.type === "leaf") return root;
  if (root.id === groupId) {
    const n = root.children.length;
    const positions = [...root.dividerPositions];
    const minSize = 3; // minimum 3% per panel
    const lo = idx > 0 ? positions[idx - 1] + minSize : minSize;
    const hi = idx < n - 2 ? positions[idx + 1] - minSize : 100 - minSize;
    positions[idx] = Math.max(lo, Math.min(hi, newPos));
    return { ...root, dividerPositions: positions };
  }
  const newChildren = root.children.map((c) =>
    moveDividerInTree(c, groupId, idx, newPos),
  );
  if (newChildren.every((c, i) => c === root.children[i])) return root;
  return { ...root, children: newChildren };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WindowContext = createContext<WindowContextValue | null>(null);

export function WindowProvider({
  windows,
  layout,
  storageKey,
  children,
}: {
  windows: WindowDef[];
  layout: LayoutNodeDecl;
  storageKey?: string;
  children: React.ReactNode;
}) {
  const idGenRef = useRef(makeIdGen());
  const [tree, setTree] = useState<PanelTreeNode>(() => {
    if (storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const restored = JSON.parse(raw) as PanelTreeNode;
          idGenRef.current = makeIdGen(maxIdInTree(restored));
          return restored;
        }
      } catch {
        // Fall through to default
      }
    }
    return initTree(layout, idGenRef.current);
  });

  const splitPanel = useCallback(
    (leafId: string, direction: SplitDirection, position: "before" | "after", newPanelSizePct?: number) =>
      setTree((prev) =>
        splitLeafInTree(prev, leafId, direction, position, idGenRef.current, newPanelSizePct),
      ),
    [],
  );

  const closePanel = useCallback(
    (leafId: string) => setTree((prev) => closeLeafInTree(prev, leafId)),
    [],
  );

  const collapsePanel = useCallback(
    (leafId: string) =>
      setTree((prev) => collapseLeafInTree(prev, leafId)),
    [],
  );

  const expandPanel = useCallback(
    (leafId: string) =>
      setTree((prev) => expandLeafInTree(prev, leafId)),
    [],
  );

  const assignWindow = useCallback(
    (leafId: string, windowId: string) =>
      setTree((prev) => updateLeafInTree(prev, leafId, { windowId })),
    [],
  );

  const moveDivider = useCallback(
    (groupId: string, dividerIndex: number, newPosition: number) =>
      setTree((prev) =>
        moveDividerInTree(prev, groupId, dividerIndex, newPosition),
      ),
    [],
  );

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tree));
    } catch {
      // Ignore write errors
    }
  }, [storageKey, tree]);

  const value = useMemo(
    () => ({
      windows,
      tree,
      splitPanel,
      closePanel,
      collapsePanel,
      expandPanel,
      assignWindow,
      moveDivider,
    }),
    [
      windows,
      tree,
      splitPanel,
      closePanel,
      collapsePanel,
      expandPanel,
      assignWindow,
      moveDivider,
    ],
  );

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
}

export function useWindowContext() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindowContext must be used inside <DynamicPanelRoot>");
  return ctx;
}
