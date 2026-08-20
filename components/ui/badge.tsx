import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Clock } from "@/lib/icons";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-600 text-white",
        secondary: "border-transparent bg-surface-2 text-text-default",
        destructive: "border-error-500/20 bg-error-50 text-error-700",
        outline: "text-text-default border-border-default",
        success: "border-secondary-500/20 bg-secondary-50 text-secondary-700",
        warning: "border-warning-500/20 bg-warning-50 text-warning-700",
        info: "border-info-500/20 bg-info-50 text-info-700",
        pending: "border-warning-500/20 bg-warning-50 text-warning-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[11px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {variant === "pending" && <Clock className="mr-1 size-3.5" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
