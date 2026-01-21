"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimulationParams, DEFAULT_PARAMS } from "@/lib/simulation";

interface SimulationFormProps {
  params: SimulationParams;
  params2: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onParams2Change: (params: SimulationParams) => void;
  compareMode: boolean;
  onCompareModeChange: (enabled: boolean) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
  progress: number;
  progress2: number;
}

function ParamInputs({
  params,
  onParamsChange,
  isRunning,
  label,
  color,
}: {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  isRunning: boolean;
  label: string;
  color: string;
}) {
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`ship_survival_prob_${label}`} className="text-xs">
          Ship Survival Probability (%)
        </Label>
        <Input
          id={`ship_survival_prob_${label}`}
          type="number"
          step="1"
          min="0"
          max="100"
          value={params.ship_survival_prob * 100}
          onChange={(e) =>
            handleChange("ship_survival_prob", (parseFloat(e.target.value) / 100).toString())
          }
          disabled={isRunning}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`colony_found_prob_${label}`} className="text-xs">
          Colony Foundation Probability (%)
        </Label>
        <Input
          id={`colony_found_prob_${label}`}
          type="number"
          step="1"
          min="0"
          max="100"
          value={params.colony_found_prob * 100}
          onChange={(e) =>
            handleChange("colony_found_prob", (parseFloat(e.target.value) / 100).toString())
          }
          disabled={isRunning}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`years_per_round_${label}`} className="text-xs">
          Years Per Round
        </Label>
        <Input
          id={`years_per_round_${label}`}
          type="number"
          value={params.years_per_round}
          onChange={(e) => handleChange("years_per_round", e.target.value)}
          disabled={isRunning}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`max_rounds_${label}`} className="text-xs">
          Maximum Rounds
        </Label>
        <Input
          id={`max_rounds_${label}`}
          type="number"
          value={params.max_rounds}
          onChange={(e) => handleChange("max_rounds", e.target.value)}
          disabled={isRunning}
          className="h-8 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Up to {formatNumber(params.max_rounds * params.years_per_round)} years
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`n_simulations_${label}`} className="text-xs">
          Number of Simulations
        </Label>
        <Input
          id={`n_simulations_${label}`}
          type="number"
          value={params.n_simulations}
          onChange={(e) => handleChange("n_simulations", e.target.value)}
          disabled={isRunning}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

export function SimulationForm({
  params,
  params2,
  onParamsChange,
  onParams2Change,
  compareMode,
  onCompareModeChange,
  onRunSimulation,
  isRunning,
  progress,
  progress2,
}: SimulationFormProps) {
  const getProgressText = () => {
    if (!isRunning) return "Run Simulation";
    if (compareMode) {
      if (progress < 100) return `Sim 1: ${progress.toFixed(0)}%`;
      return `Sim 2: ${progress2.toFixed(0)}%`;
    }
    return `Running... ${progress.toFixed(0)}%`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Simulation Parameters</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-auto">
        <div className="flex items-center justify-between">
          <Label htmlFor="compare-mode" className="text-sm">
            Compare Mode
          </Label>
          <button
            id="compare-mode"
            role="switch"
            aria-checked={compareMode}
            onClick={() => onCompareModeChange(!compareMode)}
            disabled={isRunning}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              compareMode ? "bg-primary" : "bg-muted"
            } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                compareMode ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <ParamInputs
            params={params}
            onParamsChange={onParamsChange}
            isRunning={isRunning}
            label="Simulation 1"
            color="bg-[#8884d8]"
          />

          {compareMode && (
            <>
              <div className="border-t pt-4" />
              <ParamInputs
                params={params2}
                onParamsChange={onParams2Change}
                isRunning={isRunning}
                label="Simulation 2"
                color="bg-[#82ca9d]"
              />
            </>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button className="w-full" onClick={onRunSimulation} disabled={isRunning}>
            {getProgressText()}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onParamsChange(DEFAULT_PARAMS);
              onParams2Change(DEFAULT_PARAMS);
            }}
            disabled={isRunning}
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
