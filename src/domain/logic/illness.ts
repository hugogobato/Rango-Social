/**
 * Anonymous illness-report aggregation (§1.6).
 *
 * Public exposure is intentionally coarse: a restaurant only surfaces a warning once
 * it has accumulated at least {@link ILLNESS_THRESHOLD} reports inside a rolling
 * {@link ILLNESS_WINDOW_DAYS}-day window. Below that, nothing is shown — this prevents
 * a single report from being weaponized against a restaurant.
 */

export const ILLNESS_THRESHOLD = 3
export const ILLNESS_WINDOW_DAYS = 90

interface DatedReport {
  createdAt: string // ISO timestamp
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Number of reports whose createdAt falls within the rolling window ending at `now`. */
export function countReportsInWindow(
  reports: DatedReport[],
  now: Date = new Date()
): number {
  const cutoff = new Date(now.getTime() - ILLNESS_WINDOW_DAYS * MS_PER_DAY).toISOString()
  return reports.filter((r) => r.createdAt >= cutoff).length
}

/** Whether a recent-report count is high enough to surface a public warning. */
export function hasIllnessWarning(recentCount: number): boolean {
  return recentCount >= ILLNESS_THRESHOLD
}

export interface IllnessSummary {
  count90d: number
  warning: boolean
}

/** Convenience: window count + warning flag in one pass. */
export function summarizeIllness(
  reports: DatedReport[],
  now: Date = new Date()
): IllnessSummary {
  const count90d = countReportsInWindow(reports, now)
  return { count90d, warning: hasIllnessWarning(count90d) }
}
