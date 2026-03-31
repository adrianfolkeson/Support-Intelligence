"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SentimentData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentChartProps {
  data: SentimentData[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
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
          />
          <Legend />
          <Bar dataKey="positive" fill="#4d7c0f" name="Positive" stackId="sentiment" />
          <Bar dataKey="neutral" fill="#737373" name="Neutral" stackId="sentiment" />
          <Bar dataKey="negative" fill="#7f1d1d" name="Negative" stackId="sentiment" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
