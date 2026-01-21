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
  PESSIMISTIC_PARAMS,
  runSimulationAsync,
} from "@/lib/simulation";

export default function Home() {
  const [params1, setParams1] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [params2, setParams2] = useState<SimulationParams>(PESSIMISTIC_PARAMS);
  const [results1, setResults1] = useState<SimulationResults | null>(null);
  const [results2, setResults2] = useState<SimulationResults | null>(null);
  const [isRunning1, setIsRunning1] = useState(false);
  const [isRunning2, setIsRunning2] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);

  const handleRunBothSimulations = async () => {
    setIsRunning1(true);
    setIsRunning2(true);
    setProgress1(0);
    setProgress2(0);
    setResults1(null);
    setResults2(null);

    // Run both simulations in parallel
    const sim1Promise = runSimulationAsync(params1, (p) => {
      setProgress1(p);
    })
      .then((results) => {
        setResults1(results);
        setIsRunning1(false);
        setProgress1(100);
      })
      .catch((error) => {
        console.error("Simulation 1 failed:", error);
        setIsRunning1(false);
      });

    const sim2Promise = runSimulationAsync(params2, (p) => {
      setProgress2(p);
    })
      .then((results) => {
        setResults2(results);
        setIsRunning2(false);
        setProgress2(100);
      })
      .catch((error) => {
        console.error("Simulation 2 failed:", error);
        setIsRunning2(false);
      });

    await Promise.all([sim1Promise, sim2Promise]);
  };

  const handleReset1 = () => {
    setParams1(DEFAULT_PARAMS);
    setResults1(null);
    setProgress1(0);
  };

  const handleReset2 = () => {
    setParams2(DEFAULT_PARAMS);
    setResults2(null);
    setProgress2(0);
  };

  return (
    <div className="min-h-screen lg:h-screen bg-background p-4 flex flex-col lg:overflow-hidden">
      <div className="mx-auto max-w-7xl w-full flex flex-col flex-1 min-h-0">
        <h1 className="text-xl font-bold mb-1">Galaxy Colonization Simulation</h1>
        <p className="text-muted-foreground text-xs mb-3">
          Simulate the spread of civilization across the galaxy over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 flex-1 min-h-0">
          {/* Sidebar - two forms side by side on mobile, stacked on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-1 lg:flex lg:flex-col gap-3 min-h-0">
            <SimulationForm
              params={params1}
              onParamsChange={setParams1}
              onRunSimulation={handleRunBothSimulations}
              onReset={handleReset1}
              isRunning={isRunning1}
              progress={progress1}
              label="Simulation 1"
              color="bg-[#8884d8]"
            />
            <SimulationForm
              params={params2}
              onParamsChange={setParams2}
              onRunSimulation={handleRunBothSimulations}
              onReset={handleReset2}
              isRunning={isRunning2}
              progress={progress2}
              label="Simulation 2"
              color="bg-[#82ca9d]"
            />
          </div>

          {/* Chart grid - single column on mobile, 2x2 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-rows-2 gap-3 min-h-0">
            <ColonizationChart
              data={results1?.timeSeriesData ?? []}
              data2={results2?.timeSeriesData}
              isLoading={isRunning1 || isRunning2}
            />
            <SpaghettiChart
              individualSims={results1?.individualSims ?? []}
              individualSims2={results2?.individualSims}
              isLoading={isRunning1 || isRunning2}
            />
            <NewColoniesChart
              data={results1?.timeSeriesData ?? []}
              data2={results2?.timeSeriesData}
              isLoading={isRunning1 || isRunning2}
            />
            <StatsPanel
              stats={results1?.stats ?? null}
              stats2={results2?.stats}
              isLoading={isRunning1 || isRunning2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
