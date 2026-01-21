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
}

export function SpaghettiChart({ individualSims }: SpaghettiChartProps) {
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
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Simulation Spread</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform data: create a single array where each point has all sim values
  const maxLength = Math.max(...individualSims.map((s) => s.length));
  const combinedData: Record<string, number>[] = [];

  for (let i = 0; i < maxLength; i++) {
    const point: Record<string, number> = { year: i * (individualSims[0]?.[1]?.year - individualSims[0]?.[0]?.year || 100) };

    // Get year from first available sim at this index
    for (const sim of individualSims) {
      if (sim[i]) {
        point.year = sim[i].year;
        break;
      }
    }

    individualSims.forEach((sim, simIndex) => {
      if (i < sim.length) {
        point[`sim${simIndex}`] = sim[i].percentColonized;
      } else if (sim.length > 0) {
        point[`sim${simIndex}`] = sim[sim.length - 1].percentColonized;
      }
    });

    combinedData.push(point);
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Simulation Spread</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
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
            {individualSims.map((_, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={`sim${index}`}
                stroke="#8884d8"
                strokeWidth={1}
                strokeOpacity={0.15}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {individualSims.length} individual simulation runs
        </p>
      </CardContent>
    </Card>
  );
}
