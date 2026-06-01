/**
 * @fileoverview Skeleton UI component.
 * Generated as part of the shadcn/ui design system.
 */

import { cn } from "../utils";

/**
 * Skeleton component.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
