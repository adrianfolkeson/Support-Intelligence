"use client";

import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: number;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const getColor = () => {
    if (risk >= 8) return "bg-error/10 text-error border border-error/20";
    if (risk >= 5) return "bg-warning/10 text-warning border border-warning/20";
    return "bg-success/10 text-success border border-success/20";
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium",
        getColor(),
        className
      )}
    >
      {risk}/10
    </span>
  );
}
