export { PanelRoot, PanelSplit, PanelLeaf } from "./Panels";
export type { PanelRootProps, PanelSplitProps, PanelLeafProps } from "./Panels";

// ─── Dynamic Panel System ─────────────────────────────────────────────────────
export { DynamicPanelRoot } from "./DynamicPanels";
export type { DynamicPanelRootProps } from "./DynamicPanels";
export { WindowSelector } from "./WindowSelector";
export type { WindowSelectorProps } from "./WindowSelector";
export { useWindowContext, PRIMARY_WINDOW_ID } from "./WindowContext";
export type {
  WindowDef,
  PanelTreeNode,
  GroupNode,
  LeafNode,
  SplitDirection,
  LayoutNodeDecl,
  LayoutGroupDecl,
  LayoutLeafDecl,
  WindowContextValue,
} from "./WindowContext";

// ─── App Shell ────────────────────────────────────────────────────────────────
export { AppShell } from "./AppShell";
export type { AppShellProps } from "./AppShell";
export { usePrimaryBounds } from "./PrimaryBoundsContext";
export type { PrimaryBounds } from "./PrimaryBoundsContext";
