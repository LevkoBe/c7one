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

export function ModalContent({
  className,
  children,
  title,
  description,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
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
          "w-full max-w-lg",
          "bg-bg-elevated [border-width:var(--border-width)] border-border",
          "rounded p-6 shadow-c7-card",
          "transition-all duration-(--transition-speed)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      >
        {title && (
          <Dialog.Title className="text-base font-semibold text-fg-primary mb-1">
            {title}
          </Dialog.Title>
        )}
        {description && (
          <Dialog.Description className="text-sm text-fg-muted mb-5">
            {description}
          </Dialog.Description>
        )}
        {children}
        <Dialog.Close
          className={cn(
            "absolute right-1 top-1 text-fg-muted hover:text-fg-primary",
            "rounded-sm transition-colors duration-(--transition-speed)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          )}
          aria-label="Close"
        >
          <X width={15} height={15} aria-hidden="true" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
