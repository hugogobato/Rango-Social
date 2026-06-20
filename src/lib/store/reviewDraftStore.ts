import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TargetDestination } from '../../domain/models'

interface ReviewDraftState {
  restaurantId: string
  visitDate: string
  partySize: number
  totalSpent: number | undefined
  overallScore: number
  comment: string
  companions: string[]
  targetDestinations: TargetDestination[]
  metrics: Record<string, number>
  updateDraft: (fields: Partial<Omit<ReviewDraftState, 'updateDraft' | 'resetDraft'>>) => void
  resetDraft: () => void
}

/** Today's date (yyyy-mm-dd), evaluated fresh each call. */
const today = () => new Date().toISOString().split('T')[0]

const initialDraft = {
  restaurantId: '',
  visitDate: today(),
  partySize: 1,
  totalSpent: undefined,
  overallScore: 3,
  comment: '',
  companions: [] as string[],
  targetDestinations: [{ type: 'profile' as const, id: 'u_me' }],
  metrics: {} as Record<string, number>,
}

export const useReviewDraftStore = create<ReviewDraftState>()(
  persist(
    (set) => ({
      ...initialDraft,
      updateDraft: (fields) => set((state) => ({ ...state, ...fields })),
      resetDraft: () => set({ ...initialDraft, visitDate: today() }),
    }),
    {
      name: 'review-draft-storage',
      // Never persist the visit date — otherwise the field freezes at whatever
      // "today" was the first time the draft was saved and never advances. We
      // whitelist the in-progress fields and always re-seed visitDate with the
      // real current date on rehydration.
      partialize: (s) => ({
        restaurantId: s.restaurantId,
        partySize: s.partySize,
        totalSpent: s.totalSpent,
        overallScore: s.overallScore,
        comment: s.comment,
        companions: s.companions,
        targetDestinations: s.targetDestinations,
        metrics: s.metrics,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ReviewDraftState>),
        visitDate: today(),
      }),
    }
  )
)
