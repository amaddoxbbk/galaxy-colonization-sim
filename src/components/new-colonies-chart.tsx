"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesDataPoint } from "@/lib/simulation";

interface NewColoniesChartProps {
  data: TimeSeriesDataPoint[];
}

export function NewColoniesChart({ data }: NewColoniesChartProps) {
  const formatYear = (year: number): string => {
    if (year >= 1_000_000) {
      return `${(year / 1_000_000).toFixed(1)}M`;
    }
    if (year >= 1000) {
      return `${(year / 1000).toFixed(0)}K`;
    }
    return year.toString();
  };

  const formatColonies = (value: number): string => {
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(1)}T`;
    }
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New Colonies Per Round</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find the maximum value for better axis scaling
  const maxColonies = Math.max(...data.map((d) => d.meanNewColonies));
  const minNonZero = Math.min(
    ...data.filter((d) => d.meanNewColonies > 0).map((d) => d.meanNewColonies)
  ) || 1;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">New Colonies Per Round</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
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
              domain={[Math.max(0.1, minNonZero * 0.1), maxColonies * 1.5]}
              allowDataOverflow={true}
              tickFormatter={formatColonies}
              tick={{ fontSize: 11 }}
              width={45}
            />
            <Tooltip
              formatter={(value) => [formatColonies(Number(value)), "New Colonies"]}
              labelFormatter={(label) => `Year ${formatYear(Number(label))}`}
              contentStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="meanNewColonies"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
