import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: number;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const getColor = () => {
    if (risk >= 8) return "bg-red-100 text-red-800";
    if (risk >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
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
