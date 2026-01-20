"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationStats } from "@/lib/simulation";

interface StatsPanelProps {
  stats: SimulationStats | null;
}

export function StatsPanel({ stats }: StatsPanelProps) {
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
      return `${(value / 1_000_000_000_000_000).toFixed(1)} quadrillion`;
    }
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(1)} trillion`;
    }
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} billion`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} million`;
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
      value: stats.timeTo1Pct.mean,
      stdDev: stats.timeTo1Pct.stdDev,
      format: formatYears,
      unit: "years",
    },
    {
      label: "Time to 50%",
      value: stats.timeTo50Pct.mean,
      stdDev: stats.timeTo50Pct.stdDev,
      format: formatYears,
      unit: "years",
    },
    {
      label: "Time to 99%",
      value: stats.timeTo99Pct.mean,
      stdDev: stats.timeTo99Pct.stdDev,
      format: formatYears,
      unit: "years",
    },
    {
      label: "Ships Lost",
      value: stats.totalShipsLost.mean,
      stdDev: stats.totalShipsLost.stdDev,
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
        <div className="space-y-4">
          {statItems.map((item) => (
            <div key={item.label} className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <div className="text-right">
                <span className="text-lg font-semibold">
                  {item.format(item.value)}
                </span>
                {item.unit && (
                  <span className="text-sm text-muted-foreground ml-1">
                    {item.unit}
                  </span>
                )}
                <div className="text-xs text-muted-foreground">
                  ± {item.format(item.stdDev)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Values shown as mean ± standard deviation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
