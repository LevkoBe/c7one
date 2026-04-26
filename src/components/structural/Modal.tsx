import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

export const ModalTrigger = Dialog.Trigger;

const closeBtnCls = cn(
  "flex items-center justify-center w-5 h-5 rounded-sm",
  "text-fg-muted hover:text-fg-primary hover:bg-bg-overlay",
  "transition-[color,background-color] duration-(--transition-speed)",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
);

export function ModalContent({
  className,
  children,
  title,
  description,
  icon,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        )}
      />
      <Dialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full flex flex-col",
          "bg-bg-elevated [border-width:var(--border-width)] border-border",
          "rounded shadow-c7-card overflow-hidden",
          "transition-all duration-(--transition-speed)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
          className,
        )}
        {...props}
      >
        {/* Header — same visual language as DynamicLeafHeader */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 h-8 shrink-0",
            "bg-bg-elevated border-b border-border",
            "transition-[background-color,border-color] duration-(--transition-speed)",
          )}
        >
          {icon && (
            <span className="w-4 h-4 text-fg-muted flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          {title ? (
            <Dialog.Title className="flex-1 min-w-0 text-xs font-medium text-fg-primary truncate">
              {title}
            </Dialog.Title>
          ) : (
            <span className="flex-1" />
          )}
          <Dialog.Close className={closeBtnCls} aria-label="Close">
            <X width={10} height={10} aria-hidden="true" />
          </Dialog.Close>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {description && (
            <Dialog.Description className="text-sm text-fg-muted mb-5">
              {description}
            </Dialog.Description>
          )}
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
