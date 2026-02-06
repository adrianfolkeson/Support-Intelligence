import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "danger" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
          {
            "bg-gray-100 text-gray-800": variant === "default",
            "bg-green-100 text-green-800": variant === "success",
            "bg-yellow-100 text-yellow-800": variant === "warning",
            "bg-red-100 text-red-800": variant === "danger",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
