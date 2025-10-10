import type { GameRun, NumberFrequency, ScoreDistribution } from "./types";

export type GlobalStats = {
  totalGames: number;
  avgScore: number;
  bestScore: number;
  totalPlayers: number;
  scoreDistribution: ScoreDistribution;
};

export type RangeBuckets = {
  small: number;
  medium: number;
  large: number;
};

export const PRIME_SET = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
  71, 73, 79, 83, 89, 97
]);

export const LUCKY_SEVENS = new Set([7, 17, 27, 37, 47, 57, 67, 77, 87, 97]);
export const UNLUCKY_THIRTEENS = new Set([13, 31]);
export const REPEATING_DIGITS = new Set([11, 22, 33, 44, 55, 66, 77, 88, 99]);

export function summariseGlobalStats(runs: GameRun[]): GlobalStats {
  if (runs.length === 0) {
    return {
      totalGames: 0,
      avgScore: 0,
      bestScore: 0,
      totalPlayers: 0,
      scoreDistribution: {}
    };
  }

  const scoreDistribution: ScoreDistribution = {};
  let bestScore = 0;
  let scoreSum = 0;
  const playerSet = new Set<string>();

  runs.forEach((run) => {
    scoreSum += run.score;
    bestScore = Math.max(bestScore, run.score);
    scoreDistribution[run.score] = (scoreDistribution[run.score] || 0) + 1;
    playerSet.add(run.email.toLowerCase());
  });

  return {
    totalGames: runs.length,
    avgScore: scoreSum / runs.length,
    bestScore,
    totalPlayers: playerSet.size,
    scoreDistribution
  };
}

export function buildFrequencies(runs: GameRun[]): {
  predictions: NumberFrequency;
  random: NumberFrequency;
} {
  const predictions: NumberFrequency = {};
  const random: NumberFrequency = {};

  runs.forEach((run) => {
    run.predictions.forEach((num) => {
      if (num >= 1 && num <= 99) {
        predictions[num] = (predictions[num] || 0) + 1;
      }
    });

    run.random_numbers.forEach((num) => {
      if (num >= 1 && num <= 99) {
        random[num] = (random[num] || 0) + 1;
      }
    });
  });

  return { predictions, random };
}

export function bucketizeFrequency(freq: NumberFrequency): RangeBuckets {
  return Object.entries(freq).reduce(
    (acc, [key, value]) => {
      const num = Number(key);
      if (num >= 1 && num <= 33) {
        acc.small += value;
      } else if (num >= 34 && num <= 66) {
        acc.medium += value;
      } else if (num >= 67 && num <= 99) {
        acc.large += value;
      }
      return acc;
    },
    { small: 0, medium: 0, large: 0 }
  );
}

export function calculateEvenOdd(freq: NumberFrequency) {
  return Object.entries(freq).reduce(
    (acc, [key, value]) => {
      const num = Number(key);
      if (num % 2 === 0) {
        acc.even += value;
      } else {
        acc.odd += value;
      }
      return acc;
    },
    { even: 0, odd: 0 }
  );
}

export function calculatePrimeUsage(freq: NumberFrequency) {
  return Object.entries(freq).reduce(
    (acc, [key, value]) => {
      const num = Number(key);
      if (PRIME_SET.has(num)) {
        acc.prime += value;
      } else if (num > 1) {
        acc.composite += value;
      }
      return acc;
    },
    { prime: 0, composite: 0 }
  );
}

export function calculateSpecialPatterns(freq: NumberFrequency) {
  return Object.entries(freq).reduce(
    (acc, [key, value]) => {
      const num = Number(key);
      if (LUCKY_SEVENS.has(num)) {
        acc.luckySevens += value;
      }
      if (UNLUCKY_THIRTEENS.has(num)) {
        acc.unluckyThirteens += value;
      }
      if (REPEATING_DIGITS.has(num)) {
        acc.repeatingDigits += value;
      }
      return acc;
    },
    {
      luckySevens: 0,
      unluckyThirteens: 0,
      repeatingDigits: 0
    }
  );
}

export function normaliseDistribution(freq: NumberFrequency) {
  const total = Object.values(freq).reduce((sum, n) => sum + n, 0);
  if (total === 0) {
    return { distribution: freq, total };
  }

  const distribution = Object.keys(freq).reduce((acc, key) => {
    acc[Number(key)] = freq[Number(key)] / total;
    return acc;
  }, {} as NumberFrequency);

  return { distribution, total };
}

export function sortFrequency(freq: NumberFrequency) {
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([number, count]) => ({ number: Number(number), count }));
}

export function computeOverlap(pred: NumberFrequency, rand: NumberFrequency) {
  const overlap = [] as Array<{
    number: number;
    predicted: number;
    drawn: number;
    overlap: number;
  }>;

  for (let num = 1; num <= 99; num += 1) {
    const predicted = pred[num] || 0;
    const drawn = rand[num] || 0;
    if (predicted > 0 && drawn > 0) {
      overlap.push({
        number: num,
        predicted,
        drawn,
        overlap: Math.min(predicted, drawn)
      });
    }
  }

  overlap.sort((a, b) => b.overlap - a.overlap);
  return overlap;
}

export function computeUserStats(runs: GameRun[]) {
  if (runs.length === 0) {
    return null;
  }

  const sorted = [...runs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const scoreTrend = sorted.slice(0, 10).map((run) => run.score).reverse();
  const bestScore = Math.max(...runs.map((run) => run.score));
  const avgScore = runs.reduce((sum, run) => sum + run.score, 0) / runs.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const gamesLastWeek = runs.filter(
    (run) => new Date(run.created_at).getTime() > weekAgo
  ).length;
  const favoriteNumbers = sortFrequency(
    runs.reduce((acc, run) => {
      run.predictions.forEach((num) => {
        acc[num] = (acc[num] || 0) + 1;
      });
      return acc;
    }, {} as NumberFrequency)
  ).slice(0, 10);

  return {
    totalGames: runs.length,
    bestScore,
    avgScore,
    latestScore: sorted[0]?.score ?? 0,
    firstGame: sorted[sorted.length - 1]?.created_at ?? null,
    gamesLastWeek,
    scoreTrend,
    favoriteNumbers
  };
}
