/**
 * Computes new ELO ratings for two restaurants after a comparative head-to-head duel.
 * Uses standard K-factor of 32 and base 1000.
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  outcome: 'A_win' | 'B_win' | 'draw',
  kFactor = 32
): { ratingA: number; ratingB: number } {
  // Expected scores
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400))

  // Actual outcomes
  let actualA = 0.5
  if (outcome === 'A_win') actualA = 1
  if (outcome === 'B_win') actualA = 0

  const actualB = 1 - actualA

  // Compute new ratings (rounded to nearest integer)
  const newRatingA = Math.round(ratingA + kFactor * (actualA - expectedA))
  const newRatingB = Math.round(ratingB + kFactor * (actualB - expectedB))

  return {
    ratingA: newRatingA,
    ratingB: newRatingB,
  }
}
