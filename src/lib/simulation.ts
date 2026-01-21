export interface SimulationParams {
  total_systems: number;
  ship_survival_prob: number;
  colony_found_prob: number;
  years_per_round: number;
  max_rounds: number;
  n_simulations: number;
}

// Legacy interface for backward compatibility
export interface SimulationDataPoint {
  year: number;
  percentColonized: number;
}

// New detailed interfaces
export interface SingleSimulationResult {
  percentages: number[];
  newColoniesPerRound: number[];
  milestones: {
    pct1Year: number | null;
    pct50Year: number | null;
    pct99Year: number | null;
  };
  totalShipsLost: number;
}

export interface TimeSeriesDataPoint {
  year: number;
  mean: number;
  p10: number;
  p90: number;
  meanNewColonies: number;
}

export interface SimulationStats {
  timeTo1Pct: { mean: number; stdDev: number };
  timeTo50Pct: { mean: number; stdDev: number };
  timeTo99Pct: { mean: number; stdDev: number };
  totalShipsLost: { mean: number; stdDev: number };
}

export interface SimulationResults {
  timeSeriesData: TimeSeriesDataPoint[];
  individualSims: { year: number; percentColonized: number }[][];
  stats: SimulationStats;
}

// Optimistic scenario: fast ships, high success rates
export const DEFAULT_PARAMS: SimulationParams = {
  total_systems: 200_000_000_000,
  ship_survival_prob: 0.5,
  colony_found_prob: 0.5,
  years_per_round: 100,
  max_rounds: 10_000,
  n_simulations: 1_000,
};

// Pessimistic scenario: slow ships, low success rates
export const PESSIMISTIC_PARAMS: SimulationParams = {
  total_systems: 200_000_000_000,
  ship_survival_prob: 0.1,
  colony_found_prob: 0.1,
  years_per_round: 1000,
  max_rounds: 10_000,
  n_simulations: 1_000,
};

function runSingleSimulation(params: SimulationParams): SingleSimulationResult {
  const {
    total_systems,
    ship_survival_prob,
    colony_found_prob,
    years_per_round,
    max_rounds,
  } = params;

  const percentages: number[] = [];
  const newColoniesPerRound: number[] = [];
  const milestones: SingleSimulationResult["milestones"] = {
    pct1Year: null,
    pct50Year: null,
    pct99Year: null,
  };
  let totalShipsLost = 0;
  let colonized = 1;

  for (let round = 0; round < max_rounds; round++) {
    const percentColonized = (colonized / total_systems) * 100;
    percentages.push(percentColonized);

    // Track milestones
    const year = round * years_per_round;
    if (milestones.pct1Year === null && percentColonized >= 1) {
      milestones.pct1Year = year;
    }
    if (milestones.pct50Year === null && percentColonized >= 50) {
      milestones.pct50Year = year;
    }
    if (milestones.pct99Year === null && percentColonized >= 99) {
      milestones.pct99Year = year;
    }

    if (colonized >= total_systems) {
      newColoniesPerRound.push(0);
      break;
    }

    const successProb = ship_survival_prob * colony_found_prob;
    const remainingSystems = total_systems - colonized;
    const attempts = Math.min(colonized, remainingSystems);

    let newColonies = 0;
    if (attempts < 1000) {
      for (let i = 0; i < attempts; i++) {
        if (Math.random() < successProb) {
          newColonies++;
        }
      }
    } else {
      const mean = attempts * successProb;
      const stdDev = Math.sqrt(attempts * successProb * (1 - successProb));
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      newColonies = Math.round(mean + z * stdDev);
      newColonies = Math.max(0, newColonies);
    }

    newColonies = Math.min(newColonies, remainingSystems);
    newColoniesPerRound.push(newColonies);

    // Track ships lost (attempts - successes)
    totalShipsLost += attempts - newColonies;

    colonized += newColonies;

    if (percentColonized >= 100) {
      break;
    }
  }

  return {
    percentages,
    newColoniesPerRound,
    milestones,
    totalShipsLost,
  };
}

function computePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function computeMeanAndStdDev(values: number[]): { mean: number; stdDev: number } {
  const validValues = values.filter((v) => v !== null && !isNaN(v));
  if (validValues.length === 0) return { mean: 0, stdDev: 0 };

  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const squaredDiffs = validValues.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / validValues.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

export async function runSimulationAsync(
  params: SimulationParams,
  onProgress?: (progress: number) => void
): Promise<SimulationResults> {
  const { years_per_round, n_simulations } = params;
  const chunkSize = 50;
  const allResults: SingleSimulationResult[] = [];
  const sampleSize = Math.min(50, n_simulations);

  for (let i = 0; i < n_simulations; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, n_simulations);

    for (let sim = i; sim < chunkEnd; sim++) {
      allResults.push(runSingleSimulation(params));
    }

    if (onProgress) {
      onProgress((chunkEnd / n_simulations) * 100);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // Find the maximum length
  const maxLength = Math.max(...allResults.map((r) => r.percentages.length));

  // Build time series data with percentiles
  const timeSeriesData: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < maxLength; i++) {
    const year = i * years_per_round;
    const percentagesAtTime: number[] = [];
    const newColoniesAtTime: number[] = [];

    for (const result of allResults) {
      if (i < result.percentages.length) {
        percentagesAtTime.push(result.percentages[i]);
      } else {
        percentagesAtTime.push(result.percentages[result.percentages.length - 1]);
      }

      if (i < result.newColoniesPerRound.length) {
        newColoniesAtTime.push(result.newColoniesPerRound[i]);
      } else {
        newColoniesAtTime.push(0);
      }
    }

    const mean = percentagesAtTime.reduce((a, b) => a + b, 0) / percentagesAtTime.length;
    const p10 = computePercentile(percentagesAtTime, 10);
    const p90 = computePercentile(percentagesAtTime, 90);
    const meanNewColonies =
      newColoniesAtTime.reduce((a, b) => a + b, 0) / newColoniesAtTime.length;

    timeSeriesData.push({ year, mean, p10, p90, meanNewColonies });

    if (mean >= 99.99) {
      break;
    }
  }

  // Sample individual simulations for spaghetti plot
  const sampleIndices = new Set<number>();
  while (sampleIndices.size < sampleSize) {
    sampleIndices.add(Math.floor(Math.random() * n_simulations));
  }

  const individualSims: { year: number; percentColonized: number }[][] = [];
  for (const idx of sampleIndices) {
    const result = allResults[idx];
    const simData = result.percentages.map((pct, i) => ({
      year: i * years_per_round,
      percentColonized: pct,
    }));
    individualSims.push(simData);
  }

  // Compute statistics
  const timeTo1PctValues = allResults
    .map((r) => r.milestones.pct1Year)
    .filter((v): v is number => v !== null);
  const timeTo50PctValues = allResults
    .map((r) => r.milestones.pct50Year)
    .filter((v): v is number => v !== null);
  const timeTo99PctValues = allResults
    .map((r) => r.milestones.pct99Year)
    .filter((v): v is number => v !== null);
  const shipsLostValues = allResults.map((r) => r.totalShipsLost);

  const stats: SimulationStats = {
    timeTo1Pct: computeMeanAndStdDev(timeTo1PctValues),
    timeTo50Pct: computeMeanAndStdDev(timeTo50PctValues),
    timeTo99Pct: computeMeanAndStdDev(timeTo99PctValues),
    totalShipsLost: computeMeanAndStdDev(shipsLostValues),
  };

  return {
    timeSeriesData,
    individualSims,
    stats,
  };
}

// Legacy function for backward compatibility
export function runSimulation(params: SimulationParams): SimulationDataPoint[] {
  const { years_per_round, n_simulations } = params;
  const allResults: SingleSimulationResult[] = [];

  for (let sim = 0; sim < n_simulations; sim++) {
    allResults.push(runSingleSimulation(params));
  }

  const maxLength = Math.max(...allResults.map((r) => r.percentages.length));
  const averagedData: SimulationDataPoint[] = [];

  for (let i = 0; i < maxLength; i++) {
    const year = i * years_per_round;
    let sum = 0;

    for (const result of allResults) {
      if (i < result.percentages.length) {
        sum += result.percentages[i];
      } else {
        sum += result.percentages[result.percentages.length - 1];
      }
    }

    averagedData.push({
      year,
      percentColonized: sum / allResults.length,
    });

    if (sum / allResults.length >= 99.99) {
      break;
    }
  }

  return averagedData;
}
