export interface SimulationParams {
  total_systems: number;
  ship_survival_prob: number;
  colony_found_prob: number;
  years_per_round: number;
  max_rounds: number;
  n_simulations: number;
}

export interface SimulationDataPoint {
  year: number;
  percentColonized: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
  total_systems: 200_000_000_000,
  ship_survival_prob: 0.25,
  colony_found_prob: 0.25,
  years_per_round: 100,
  max_rounds: 10_000,
  n_simulations: 1_000,
};

function runSingleSimulation(params: SimulationParams): number[] {
  const {
    total_systems,
    ship_survival_prob,
    colony_found_prob,
    max_rounds,
  } = params;

  const percentages: number[] = [];
  let colonized = 1; // Start with 1 colonized system

  for (let round = 0; round < max_rounds; round++) {
    const percentColonized = (colonized / total_systems) * 100;
    percentages.push(percentColonized);

    // Stop if we've colonized everything
    if (colonized >= total_systems) {
      break;
    }

    // Each colonized system sends one ship
    // Combined probability of survival AND establishing colony
    const successProb = ship_survival_prob * colony_found_prob;

    // Expected new colonies from binomial distribution
    // For large numbers, we use the expected value + some variance
    const remainingSystems = total_systems - colonized;
    const attempts = Math.min(colonized, remainingSystems);

    // Simulate new colonies using binomial approximation
    let newColonies = 0;
    if (attempts < 1000) {
      // For small numbers, simulate each attempt
      for (let i = 0; i < attempts; i++) {
        if (Math.random() < successProb) {
          newColonies++;
        }
      }
    } else {
      // For large numbers, use normal approximation to binomial
      const mean = attempts * successProb;
      const stdDev = Math.sqrt(attempts * successProb * (1 - successProb));
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      newColonies = Math.round(mean + z * stdDev);
      newColonies = Math.max(0, newColonies);
    }

    // Cap new colonies at remaining systems
    newColonies = Math.min(newColonies, remainingSystems);
    colonized += newColonies;

    // Early termination if colonization is complete
    if (percentColonized >= 100) {
      break;
    }
  }

  return percentages;
}

export function runSimulation(params: SimulationParams): SimulationDataPoint[] {
  const { years_per_round, n_simulations, max_rounds } = params;

  // Run multiple simulations
  const allResults: number[][] = [];

  for (let sim = 0; sim < n_simulations; sim++) {
    allResults.push(runSingleSimulation(params));
  }

  // Find the maximum length (some simulations may end early)
  const maxLength = Math.max(...allResults.map(r => r.length));

  // Average the results at each time point
  const averagedData: SimulationDataPoint[] = [];

  for (let i = 0; i < maxLength; i++) {
    const year = i * years_per_round;
    let sum = 0;
    let count = 0;

    for (const result of allResults) {
      if (i < result.length) {
        sum += result[i];
        count++;
      } else {
        // If simulation ended early, use the last value (100%)
        sum += result[result.length - 1];
        count++;
      }
    }

    averagedData.push({
      year,
      percentColonized: sum / count,
    });

    // Stop adding data points once we've reached 100% colonization
    if (sum / count >= 99.99) {
      break;
    }
  }

  return averagedData;
}

// Run simulation in chunks to avoid blocking UI
export async function runSimulationAsync(
  params: SimulationParams,
  onProgress?: (progress: number) => void
): Promise<SimulationDataPoint[]> {
  const { years_per_round, n_simulations, max_rounds } = params;
  const chunkSize = 50;
  const allResults: number[][] = [];

  for (let i = 0; i < n_simulations; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, n_simulations);

    for (let sim = i; sim < chunkEnd; sim++) {
      allResults.push(runSingleSimulation(params));
    }

    if (onProgress) {
      onProgress((chunkEnd / n_simulations) * 100);
    }

    // Yield to UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Find the maximum length
  const maxLength = Math.max(...allResults.map(r => r.length));

  // Average the results
  const averagedData: SimulationDataPoint[] = [];

  for (let i = 0; i < maxLength; i++) {
    const year = i * years_per_round;
    let sum = 0;
    let count = 0;

    for (const result of allResults) {
      if (i < result.length) {
        sum += result[i];
        count++;
      } else {
        sum += result[result.length - 1];
        count++;
      }
    }

    averagedData.push({
      year,
      percentColonized: sum / count,
    });

    if (sum / count >= 99.99) {
      break;
    }
  }

  return averagedData;
}
