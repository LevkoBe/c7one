import React from 'react'
import { cn } from '../../utils/cn'

// ─── Headings ─────────────────────────────────────────────────────────────────

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>

const headingBase = 'text-[--color-fg-primary] font-semibold leading-tight tracking-tight'

export const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn(headingBase, 'text-4xl', className)} {...props} />
  ),
)
H1.displayName = 'H1'

export const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn(headingBase, 'text-3xl', className)} {...props} />
  ),
)
H2.displayName = 'H2'

export const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(headingBase, 'text-2xl', className)} {...props} />
  ),
)
H3.displayName = 'H3'

export const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h4 ref={ref} className={cn(headingBase, 'text-xl', className)} {...props} />
  ),
)
H4.displayName = 'H4'

export const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn(headingBase, 'text-lg', className)} {...props} />
  ),
)
H5.displayName = 'H5'

export const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h6 ref={ref} className={cn(headingBase, 'text-base', className)} {...props} />
  ),
)
H6.displayName = 'H6'

// ─── Body ─────────────────────────────────────────────────────────────────────

export type BodySize = 'sm' | 'md' | 'lg'

export interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: BodySize
  muted?: boolean
}

const bodySizeClasses: Record<BodySize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ size = 'md', muted = false, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'leading-relaxed',
        bodySizeClasses[size],
        muted ? 'text-[--color-fg-muted]' : 'text-[--color-fg-primary]',
        className,
      )}
      {...props}
    />
  ),
)
Body.displayName = 'Body'

// ─── Code ─────────────────────────────────────────────────────────────────────

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  block?: boolean
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ block = false, className, children, ...props }, ref) => {
    if (block) {
      return (
        <pre
          className={cn(
            'bg-[--color-bg-overlay] border-[length:--border-width] border-[--color-border]',
            'rounded-[--radius] p-4 overflow-x-auto',
            className,
          )}
        >
          <code
            ref={ref as React.Ref<HTMLElement>}
            className={cn('text-xs font-mono text-[--color-fg-primary]', className)}
            {...props}
          >
            {children}
          </code>
        </pre>
      )
    }
    return (
      <code
        ref={ref}
        className={cn(
          'px-1.5 py-0.5 text-xs font-mono',
          'bg-[--color-bg-overlay] text-[--color-accent]',
          'rounded-[calc(var(--radius)*0.5)]',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
)
Code.displayName = 'Code'

// ─── Label ────────────────────────────────────────────────────────────────────

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-[--color-fg-primary] select-none', className)}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

// ─── Kbd ──────────────────────────────────────────────────────────────────────

export const Kbd = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex items-center px-1.5 py-0.5',
        'text-xs font-mono font-medium',
        'bg-[--color-bg-overlay] text-[--color-fg-muted]',
        'border-[length:--border-width] border-[--color-border] border-b-2',
        'rounded-[calc(var(--radius)*0.5)]',
        className,
      )}
      {...props}
    />
  ),
)
Kbd.displayName = 'Kbd'
