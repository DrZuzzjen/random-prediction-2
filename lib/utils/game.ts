export function calculateScore(userNumbers: number[], randomNumbers: number[]) {
  const userSet = new Set(userNumbers);
  const randomSet = new Set(randomNumbers);
  let matches = 0;

  userSet.forEach((num) => {
    if (randomSet.has(num)) {
      matches += 1;
    }
  });

  return matches;
}

export function calculateMatches(userNumbers: number[], randomNumbers: number[]) {
  const randomSet = new Set(randomNumbers);
  return userNumbers.filter((num) => randomSet.has(num));
}

export function toDisplayList(numbers: number[]) {
  return numbers.map((num) => num.toString().padStart(2, "0")).join(" · ");
}

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidPredictionSet(numbers: number[]) {
  if (numbers.length !== 10) {
    return false;
  }

  const hasInvalidRange = numbers.some((num) => num < 1 || num > 99);
  if (hasInvalidRange) {
    return false;
  }

  const unique = new Set(numbers);
  return unique.size === numbers.length;
}
