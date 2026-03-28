import React from "react";
import * as RadixToast from "@radix-ui/react-toast";
import * as RadixProgress from "@radix-ui/react-progress";
import { cn } from "../../utils/cn";

// ─── Alert ────────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const alertVariants: Record<AlertVariant, string> = {
  info: "bg-accent/10    border-accent/30    text-accent",
  success: "bg-success/10  border-success/30  text-success",
  warning: "bg-warning/10  border-warning/30  text-warning",
  error: "bg-error/10    border-error/30    text-error",
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", title, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "rounded-[--radius] border-[length:--border-width] p-4",
        alertVariants[variant],
        className,
      )}
      {...props}
    >
      {title && <p className="text-sm font-semibold mb-1">{title}</p>}
      <p className="text-sm opacity-90">{children}</p>
    </div>
  ),
);
Alert.displayName = "Alert";

// ─── Spinner ──────────────────────────────────────────────────────────────────

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "block rounded-full border-border border-t-accent animate-spin",
        spinnerSizes[size],
        className,
      )}
    />
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressProps extends RadixProgress.ProgressProps {
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, className, ...props }, ref) => (
    <RadixProgress.Root
      ref={ref}
      value={value}
      max={max}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-bg-overlay",
        className,
      )}
      {...props}
    >
      <RadixProgress.Indicator
        className="h-full bg-accent transition-all duration-[--transition-speed] ease-in-out"
        style={{ width: `${((value ?? 0) / (max ?? 100)) * 100}%` }}
      />
    </RadixProgress.Root>
  ),
);
Progress.displayName = "Progress";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ rounded = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse bg-bg-overlay",
        rounded ? "rounded-full" : "rounded-[--radius]",
        className,
      )}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

// ─── Toast Provider + Toast ───────────────────────────────────────────────────

export const ToastProvider = RadixToast.Provider;
export const ToastViewport = React.forwardRef<
  HTMLOListElement,
  RadixToast.ToastViewportProps
>(({ className, ...props }, ref) => (
  <RadixToast.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-100 flex flex-col gap-2 w-80 m-0 list-none outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

export type ToastVariant = "default" | "success" | "warning" | "error";

export interface ToastProps extends RadixToast.ToastProps {
  variant?: ToastVariant;
  title?: string;
  description?: string;
}

const toastVariants: Record<ToastVariant, string> = {
  default: "border-border",
  success: "border-success/40",
  warning: "border-warning/40",
  error: "border-error/40",
};

export const Toast = React.forwardRef<HTMLLIElement, ToastProps>(
  ({ variant = "default", title, description, className, ...props }, ref) => (
    <RadixToast.Root
      ref={ref}
      className={cn(
        "flex flex-col gap-1 rounded-[--radius] p-4",
        "bg-bg-elevated border-[length:--border-width]",
        "shadow-xl",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
        "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
        toastVariants[variant],
        className,
      )}
      {...props}
    >
      {title && (
        <RadixToast.Title className="text-sm font-semibold text-fg-primary">
          {title}
        </RadixToast.Title>
      )}
      {description && (
        <RadixToast.Description className="text-xs text-fg-muted">
          {description}
        </RadixToast.Description>
      )}
    </RadixToast.Root>
  ),
);
Toast.displayName = "Toast";

export const ToastClose = RadixToast.Close;
