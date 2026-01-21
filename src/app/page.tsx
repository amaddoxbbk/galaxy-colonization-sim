"use client";

import { useState } from "react";
import { SimulationForm } from "@/components/simulation-form";
import { ColonizationChart } from "@/components/colonization-chart";
import { SpaghettiChart } from "@/components/spaghetti-chart";
import { NewColoniesChart } from "@/components/new-colonies-chart";
import { StatsPanel } from "@/components/stats-panel";
import {
  SimulationParams,
  SimulationResults,
  DEFAULT_PARAMS,
  runSimulationAsync,
} from "@/lib/simulation";

export default function Home() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [params2, setParams2] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [results2, setResults2] = useState<SimulationResults | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progress2, setProgress2] = useState(0);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setProgress2(0);
    setResults(null);
    setResults2(null);

    try {
      // Run first simulation
      const simResults = await runSimulationAsync(params, (p) => {
        setProgress(p);
      });
      setResults(simResults);

      // Run second simulation if compare mode is on
      if (compareMode) {
        const simResults2 = await runSimulationAsync(params2, (p) => {
          setProgress2(p);
        });
        setResults2(simResults2);
      }
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsRunning(false);
      setProgress(100);
      if (compareMode) setProgress2(100);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-1">Galaxy Colonization Simulation</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Simulate the spread of civilization across the galaxy over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 lg:items-stretch">
          <div className="flex flex-col">
            <SimulationForm
              params={params}
              params2={params2}
              onParamsChange={setParams}
              onParams2Change={setParams2}
              compareMode={compareMode}
              onCompareModeChange={setCompareMode}
              onRunSimulation={handleRunSimulation}
              isRunning={isRunning}
              progress={progress}
              progress2={progress2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColonizationChart
              data={results?.timeSeriesData ?? []}
              data2={compareMode ? results2?.timeSeriesData : undefined}
            />
            <SpaghettiChart
              individualSims={results?.individualSims ?? []}
              individualSims2={compareMode ? results2?.individualSims : undefined}
            />
            <NewColoniesChart
              data={results?.timeSeriesData ?? []}
              data2={compareMode ? results2?.timeSeriesData : undefined}
            />
            <StatsPanel
              stats={results?.stats ?? null}
              stats2={compareMode ? results2?.stats : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
