import { describe, it, expect } from 'vitest'
import {
  countReportsInWindow,
  hasIllnessWarning,
  summarizeIllness,
  ILLNESS_THRESHOLD,
} from './illness'

const NOW = new Date('2026-06-06T12:00:00.000Z')

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString()
}

describe('Illness aggregation', () => {
  describe('countReportsInWindow', () => {
    it('counts only reports within the 90-day window', () => {
      const reports = [
        { createdAt: daysAgo(1) },
        { createdAt: daysAgo(45) },
        { createdAt: daysAgo(89) },
        { createdAt: daysAgo(91) }, // outside window
        { createdAt: daysAgo(200) }, // outside window
      ]
      expect(countReportsInWindow(reports, NOW)).toBe(3)
    })

    it('returns 0 for no reports', () => {
      expect(countReportsInWindow([], NOW)).toBe(0)
    })
  })

  describe('hasIllnessWarning', () => {
    it('warns at or above the threshold', () => {
      expect(hasIllnessWarning(ILLNESS_THRESHOLD)).toBe(true)
      expect(hasIllnessWarning(ILLNESS_THRESHOLD + 5)).toBe(true)
    })

    it('does not warn below the threshold', () => {
      expect(hasIllnessWarning(ILLNESS_THRESHOLD - 1)).toBe(false)
      expect(hasIllnessWarning(0)).toBe(false)
    })
  })

  describe('summarizeIllness', () => {
    it('flags a warning only once enough recent reports exist', () => {
      const belowThreshold = [{ createdAt: daysAgo(1) }, { createdAt: daysAgo(2) }]
      expect(summarizeIllness(belowThreshold, NOW)).toEqual({
        count90d: 2,
        warning: false,
      })

      const atThreshold = [
        { createdAt: daysAgo(1) },
        { createdAt: daysAgo(2) },
        { createdAt: daysAgo(3) },
      ]
      expect(summarizeIllness(atThreshold, NOW)).toEqual({
        count90d: 3,
        warning: true,
      })
    })

    it('ignores stale reports when deciding the warning', () => {
      const stale = [
        { createdAt: daysAgo(100) },
        { createdAt: daysAgo(120) },
        { createdAt: daysAgo(140) },
        { createdAt: daysAgo(1) },
      ]
      expect(summarizeIllness(stale, NOW)).toEqual({ count90d: 1, warning: false })
    })
  })
})
