"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-neutral-100 text-neutral-800 border border-neutral-200",
      success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      warning: "bg-amber-100 text-amber-800 border border-amber-200",
      danger: "bg-red-100 text-red-800 border border-red-200",
      info: "bg-blue-100 text-blue-800 border border-blue-200",
      neutral: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs",
      lg: "px-3 py-1.5 text-sm",
    };

    const dotColor = {
      default: "bg-neutral-600",
      success: "bg-emerald-600",
      warning: "bg-amber-600",
      danger: "bg-red-600",
      info: "bg-blue-600",
      neutral: "bg-gray-600",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              dotColor[variant]
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Pre-configured badge variants for common use cases
export function StatusBadge({ status }: { status: "online" | "offline" | "busy" | "away" }) {
  const statusConfig = {
    online: { variant: "success" as const, label: "Online" },
    offline: { variant: "neutral" as const, label: "Offline" },
    busy: { variant: "danger" as const, label: "Busy" },
    away: { variant: "warning" as const, label: "Away" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

