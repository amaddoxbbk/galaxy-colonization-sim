"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationDataPoint } from "@/lib/simulation";

interface ColonizationChartProps {
  data: SimulationDataPoint[];
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
        <CardHeader>
          <CardTitle>Galaxy Colonization Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Galaxy Colonization Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tickFormatter={formatYear}
              label={{ value: "Years", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              domain={[0, 100]}
              label={{
                value: "% Colonized",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value: number) => [formatPercent(value), "Colonized"]}
              labelFormatter={(label) => `Year ${formatYear(label)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="percentColonized"
              name="% of Galaxy Colonized"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Final colonization: </span>
            <span className="font-medium">
              {formatPercent(data[data.length - 1]?.percentColonized ?? 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total time: </span>
            <span className="font-medium">
              {formatYear(data[data.length - 1]?.year ?? 0)} years
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
