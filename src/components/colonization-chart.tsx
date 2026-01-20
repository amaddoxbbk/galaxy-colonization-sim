"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesDataPoint } from "@/lib/simulation";

interface ColonizationChartProps {
  data: TimeSeriesDataPoint[];
}

export function ColonizationChart({ data }: ColonizationChartProps) {
  const formatYear = (year: number): string => {
    if (year >= 1_000_000) {
      return `${(year / 1_000_000).toFixed(1)}M`;
    }
    if (year >= 1000) {
      return `${(year / 1000).toFixed(0)}K`;
    }
    return year.toString();
  };

  const formatPercent = (value: number): string => {
    if (value < 0.01) {
      return value.toExponential(2);
    }
    return `${value.toFixed(2)}%`;
  };

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Colonization Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Colonization Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="year"
              tickFormatter={formatYear}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              scale="log"
              domain={[0.0000000001, 100]}
              allowDataOverflow={true}
              tickFormatter={(v) => {
                if (v < 0.01) return v.toExponential(0);
                if (v < 1) return `${v.toFixed(2)}%`;
                return `${v.toFixed(0)}%`;
              }}
              tick={{ fontSize: 11 }}
              width={45}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value);
                if (name === "mean") return [formatPercent(v), "Mean"];
                if (name === "p90") return [formatPercent(v), "90th %ile"];
                if (name === "p10") return [formatPercent(v), "10th %ile"];
                return [formatPercent(v), name];
              }}
              labelFormatter={(label) => `Year ${formatYear(Number(label))}`}
              contentStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="p90"
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.2}
              name="p90"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              name="p10"
            />
            <Line
              type="monotone"
              dataKey="mean"
              name="mean"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
