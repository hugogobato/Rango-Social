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
import { isSupabaseConfigured } from './supabase/client'
import { supabaseDb } from './supabase/repositories'

// Route to Supabase only when explicitly opted-in AND the client env vars exist
// (URL + anon key). Anything else — including tests — falls back to the in-memory
// mock so the app and the test suite never require a live backend.
const useSupabase =
  import.meta.env.VITE_DATA_SOURCE === 'supabase' && isSupabaseConfigured

const mockDb = {
  users: new MockUserRepository(),
  restaurants: new MockRestaurantRepository(),
  reviews: new MockReviewRepository(),
  vibeChecks: new MockVibeCheckRepository(),
  groups: new MockGroupRepository(),
  lists: new MockListRepository(),
  notifications: new MockNotificationRepository(),
  session: new MockSessionRepository(),
  stories: new MockStoryRepository(),
  illness: new MockIllnessRepository(),
  duels: new MockDuelRepository(),
  ai: new MockAiRepository(),
}

export const db = useSupabase ? supabaseDb : mockDb

export const userRepository: UserRepository = db.users
export const restaurantRepository: RestaurantRepository = db.restaurants
export const reviewRepository: ReviewRepository = db.reviews
export const vibeCheckRepository: VibeCheckRepository = db.vibeChecks
export const groupRepository: GroupRepository = db.groups
export const listRepository: ListRepository = db.lists
export const notificationRepository: NotificationRepository = db.notifications
export const sessionRepository: SessionRepository = db.session
export const storyRepository: StoryRepository = db.stories
export const illnessRepository: IllnessRepository = db.illness
export const duelRepository: DuelRepository = db.duels
export const aiRepository: AiRepository = db.ai
