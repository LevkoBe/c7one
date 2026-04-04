import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Window Registry ──────────────────────────────────────────────────────────

export interface WindowDef {
  id: string;
  title: string;
  icon?: React.ReactNode;
  component: React.ComponentType;
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
  splitPanel: (leafId: string, direction: SplitDirection, position: "before" | "after") => void;
  closePanel: (leafId: string) => void;
  collapsePanel: (leafId: string) => void;
  expandPanel: (leafId: string) => void;
  assignWindow: (leafId: string, windowId: string) => void;
  moveDivider: (groupId: string, dividerIndex: number, newPosition: number) => void;
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function makeIdGen() {
  let n = 0;
  return () => `p${++n}`;
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
): PanelTreeNode {
  if (root.type === "leaf") {
    if (root.id !== leafId) return root;
    const newLeaf: LeafNode = { type: "leaf", id: idGen(), windowId: null };
    return {
      type: "group",
      id: idGen(),
      direction,
      dividerPositions: [50],
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
      const midpoint = (leafStart + leafEnd) / 2;
      // New divider goes between the two halves of the original leaf's slot
      positions.splice(childIdx, 0, midpoint);

      return { ...root, children: newChildren, dividerPositions: positions };
    } else {
      // Wrap the leaf in a new perpendicular group
      const newGroup: GroupNode = {
        type: "group",
        id: idGen(),
        direction,
        dividerPositions: [50],
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
  children,
}: {
  windows: WindowDef[];
  layout: LayoutNodeDecl;
  children: React.ReactNode;
}) {
  const idGenRef = useRef(makeIdGen());
  const [tree, setTree] = useState<PanelTreeNode>(() =>
    initTree(layout, idGenRef.current),
  );

  const splitPanel = useCallback(
    (leafId: string, direction: SplitDirection, position: "before" | "after") =>
      setTree((prev) =>
        splitLeafInTree(prev, leafId, direction, position, idGenRef.current),
      ),
    [],
  );

  const closePanel = useCallback(
    (leafId: string) => setTree((prev) => closeLeafInTree(prev, leafId)),
    [],
  );

  const collapsePanel = useCallback(
    (leafId: string) =>
      setTree((prev) => updateLeafInTree(prev, leafId, { collapsed: true })),
    [],
  );

  const expandPanel = useCallback(
    (leafId: string) =>
      setTree((prev) => updateLeafInTree(prev, leafId, { collapsed: false })),
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
