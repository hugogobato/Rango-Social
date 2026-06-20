import { describe, it, expect, beforeEach } from 'vitest'
import { useReviewDraftStore } from './reviewDraftStore'

const todayStr = () => new Date().toISOString().split('T')[0]

describe('reviewDraftStore', () => {
  beforeEach(() => {
    useReviewDraftStore.getState().resetDraft()
  })

  it('defaults visitDate to today', () => {
    expect(useReviewDraftStore.getState().visitDate).toBe(todayStr())
  })

  it('does not persist visitDate (so it never freezes on a stale day)', () => {
    // Simulate the field having drifted to an old day during the session…
    useReviewDraftStore.getState().updateDraft({ visitDate: '2000-01-01' })
    // …the persisted snapshot must omit it, leaving only in-progress fields.
    const persisted = JSON.parse(
      localStorage.getItem('review-draft-storage') ?? '{}'
    )
    expect(persisted.state).toBeDefined()
    expect(persisted.state.visitDate).toBeUndefined()
  })

  it('resetDraft re-seeds visitDate with the current date', () => {
    useReviewDraftStore.getState().updateDraft({ visitDate: '1999-12-31' })
    useReviewDraftStore.getState().resetDraft()
    expect(useReviewDraftStore.getState().visitDate).toBe(todayStr())
  })
})
