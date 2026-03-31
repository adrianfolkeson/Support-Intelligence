"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChurnTrendData {
  date: string;
  avgRiskScore: number;
  highRiskCount: number;
}

interface ChurnTrendChartProps {
  data: ChurnTrendData[];
}

export function ChurnTrendChart({ data }: ChurnTrendChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            yAxisId="left"
            label={{ value: "Avg Risk Score", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            domain={[0, 10]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "High Risk Count", angle: 90, position: "insideRight" }}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgRiskScore"
            stroke="#262626"
            strokeWidth={2}
            name="Avg Risk Score"
            dot={{ fill: "#262626", r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="highRiskCount"
            stroke="#7f1d1d"
            strokeWidth={2}
            name="High Risk Count"
            dot={{ fill: "#7f1d1d", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
