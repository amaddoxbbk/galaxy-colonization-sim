"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationStats } from "@/lib/simulation";

interface StatsPanelProps {
  stats: SimulationStats | null;
  stats2?: SimulationStats | null;
  isLoading?: boolean;
}

export function StatsPanel({ stats, stats2, isLoading }: StatsPanelProps) {
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
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1 min-h-0">
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
    <Card className="h-full flex flex-col relative">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-sm">Key Statistics</CardTitle>
      </CardHeader>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-xl">
          <p className="text-muted-foreground text-sm">Updating...</p>
        </div>
      )}
      <CardContent className="flex-1 overflow-auto px-3 pb-2 pt-0">
        {/* Header row for compare mode */}
        {stats2 && (
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-1 text-xs font-medium border-b pb-1 mb-1">
            <div></div>
            <div className="text-center flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#8884d8]" />
              <span>Sim 1</span>
            </div>
            <div className="text-center flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#82ca9d]" />
              <span>Sim 2</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {statItems.map((item) => (
            <div key={item.label} className={stats2 ? "grid grid-cols-[1fr_1fr_1fr] gap-1 items-baseline" : "flex justify-between items-baseline"}>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              {/* Sim 1 value */}
              <div className={stats2 ? "text-center" : "text-right"}>
                <span className={`text-sm font-semibold ${stats2 ? "text-[#8884d8]" : ""}`}>
                  {item.format(item.value1.mean)}
                </span>
                <span className="text-xs text-muted-foreground ml-0.5">
                  {item.unit}
                </span>
                <div className="text-xs text-muted-foreground">
                  ± {item.format(item.value1.stdDev)}
                </div>
              </div>

              {/* Sim 2 value */}
              {stats2 && item.value2 && (
                <div className="text-center">
                  <span className="text-sm font-semibold text-[#82ca9d]">
                    {item.format(item.value2.mean)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-0.5">
                    {item.unit}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    ± {item.format(item.value2.stdDev)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-1 pt-1 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Mean ± std dev
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
