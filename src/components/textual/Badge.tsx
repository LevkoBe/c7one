import React from 'react'
import { cn } from '../../utils/cn'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'accent'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-[--color-bg-overlay] text-[--color-fg-muted] border-[--color-border]',
  success: 'bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30',
  warning: 'bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30',
  error:   'bg-[--color-error]/15   text-[--color-error]   border-[--color-error]/30',
  accent:  'bg-[--color-accent]/15  text-[--color-accent]  border-[--color-accent]/30',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5',
        'text-xs font-medium rounded-[calc(var(--radius)*0.75)]',
        'border-[length:--border-width]',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
)

Badge.displayName = 'Badge'
