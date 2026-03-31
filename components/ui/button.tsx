import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-primary text-white hover:bg-primary-hover shadow-subtle": variant === "primary",
            "bg-neutral-800 text-white hover:bg-neutral-900 shadow-subtle": variant === "secondary",
            "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50":
              variant === "outline",
            "bg-transparent text-neutral-700 hover:bg-neutral-100": variant === "ghost",
            "bg-error text-white hover:bg-error/90 shadow-subtle": variant === "danger",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
