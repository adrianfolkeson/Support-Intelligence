import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export function StatsCard({ label, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
            {trend && (
              <p className="mt-1 text-sm text-neutral-500">{trend}</p>
            )}
          </div>
          {icon && (
            <div className="text-neutral-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
