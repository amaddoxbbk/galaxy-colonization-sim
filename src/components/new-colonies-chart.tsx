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
  isLoading?: boolean;
}

export function NewColoniesChart({ data, data2, isLoading }: NewColoniesChartProps) {
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
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New Colonies Per Round</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1 min-h-0">
          <p className="text-muted-foreground text-sm">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  // Merge data by year (not by index) to handle different time scales
  const yearMap = new Map<number, { colonies1?: number; colonies2?: number }>();

  for (const d of data) {
    yearMap.set(d.year, { colonies1: d.meanNewColonies });
  }

  if (data2) {
    for (const d of data2) {
      const existing = yearMap.get(d.year);
      if (existing) {
        existing.colonies2 = d.meanNewColonies;
      } else {
        yearMap.set(d.year, { colonies2: d.meanNewColonies });
      }
    }
  }

  const mergedData = Array.from(yearMap.entries())
    .map(([year, values]) => ({ year, ...values }))
    .sort((a, b) => a.year - b.year);

  // Find the maximum value for better axis scaling
  const allValues = [
    ...data.map((d) => d.meanNewColonies),
    ...(data2?.map((d) => d.meanNewColonies) || []),
  ].filter((v) => v > 0);

  const maxColonies = Math.max(...allValues);
  const minNonZero = Math.min(...allValues) || 1;

  return (
    <Card className="h-full min-h-[200px] flex flex-col relative p-0">
      <CardHeader className="pb-1 pt-2 px-2">
        <CardTitle className="text-sm">New Colonies Per Round</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-1 pt-0">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-xl">
            <p className="text-muted-foreground text-sm">Updating...</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mergedData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
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
