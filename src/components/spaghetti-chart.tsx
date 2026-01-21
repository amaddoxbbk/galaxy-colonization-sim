"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpaghettiChartProps {
  individualSims: { year: number; percentColonized: number }[][];
  individualSims2?: { year: number; percentColonized: number }[][];
  isLoading?: boolean;
}

export function SpaghettiChart({ individualSims, individualSims2, isLoading }: SpaghettiChartProps) {
  const formatYear = (year: number): string => {
    if (year >= 1_000_000) {
      return `${(year / 1_000_000).toFixed(1)}M`;
    }
    if (year >= 1000) {
      return `${(year / 1000).toFixed(0)}K`;
    }
    return year.toString();
  };

  if (individualSims.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Simulation Spread</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1 min-h-0">
          <p className="text-muted-foreground text-sm">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  // Build combined data by merging all years from both simulation sets
  const yearMap = new Map<number, Record<string, number>>();

  // Add all data points from sim 1
  individualSims.forEach((sim, simIndex) => {
    sim.forEach((point) => {
      if (!yearMap.has(point.year)) {
        yearMap.set(point.year, { year: point.year });
      }
      yearMap.get(point.year)![`sim1_${simIndex}`] = point.percentColonized;
    });
  });

  // Add all data points from sim 2
  if (individualSims2) {
    individualSims2.forEach((sim, simIndex) => {
      sim.forEach((point) => {
        if (!yearMap.has(point.year)) {
          yearMap.set(point.year, { year: point.year });
        }
        yearMap.get(point.year)![`sim2_${simIndex}`] = point.percentColonized;
      });
    });
  }

  // Convert to sorted array
  const combinedData = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

  return (
    <Card className="h-full flex flex-col relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Simulation Spread</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-xl">
            <p className="text-muted-foreground text-sm">Updating...</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
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
              formatter={(value) => [`${Number(value).toFixed(4)}%`, ""]}
              labelFormatter={(label) => `Year ${formatYear(Number(label))}`}
              contentStyle={{ fontSize: 12 }}
            />

            {/* Sim 1 traces - purple, solid */}
            {individualSims.map((_, index) => (
              <Line
                key={`sim1_${index}`}
                type="monotone"
                dataKey={`sim1_${index}`}
                stroke="#8884d8"
                strokeWidth={1}
                strokeOpacity={0.15}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {/* Sim 2 traces - green, dashed */}
            {individualSims2?.map((_, index) => (
              <Line
                key={`sim2_${index}`}
                type="monotone"
                dataKey={`sim2_${index}`}
                stroke="#82ca9d"
                strokeWidth={1}
                strokeOpacity={0.15}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          <p className="text-xs text-muted-foreground">
            <span className="inline-block w-3 h-0.5 bg-[#8884d8] mr-1 align-middle" />
            Sim 1: {individualSims.length} runs
          </p>
          {individualSims2 && (
            <p className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-0.5 bg-[#82ca9d] mr-1 align-middle border-dashed" style={{ borderTop: '2px dashed #82ca9d', height: 0 }} />
              Sim 2: {individualSims2.length} runs
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
