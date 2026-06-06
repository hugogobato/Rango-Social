import { type MetricId } from '../models'

/**
 * Combines lists of mandatory metrics (e.g., from multiple groups a user belongs to)
 * and returns a deduplicated union of MetricIds that must be collected during the review flow.
 */
export function getUnionOfMetrics(listsOfMetrics: MetricId[][]): MetricId[] {
  const unionSet = new Set<MetricId>()
  for (const list of listsOfMetrics) {
    for (const metric of list) {
      unionSet.add(metric)
    }
  }
  return Array.from(unionSet)
}
