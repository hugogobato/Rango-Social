import { describe, it, expect } from 'vitest'
import { MockIllnessRepository, MockRestaurantRepository } from './repositories'
import { IllnessSymptom } from '../../domain/models'

// Note: vitest isolates module state per test file, so the seeded singletons here
// don't leak into other suites.
describe('Illness repository — privacy & threshold (Phase 10 verify)', () => {
  const illness = new MockIllnessRepository()
  const restaurants = new MockRestaurantRepository()

  it('never returns reporterUserId in any query result', async () => {
    const reports = await illness.getIllnessReportsByRestaurant('r_sp_2')
    expect(reports.length).toBeGreaterThanOrEqual(3)
    for (const r of reports) {
      expect(r).not.toHaveProperty('reporterUserId')
    }
  })

  it('shows the public warning only at/above the threshold', async () => {
    const flagged = await restaurants.getRestaurantById('r_sp_2') // 3 seeded reports
    const below = await restaurants.getRestaurantById('r_sp_3') // 1 seeded report
    expect(flagged?.illnessReports90d).toBeGreaterThanOrEqual(3)
    expect(flagged?.illnessWarning).toBe(true)
    expect(below?.illnessWarning).toBe(false)
  })

  it('enforces one report per user per restaurant per 30 days', async () => {
    // r_sp_9 has no seeded reports → the current user may report exactly once.
    expect(await illness.checkUserReportLimit('r_sp_9', 'u_me')).toBe(true)

    await illness.postIllnessReport(
      'r_sp_9',
      IllnessSymptom.OUTRO,
      undefined,
      '2026-06-01'
    )

    expect(await illness.checkUserReportLimit('r_sp_9', 'u_me')).toBe(false)
    await expect(
      illness.postIllnessReport('r_sp_9', IllnessSymptom.OUTRO)
    ).rejects.toThrow('ALREADY_REPORTED')
  })
})
