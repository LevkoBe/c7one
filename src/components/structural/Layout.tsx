import React from 'react'
import { cn } from '../../utils/cn'

// ─── Header ───────────────────────────────────────────────────────────────────

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ sticky = false, className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'flex items-center justify-between px-5 h-14',
        'bg-[--color-bg-base] border-b border-b-[--color-border]',
        'transition-[background-color,border-color] duration-[--transition-speed]',
        sticky && 'sticky top-0 z-40',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  ),
)
Header.displayName = 'Header'

// ─── Footer ───────────────────────────────────────────────────────────────────

export const Footer = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'px-5 py-8 border-t border-t-[--color-border]',
        'bg-[--color-bg-base] text-[--color-fg-muted]',
        'transition-[background-color,border-color] duration-[--transition-speed]',
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  ),
)
Footer.displayName = 'Footer'

// ─── Section ─────────────────────────────────────────────────────────────────

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthClasses: Record<NonNullable<SectionProps['maxWidth']>, string> = {
  sm:   'max-w-xl',
  md:   'max-w-3xl',
  lg:   'max-w-5xl',
  xl:   'max-w-6xl',
  '2xl':'max-w-7xl',
  full: 'max-w-none',
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ maxWidth = 'lg', className, children, ...props }, ref) => (
    <section ref={ref} className={cn('py-12 px-5', className)} {...props}>
      <div className={cn('mx-auto w-full', maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </section>
  ),
)
Section.displayName = 'Section'
