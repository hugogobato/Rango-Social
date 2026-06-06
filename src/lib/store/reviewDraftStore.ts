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

const initialDraft = {
  restaurantId: '',
  visitDate: new Date().toISOString().split('T')[0],
  partySize: 1,
  totalSpent: undefined,
  overallScore: 3,
  comment: '',
  companions: [],
  targetDestinations: [{ type: 'profile' as const, id: 'u_me' }],
  metrics: {},
}

export const useReviewDraftStore = create<ReviewDraftState>()(
  persist(
    (set) => ({
      ...initialDraft,
      updateDraft: (fields) => set((state) => ({ ...state, ...fields })),
      resetDraft: () => set(initialDraft),
    }),
    {
      name: 'review-draft-storage',
    }
  )
)
