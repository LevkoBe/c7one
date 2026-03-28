import React, { useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  PanelVisibilityProvider,
  usePanelContext,
} from "../context/PanelContext";
import { cn } from "../utils/cn";

// ─── PanelRoot ────────────────────────────────────────────────────────────────

export interface PanelRootProps {
  children: React.ReactNode;
  className?: string;
}

export function PanelRoot({ children, className }: PanelRootProps) {
  return (
    <PanelVisibilityProvider>
      <div className={cn("flex flex-col w-full h-full", className)}>
        {children}
      </div>
    </PanelVisibilityProvider>
  );
}

// ─── PanelSplit ───────────────────────────────────────────────────────────────

export interface PanelSplitProps {
  direction?: "horizontal" | "vertical";
  defaultRatio?: number;
  /** localStorage key for persisting sizes */
  storageKey?: string;
  children: [React.ReactNode, React.ReactNode];
  className?: string;
}

export function PanelSplit({
  direction = "horizontal",
  defaultRatio = 0.5,
  storageKey,
  children,
  className,
}: PanelSplitProps) {
  const defaultSizes = [defaultRatio * 100, (1 - defaultRatio) * 100];

  return (
    <PanelGroup
      autoSaveId={storageKey}
      direction={direction}
      className={cn("flex-1 min-h-0", className)}
    >
      <Panel defaultSize={defaultSizes[0]}>{children[0]}</Panel>
      <PanelResizeHandle
        className={cn(
          "relative flex items-center justify-center",
          "bg-transparent hover:bg-color-accent/20",
          "transition-colors duration-transition-speed",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-color-accent",
          direction === "horizontal"
            ? "w-1 cursor-col-resize"
            : "h-1 cursor-row-resize",
        )}
      >
        <div
          className={cn(
            "bg-color-border rounded-full",
            direction === "horizontal" ? "w-px h-8" : "h-px w-8",
          )}
        />
      </PanelResizeHandle>
      <Panel defaultSize={defaultSizes[1]}>{children[1]}</Panel>
    </PanelGroup>
  );
}

// ─── PanelLeaf ────────────────────────────────────────────────────────────────

export interface PanelLeafProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  minSize?: number;
  maxSize?: number;
}

export function PanelLeaf({
  id,
  children,
  className,
  minSize,
  maxSize,
}: PanelLeafProps) {
  const { isVisible } = usePanelContext();
  const visible = isVisible(id);

  if (!visible) return null;

  return (
    <div
      data-panel-leaf={id}
      className={cn("flex flex-col w-full h-full overflow-auto", className)}
    >
      {children}
    </div>
  );
}
