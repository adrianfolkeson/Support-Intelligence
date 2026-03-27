"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CategoryData {
  category: string;
  count: number;
  trend: "up" | "down" | "stable";
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  bug: "#ef4444",
  feature_request: "#3b82f6",
  billing: "#f59e0b",
  performance: "#8b5cf6",
  documentation: "#6b7280",
  reliability: "#ec4899",
  limitation: "#14b8a6",
  feedback: "#10b981",
};

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} tickets ${props.payload.trend === "up" ? "↑" : props.payload.trend === "down" ? "↓" : "→"}`,
              name,
            ]}
          />
          <Bar dataKey="count" name="Tickets" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.category] || "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
