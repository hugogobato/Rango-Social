import { describe, it, expect } from 'vitest'
import { MockDuelRepository } from './repositories'
import { RestaurantCategory } from '../../domain/models'

// vitest isolates module state per test file.
describe('Duel repository — ELO updates (Phase 11 verify)', () => {
  const duels = new MockDuelRepository()

  it('updates both restaurants and the leaderboard reflects the result', async () => {
    // Seeds the cuisine's restaurants at the 1000 base on first read.
    const before = await duels.getEloLeaderboard(RestaurantCategory.PODRAO)
    expect(before.length).toBeGreaterThanOrEqual(2)
    expect(before.every((e) => e.rating === 1000 && e.duels === 0)).toBe(true)

    const winner = before[0].restaurantId
    const loser = before[1].restaurantId

    await duels.postDuel({
      userId: 'u_me',
      cuisine: RestaurantCategory.PODRAO,
      aId: winner,
      bId: loser,
      questions: [],
      winnerId: winner,
    })

    const after = await duels.getEloLeaderboard(RestaurantCategory.PODRAO)
    const winnerElo = after.find((e) => e.restaurantId === winner)!
    const loserElo = after.find((e) => e.restaurantId === loser)!

    // Winner climbs, loser drops, both counted as having duelled once.
    expect(winnerElo.rating).toBeGreaterThan(1000)
    expect(loserElo.rating).toBeLessThan(1000)
    expect(winnerElo.duels).toBe(1)
    expect(loserElo.duels).toBe(1)

    // Leaderboard is sorted by rating desc → winner ranks above loser.
    const winnerRank = after.findIndex((e) => e.restaurantId === winner)
    const loserRank = after.findIndex((e) => e.restaurantId === loser)
    expect(winnerRank).toBeLessThan(loserRank)
  })
})
