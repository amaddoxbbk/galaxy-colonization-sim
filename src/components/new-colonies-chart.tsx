"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesDataPoint } from "@/lib/simulation";

interface NewColoniesChartProps {
  data: TimeSeriesDataPoint[];
  data2?: TimeSeriesDataPoint[];
}

export function NewColoniesChart({ data, data2 }: NewColoniesChartProps) {
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

  // Merge data for dual display
  const mergedData = data.map((d, i) => ({
    year: d.year,
    colonies1: d.meanNewColonies,
    colonies2: data2?.[i]?.meanNewColonies,
  }));

  // Add any extra points from data2
  if (data2 && data2.length > data.length) {
    for (let i = data.length; i < data2.length; i++) {
      mergedData.push({
        year: data2[i].year,
        colonies1: undefined as unknown as number,
        colonies2: data2[i].meanNewColonies,
      });
    }
  }

  // Find the maximum value for better axis scaling
  const allValues = [
    ...data.map((d) => d.meanNewColonies),
    ...(data2?.map((d) => d.meanNewColonies) || []),
  ].filter((v) => v > 0);

  const maxColonies = Math.max(...allValues);
  const minNonZero = Math.min(...allValues) || 1;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">New Colonies Per Round</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart
            data={mergedData}
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
              formatter={(value, name) => {
                const label = name === "colonies1" ? "Sim 1" : "Sim 2";
                return [formatColonies(Number(value)), label];
              }}
              labelFormatter={(label) => `Year ${formatYear(Number(label))}`}
              contentStyle={{ fontSize: 12 }}
            />
            {data2 && <Legend wrapperStyle={{ fontSize: 11 }} />}

            {/* Sim 1 - solid area */}
            <Area
              type="monotone"
              dataKey="colonies1"
              name="Simulation 1"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.4}
              strokeWidth={2}
            />

            {/* Sim 2 - dashed line (no fill to avoid overlap) */}
            {data2 && (
              <Line
                type="monotone"
                dataKey="colonies2"
                name="Simulation 2"
                stroke="#ffc658"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
