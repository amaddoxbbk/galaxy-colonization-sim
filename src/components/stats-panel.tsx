"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationStats } from "@/lib/simulation";

interface StatsPanelProps {
  stats: SimulationStats | null;
  stats2?: SimulationStats | null;
}

export function StatsPanel({ stats, stats2 }: StatsPanelProps) {
  const formatYears = (value: number): string => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const formatShips = (value: number): string => {
    if (value >= 1_000_000_000_000_000) {
      return `${(value / 1_000_000_000_000_000).toFixed(1)}Q`;
    }
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(1)}T`;
    }
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return value.toFixed(0);
  };

  if (!stats) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm">
            Run a simulation to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      label: "Time to 1%",
      value1: stats.timeTo1Pct,
      value2: stats2?.timeTo1Pct,
      format: formatYears,
      unit: "yrs",
    },
    {
      label: "Time to 50%",
      value1: stats.timeTo50Pct,
      value2: stats2?.timeTo50Pct,
      format: formatYears,
      unit: "yrs",
    },
    {
      label: "Time to 99%",
      value1: stats.timeTo99Pct,
      value2: stats2?.timeTo99Pct,
      format: formatYears,
      unit: "yrs",
    },
    {
      label: "Ships Lost",
      value1: stats.totalShipsLost,
      value2: stats2?.totalShipsLost,
      format: formatShips,
      unit: "",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header row for compare mode */}
          {stats2 && (
            <div className="flex justify-end gap-4 text-xs font-medium border-b pb-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#8884d8]" />
                <span>Sim 1</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#82ca9d]" />
                <span>Sim 2</span>
              </div>
            </div>
          )}

          {statItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="flex justify-between items-baseline gap-2">
                {/* Sim 1 value */}
                <div className={stats2 ? "flex-1" : "flex-1 text-right"}>
                  <span className="text-base font-semibold">
                    {item.format(item.value1.mean)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {item.unit}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    ± {item.format(item.value1.stdDev)}
                  </div>
                </div>

                {/* Sim 2 value */}
                {stats2 && item.value2 && (
                  <div className="flex-1 text-right">
                    <span className="text-base font-semibold text-[#82ca9d]">
                      {item.format(item.value2.mean)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {item.unit}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      ± {item.format(item.value2.stdDev)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Mean ± standard deviation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
