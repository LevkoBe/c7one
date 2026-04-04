export { PanelRoot, PanelSplit, PanelLeaf } from "./Panels";
export type { PanelRootProps, PanelSplitProps, PanelLeafProps } from "./Panels";

// ─── Dynamic Panel System ─────────────────────────────────────────────────────
export { DynamicPanelRoot } from "./DynamicPanels";
export type { DynamicPanelRootProps } from "./DynamicPanels";
export { WindowSelector } from "./WindowSelector";
export type { WindowSelectorProps } from "./WindowSelector";
export { useWindowContext } from "./WindowContext";
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
