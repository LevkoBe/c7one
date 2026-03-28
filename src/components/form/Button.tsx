import React from 'react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[--color-accent] text-[--color-bg-base] hover:bg-[--color-accent-hover] border-transparent',
  secondary:
    'bg-[--color-bg-elevated] text-[--color-fg-primary] hover:bg-[--color-bg-overlay] border-[--color-border]',
  ghost:
    'bg-transparent text-[--color-fg-primary] hover:bg-[--color-bg-elevated] border-transparent',
  destructive:
    'bg-[--color-error] text-white hover:opacity-90 border-transparent',
  outline:
    'bg-transparent text-[--color-accent] hover:bg-[--color-bg-elevated] border-[--color-accent]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'rounded-[--radius] border-[length:--border-width]',
          'transition-all duration-[--transition-speed]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-bg-base]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
