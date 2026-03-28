import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
          "bg-bg-elevated border-[length:--border-width] border-border",
          "rounded-[--radius] p-6 shadow-xl",
          "transition-all duration-[--transition-speed]",
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
            "absolute right-4 top-4 text-fg-muted hover:text-fg-primary",
            "rounded-sm transition-colors duration-[--transition-speed]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          )}
          aria-label="Close"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
            />
          </svg>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
