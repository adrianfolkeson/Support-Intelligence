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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="mt-1 text-sm text-gray-500">{trend}</p>
            )}
          </div>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
