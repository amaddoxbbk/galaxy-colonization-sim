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
    <Card className="flex-1 flex flex-col min-h-0 py-0 gap-0">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0 space-y-3 justify-center">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Ship Survival %</Label>
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
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Colony Found %</Label>
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
              className="h-7 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Years/Round</Label>
            <Input
              type="number"
              value={params.years_per_round}
              onChange={(e) => handleChange("years_per_round", e.target.value)}
              disabled={isRunning}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Rounds</Label>
            <Input
              type="number"
              value={params.max_rounds}
              onChange={(e) => handleChange("max_rounds", e.target.value)}
              disabled={isRunning}
              className="h-7 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Simulations</Label>
          <Input
            type="number"
            value={params.n_simulations}
            onChange={(e) => handleChange("n_simulations", e.target.value)}
            disabled={isRunning}
            className="h-7 text-xs"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={onRunSimulation}
            disabled={isRunning}
          >
            {isRunning ? `${progress.toFixed(0)}%` : "Run"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
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
