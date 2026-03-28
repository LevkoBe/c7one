import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../utils/cn'

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}

export const DrawerTrigger = Dialog.Trigger

const sideClasses: Record<DrawerSide, string> = {
  left:   'left-0 top-0 h-full w-80 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right:  'right-0 top-0 h-full w-80 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  top:    'top-0 left-0 w-full h-64 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  bottom: 'bottom-0 left-0 w-full h-64 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
}

export function DrawerContent({
  side = 'right',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: DrawerSide }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed z-50',
          'bg-[--color-bg-elevated] border-[length:--border-width] border-[--color-border]',
          'p-5 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close
          className="absolute right-4 top-4 text-[--color-fg-muted] hover:text-[--color-fg-primary] transition-colors duration-[--transition-speed] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
          aria-label="Close"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" />
          </svg>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

Drawer.Trigger = DrawerTrigger
Drawer.Content = DrawerContent
