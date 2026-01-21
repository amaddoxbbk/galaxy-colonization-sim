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
}

export function SpaghettiChart({ individualSims, individualSims2 }: SpaghettiChartProps) {
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

  // Get years per round from data
  const yearsPerRound = individualSims[0]?.[1]?.year - individualSims[0]?.[0]?.year || 100;

  // Find max length across all sims
  const maxLength1 = Math.max(...individualSims.map((s) => s.length));
  const maxLength2 = individualSims2 ? Math.max(...individualSims2.map((s) => s.length)) : 0;
  const maxLength = Math.max(maxLength1, maxLength2);

  // Build combined data
  const combinedData: Record<string, number>[] = [];

  for (let i = 0; i < maxLength; i++) {
    const point: Record<string, number> = { year: i * yearsPerRound };

    // Get year from first available sim at this index
    for (const sim of individualSims) {
      if (sim[i]) {
        point.year = sim[i].year;
        break;
      }
    }

    // Add sim 1 data
    individualSims.forEach((sim, simIndex) => {
      if (i < sim.length) {
        point[`sim1_${simIndex}`] = sim[i].percentColonized;
      } else if (sim.length > 0) {
        point[`sim1_${simIndex}`] = sim[sim.length - 1].percentColonized;
      }
    });

    // Add sim 2 data
    if (individualSims2) {
      individualSims2.forEach((sim, simIndex) => {
        if (i < sim.length) {
          point[`sim2_${simIndex}`] = sim[i].percentColonized;
        } else if (sim.length > 0) {
          point[`sim2_${simIndex}`] = sim[sim.length - 1].percentColonized;
        }
      });
    }

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
