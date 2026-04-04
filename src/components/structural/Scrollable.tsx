import React from "react";
import { cn } from "../../utils/cn";

export type ScrollAxis = "x" | "y" | "both";
export type ScrollBehavior = "auto" | "always" | "hidden";

export interface ScrollableProps extends React.HTMLAttributes<HTMLDivElement> {
  axis?: ScrollAxis;
  overflow?: ScrollBehavior;
}

const axisClasses: Record<ScrollAxis, Record<ScrollBehavior, string>> = {
  x: {
    auto: "overflow-x-auto overflow-y-hidden",
    always: "overflow-x-scroll overflow-y-hidden",
    hidden: "overflow-x-hidden overflow-y-hidden",
  },
  y: {
    auto: "overflow-y-auto overflow-x-hidden",
    always: "overflow-y-scroll overflow-x-hidden",
    hidden: "overflow-y-hidden overflow-x-hidden",
  },
  both: {
    auto: "overflow-auto",
    always: "overflow-scroll",
    hidden: "overflow-hidden",
  },
};

export const Scrollable = React.forwardRef<HTMLDivElement, ScrollableProps>(
  ({ axis = "y", overflow = "auto", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("min-h-0 min-w-0", axisClasses[axis][overflow], className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Scrollable.displayName = "Scrollable";
