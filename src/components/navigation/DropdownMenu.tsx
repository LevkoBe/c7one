import React from "react";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

// ─── DropdownMenu ─────────────────────────────────────────────────────────────

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;
export const DropdownMenuGroup = RadixDropdown.Group;
export const DropdownMenuSub = RadixDropdown.Sub;
export const DropdownMenuRadioGroup = RadixDropdown.RadioGroup;

const contentClasses = cn(
  "relative z-50 min-w-[8rem]",
  "max-h-[var(--radix-dropdown-menu-content-available-height)]",
  "overflow-x-hidden overflow-y-auto",
  "bg-bg-elevated [border-width:var(--border-width)] border-border",
  "rounded shadow-c7-xl p-1",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[side=bottom]:slide-in-from-top-2",
  "data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2",
  "data-[side=top]:slide-in-from-bottom-2",
);

const itemClasses = cn(
  "relative flex cursor-pointer select-none items-center gap-2",
  "rounded-[calc(var(--radius)*0.75)] px-2 py-1.5 text-sm",
  "text-fg-primary outline-none",
  "transition-colors duration-(--transition-speed)",
  "focus:bg-bg-overlay focus:text-fg-primary",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
);

// ─── Content ──────────────────────────────────────────────────────────────────

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  RadixDropdown.DropdownMenuContentProps
>(({ className, sideOffset = 4, collisionPadding = 8, ...props }, ref) => (
  <RadixDropdown.Portal>
    <RadixDropdown.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(contentClasses, className)}
      {...props}
    />
  </RadixDropdown.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

// ─── Item ─────────────────────────────────────────────────────────────────────

export interface DropdownMenuItemProps
  extends RadixDropdown.DropdownMenuItemProps {
  inset?: boolean;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, inset, ...props }, ref) => (
  <RadixDropdown.Item
    ref={ref}
    className={cn(itemClasses, inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

// ─── Label ────────────────────────────────────────────────────────────────────

export interface DropdownMenuLabelProps
  extends RadixDropdown.DropdownMenuLabelProps {
  inset?: boolean;
}

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <RadixDropdown.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-semibold text-fg-muted",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

// ─── Separator ────────────────────────────────────────────────────────────────

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  RadixDropdown.DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <RadixDropdown.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// ─── Sub Menu ─────────────────────────────────────────────────────────────────

export interface DropdownMenuSubTriggerProps
  extends RadixDropdown.DropdownMenuSubTriggerProps {
  inset?: boolean;
}

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <RadixDropdown.SubTrigger
    ref={ref}
    className={cn(
      itemClasses,
      "data-[state=open]:bg-bg-overlay",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight
      width={14}
      height={14}
      className="ml-auto text-fg-muted"
      aria-hidden
    />
  </RadixDropdown.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  RadixDropdown.DropdownMenuSubContentProps
>(({ className, collisionPadding = 8, ...props }, ref) => (
  <RadixDropdown.Portal>
    <RadixDropdown.SubContent
      ref={ref}
      collisionPadding={collisionPadding}
      className={cn(contentClasses, className)}
      {...props}
    />
  </RadixDropdown.Portal>
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
