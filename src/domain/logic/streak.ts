/**
 * Recomputes the user's current review streak from a list of visit dates (format YYYY-MM-DD).
 * Streak is count of consecutive days ending today or yesterday.
 */
export function calculateStreak(
  visitDates: string[],
  todayStr?: string
): number {
  if (visitDates.length === 0) return 0

  // Deduplicate and sort dates in descending order
  const sortedUniqueDates = Array.from(new Set(visitDates)).sort().reverse()

  // Parse YYYY-MM-DD local dates
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Anchor to today or yesterday in local timezone
  const anchorDate = todayStr ? parseLocalDate(todayStr) : new Date()
  const todayString = formatLocalDate(anchorDate)

  const yesterdayDate = new Date(anchorDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayString = formatLocalDate(yesterdayDate)

  let anchorIndex = sortedUniqueDates.indexOf(todayString)
  if (anchorIndex === -1) {
    anchorIndex = sortedUniqueDates.indexOf(yesterdayString)
  }

  // If neither today nor yesterday has a visit, streak is broken (0)
  if (anchorIndex === -1) {
    return 0
  }

  let streak = 1
  let currentCursor = parseLocalDate(sortedUniqueDates[anchorIndex])

  // Count backwards day-by-day
  for (let i = anchorIndex + 1; i < sortedUniqueDates.length; i++) {
    const prevDate = parseLocalDate(sortedUniqueDates[i])

    // Calculate difference in days (account for daylight savings variations)
    const diffTime = Math.abs(currentCursor.getTime() - prevDate.getTime())
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      streak++
      currentCursor = prevDate
    } else if (diffDays > 1) {
      break // Streak broken in the past
    }
  }

  return streak
}
