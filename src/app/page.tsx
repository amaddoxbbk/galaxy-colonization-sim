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
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      const simResults = await runSimulationAsync(params, (p) => {
        setProgress(p);
      });
      setResults(simResults);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-1">Galaxy Colonization Simulation</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Simulate the spread of civilization across the galaxy over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
          <div>
            <SimulationForm
              params={params}
              onParamsChange={setParams}
              onRunSimulation={handleRunSimulation}
              isRunning={isRunning}
              progress={progress}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColonizationChart data={results?.timeSeriesData ?? []} />
            <SpaghettiChart individualSims={results?.individualSims ?? []} />
            <NewColoniesChart data={results?.timeSeriesData ?? []} />
            <StatsPanel stats={results?.stats ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
