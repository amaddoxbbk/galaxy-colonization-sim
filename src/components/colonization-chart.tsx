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
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesDataPoint } from "@/lib/simulation";

interface ColonizationChartProps {
  data: TimeSeriesDataPoint[];
  data2?: TimeSeriesDataPoint[];
  isLoading?: boolean;
}

export function ColonizationChart({ data, data2, isLoading }: ColonizationChartProps) {
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
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Colonization Progress</CardTitle>
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
  const yearMap = new Map<number, {
    mean1?: number;
    p10_1?: number;
    p90_1?: number;
    mean2?: number;
    p10_2?: number;
    p90_2?: number;
  }>();

  // Add all years from data1
  for (const d of data) {
    yearMap.set(d.year, {
      mean1: d.mean,
      p10_1: d.p10,
      p90_1: d.p90,
    });
  }

  // Add/merge years from data2
  if (data2) {
    for (const d of data2) {
      const existing = yearMap.get(d.year);
      if (existing) {
        existing.mean2 = d.mean;
        existing.p10_2 = d.p10;
        existing.p90_2 = d.p90;
      } else {
        yearMap.set(d.year, {
          mean2: d.mean,
          p10_2: d.p10,
          p90_2: d.p90,
        });
      }
    }
  }

  // Convert to array and sort by year
  const mergedData = Array.from(yearMap.entries())
    .map(([year, values]) => ({ year, ...values }))
    .sort((a, b) => a.year - b.year);

  return (
    <Card className="h-full min-h-[200px] flex flex-col relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Colonization Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-xl">
            <p className="text-muted-foreground text-sm">Updating...</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
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
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
              width={45}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value);
                if (name === "mean1") return [formatPercent(v), "Sim 1 Mean"];
                if (name === "mean2") return [formatPercent(v), "Sim 2 Mean"];
                if (name === "p90_1") return [formatPercent(v), "Sim 1 90th"];
                if (name === "p10_1") return [formatPercent(v), "Sim 1 10th"];
                if (name === "p90_2") return [formatPercent(v), "Sim 2 90th"];
                if (name === "p10_2") return [formatPercent(v), "Sim 2 10th"];
                return [formatPercent(v), name];
              }}
              labelFormatter={(label) => `Year ${formatYear(Number(label))}`}
              contentStyle={{ fontSize: 12 }}
            />
            {data2 && <Legend wrapperStyle={{ fontSize: 11 }} />}

            {/* Sim 1 confidence band */}
            <Area
              type="monotone"
              dataKey="p90_1"
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.2}
              name="p90_1"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="p10_1"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              name="p10_1"
              legendType="none"
            />

            {/* Sim 2 confidence band (if present) */}
            {data2 && (
              <>
                <Area
                  type="monotone"
                  dataKey="p90_2"
                  stroke="none"
                  fill="#82ca9d"
                  fillOpacity={0.15}
                  name="p90_2"
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="p10_2"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  name="p10_2"
                  legendType="none"
                />
              </>
            )}

            {/* Sim 1 mean line */}
            <Line
              type="monotone"
              dataKey="mean1"
              name="Simulation 1"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />

            {/* Sim 2 mean line (if present) */}
            {data2 && (
              <Line
                type="monotone"
                dataKey="mean2"
                name="Simulation 2"
                stroke="#82ca9d"
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
