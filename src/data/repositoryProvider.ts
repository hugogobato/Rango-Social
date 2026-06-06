import {
  type UserRepository,
  type RestaurantRepository,
  type ReviewRepository,
  type VibeCheckRepository,
  type GroupRepository,
  type ListRepository,
  type NotificationRepository,
  type SessionRepository,
  type StoryRepository,
  type IllnessRepository,
  type DuelRepository,
  type AiRepository,
} from '../domain/repositories'

import {
  MockUserRepository,
  MockRestaurantRepository,
  MockReviewRepository,
  MockVibeCheckRepository,
  MockGroupRepository,
  MockListRepository,
  MockNotificationRepository,
  MockSessionRepository,
  MockStoryRepository,
  MockIllnessRepository,
  MockDuelRepository,
  MockAiRepository,
} from './mock/repositories'

// We will default to Mock and wire Supabase dynamically in Phase 12
// const _isSupabase =
//   (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATA_SOURCE === 'supabase') ||
//   (typeof process !== 'undefined' && process.env?.VITE_DATA_SOURCE === 'supabase')

export const userRepository: UserRepository = new MockUserRepository()
export const restaurantRepository: RestaurantRepository =
  new MockRestaurantRepository()
export const reviewRepository: ReviewRepository = new MockReviewRepository()
export const vibeCheckRepository: VibeCheckRepository =
  new MockVibeCheckRepository()
export const groupRepository: GroupRepository = new MockGroupRepository()
export const listRepository: ListRepository = new MockListRepository()
export const notificationRepository: NotificationRepository =
  new MockNotificationRepository()
export const sessionRepository: SessionRepository = new MockSessionRepository()
export const storyRepository: StoryRepository = new MockStoryRepository()
export const illnessRepository: IllnessRepository = new MockIllnessRepository()
export const duelRepository: DuelRepository = new MockDuelRepository()
export const aiRepository: AiRepository = new MockAiRepository()

export const db = {
  users: userRepository,
  restaurants: restaurantRepository,
  reviews: reviewRepository,
  vibeChecks: vibeCheckRepository,
  groups: groupRepository,
  lists: listRepository,
  notifications: notificationRepository,
  session: sessionRepository,
  stories: storyRepository,
  illness: illnessRepository,
  duels: duelRepository,
  ai: aiRepository,
}
