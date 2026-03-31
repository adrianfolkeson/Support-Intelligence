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
  bug: "#7f1d1d",
  feature_request: "#1e3a5f",
  billing: "#b45309",
  performance: "#262626",
  documentation: "#737373",
  reliability: "#525252",
  limitation: "#404040",
  feedback: "#4d7c0f",
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
            formatter={(value: any, name: any, props: any) => [
              `${Number(value || 0)} tickets ${props.payload.trend === "up" ? "↑" : props.payload.trend === "down" ? "↓" : "→"}`,
              name || "",
            ]}
          />
          <Bar dataKey="count" name="Tickets" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.category] || "#737373"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
