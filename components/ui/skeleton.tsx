import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-sm",
    rounded: "rounded-lg",
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={cn(
        "shimmer bg-neutral-200",
        variantStyles[variant],
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
      {...props}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
}

/* Pre-built skeleton patterns for common UI elements */

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width={120} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton variant="text" width={80} height={32} className="mb-2" />
      <Skeleton variant="text" width={100} />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center space-x-4 py-3 border-b border-neutral-200">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={20} className="flex-1" />
      ))}
    </div>
  );
}

export function TicketListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TableRowSkeleton key={i} columns={5} />
      ))}
    </div>
  );
}

export function FormInputSkeleton({ label = true }: { label?: boolean }) {
  return (
    <div className="space-y-2">
      {label && <Skeleton variant="text" width={120} />}
      <Skeleton variant="rounded" height={42} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
      <Skeleton variant="rectangular" height={24} width="60%" />
      <Skeleton count={3} variant="text" />
      <div className="flex space-x-2 pt-4">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      {/* Chart area */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <Skeleton variant="rectangular" height={300} />
      </div>
      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <Skeleton variant="rectangular" height={24} width={200} className="mb-4" />
        <TicketListSkeleton count={5} />
      </div>
    </div>
  );
}
