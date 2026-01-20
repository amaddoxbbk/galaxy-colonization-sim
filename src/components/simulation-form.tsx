"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimulationParams, DEFAULT_PARAMS } from "@/lib/simulation";

interface SimulationFormProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
  progress: number;
}

export function SimulationForm({
  params,
  onParamsChange,
  onRunSimulation,
  isRunning,
  progress,
}: SimulationFormProps) {
  const handleChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onParamsChange({ ...params, [field]: numValue });
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ship_survival_prob">Ship Survival Probability (%)</Label>
          <Input
            id="ship_survival_prob"
            type="number"
            step="1"
            min="0"
            max="100"
            value={params.ship_survival_prob * 100}
            onChange={(e) => handleChange("ship_survival_prob", (parseFloat(e.target.value) / 100).toString())}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="colony_found_prob">Colony Foundation Probability (%)</Label>
          <Input
            id="colony_found_prob"
            type="number"
            step="1"
            min="0"
            max="100"
            value={params.colony_found_prob * 100}
            onChange={(e) => handleChange("colony_found_prob", (parseFloat(e.target.value) / 100).toString())}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="years_per_round">Years Per Round</Label>
          <Input
            id="years_per_round"
            type="number"
            value={params.years_per_round}
            onChange={(e) => handleChange("years_per_round", e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_rounds">Maximum Rounds</Label>
          <Input
            id="max_rounds"
            type="number"
            value={params.max_rounds}
            onChange={(e) => handleChange("max_rounds", e.target.value)}
            disabled={isRunning}
          />
          <p className="text-xs text-muted-foreground">
            Up to {formatNumber(params.max_rounds * params.years_per_round)} years
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="n_simulations">Number of Simulations</Label>
          <Input
            id="n_simulations"
            type="number"
            value={params.n_simulations}
            onChange={(e) => handleChange("n_simulations", e.target.value)}
            disabled={isRunning}
          />
          <p className="text-xs text-muted-foreground">
            Results averaged across {formatNumber(params.n_simulations)} runs
          </p>
        </div>

        <Button
          className="w-full"
          onClick={onRunSimulation}
          disabled={isRunning}
        >
          {isRunning ? `Running... ${progress.toFixed(0)}%` : "Run Simulation"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onParamsChange(DEFAULT_PARAMS)}
          disabled={isRunning}
        >
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  );
}
