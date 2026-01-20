"use client";

import { useState } from "react";
import { SimulationForm } from "@/components/simulation-form";
import { ColonizationChart } from "@/components/colonization-chart";
import {
  SimulationParams,
  SimulationDataPoint,
  DEFAULT_PARAMS,
  runSimulationAsync,
} from "@/lib/simulation";

export default function Home() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [data, setData] = useState<SimulationDataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setData([]);

    try {
      const results = await runSimulationAsync(params, (p) => {
        setProgress(p);
      });
      setData(results);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Galaxy Colonization Simulation</h1>
        <p className="text-muted-foreground mb-6">
          Simulate the spread of civilization across the galaxy over time.
          Adjust parameters and run the simulation to visualize colonization progress.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          <div>
            <SimulationForm
              params={params}
              onParamsChange={setParams}
              onRunSimulation={handleRunSimulation}
              isRunning={isRunning}
              progress={progress}
            />
          </div>
          <div>
            <ColonizationChart data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
