"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimulationParams } from "@/lib/simulation";

interface SimulationFormProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onRunSimulation: () => void;
  onReset: () => void;
  isRunning: boolean;
  progress: number;
  label: string;
  color: string;
}

export function SimulationForm({
  params,
  onParamsChange,
  onRunSimulation,
  onReset,
  isRunning,
  progress,
  label,
  color,
}: SimulationFormProps) {
  const handleChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onParamsChange({ ...params, [field]: numValue });
    }
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 py-0 gap-0 overflow-hidden">
      <CardHeader className="pb-1 pt-2 px-2 lg:px-4 lg:pt-3 lg:pb-2 shrink-0">
        <CardTitle className="text-xs lg:text-sm flex items-center gap-1.5 lg:gap-2">
          <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${color}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-2 pb-2 lg:px-4 lg:pb-4 pt-0 space-y-1.5 lg:space-y-3 justify-center overflow-auto">
        <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
          <div className="space-y-0.5 lg:space-y-1">
            <Label className="text-[10px] lg:text-xs whitespace-nowrap">Survival %</Label>
            <Input
              type="number"
              step="1"
              min="0"
              max="100"
              value={params.ship_survival_prob * 100}
              onChange={(e) =>
                handleChange("ship_survival_prob", (parseFloat(e.target.value) / 100).toString())
              }
              disabled={isRunning}
              className="h-6 lg:h-7 text-[10px] lg:text-xs px-1.5 lg:px-3"
            />
          </div>
          <div className="space-y-0.5 lg:space-y-1">
            <Label className="text-[10px] lg:text-xs whitespace-nowrap">Colony %</Label>
            <Input
              type="number"
              step="1"
              min="0"
              max="100"
              value={params.colony_found_prob * 100}
              onChange={(e) =>
                handleChange("colony_found_prob", (parseFloat(e.target.value) / 100).toString())
              }
              disabled={isRunning}
              className="h-6 lg:h-7 text-[10px] lg:text-xs px-1.5 lg:px-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
          <div className="space-y-0.5 lg:space-y-1">
            <Label className="text-[10px] lg:text-xs">Years/Round</Label>
            <Input
              type="number"
              value={params.years_per_round}
              onChange={(e) => handleChange("years_per_round", e.target.value)}
              disabled={isRunning}
              className="h-6 lg:h-7 text-[10px] lg:text-xs px-1.5 lg:px-3"
            />
          </div>
          <div className="space-y-0.5 lg:space-y-1">
            <Label className="text-[10px] lg:text-xs">Max Rounds</Label>
            <Input
              type="number"
              value={params.max_rounds}
              onChange={(e) => handleChange("max_rounds", e.target.value)}
              disabled={isRunning}
              className="h-6 lg:h-7 text-[10px] lg:text-xs px-1.5 lg:px-3"
            />
          </div>
        </div>

        <div className="space-y-0.5 lg:space-y-1">
          <Label className="text-[10px] lg:text-xs">Simulations</Label>
          <Input
            type="number"
            value={params.n_simulations}
            onChange={(e) => handleChange("n_simulations", e.target.value)}
            disabled={isRunning}
            className="h-6 lg:h-7 text-[10px] lg:text-xs px-1.5 lg:px-3"
          />
        </div>

        <div className="flex gap-1.5 lg:gap-2 pt-0.5 lg:pt-1">
          <Button
            size="sm"
            className="flex-1 h-6 lg:h-7 text-[10px] lg:text-xs px-2"
            onClick={onRunSimulation}
            disabled={isRunning}
          >
            {isRunning ? `${progress.toFixed(0)}%` : "Run"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 lg:h-7 text-[10px] lg:text-xs px-2"
            onClick={onReset}
            disabled={isRunning}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
