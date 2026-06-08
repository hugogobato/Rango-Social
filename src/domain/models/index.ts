export enum InfluencerTier {
  NANO = 'Cria Verificado',
  MICRO = 'Influencer de Bairro',
  MACRO = 'Chef de Conteúdo',
  MEGA = 'Lenda do Rango',
}

export enum SlangLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum RestaurantCategory {
  PODRAO = 'PODRAO',
  JAPONES = 'JAPONES',
  ITALIANO = 'ITALIANO',
  PIZZARIA = 'PIZZARIA',
  HAMBURGERIA = 'HAMBURGERIA',
  VEGANO = 'VEGANO',
  CHURRASCARIA = 'CHURRASCARIA',
  CAFETERIA = 'CAFETERIA',
  BAR = 'BAR',
  DOCERIA = 'DOCERIA',
  BRASILEIRO = 'BRASILEIRO',
  CHINESE = 'CHINESE',
  MEXICANO = 'MEXICANO',
  SAUDAVEL = 'SAUDAVEL',
  ARABE = 'ARABE',
}

export enum PriceRange {
  CHEAP = '$',
  MODERATE = '$$',
  EXPENSIVE = '$$$',
  LUXURY = '$$$$',
}

export enum MetricCategory {
  VALUE = 'Valor',
  EXPERIENCE = 'Experiência',
  LOGISTICS = 'Logística',
  ATMOSPHERE = 'Atmosfera',
  FOOD = 'Comida',
  DIETARY = 'Dietas',
}

export enum MetricId {
  PRICE = 'PRICE',
  SERVICE = 'SERVICE',
  LOCATION = 'LOCATION',
  VIBE = 'VIBE',
  AESTHETIC = 'AESTHETIC',
  PORTION = 'PORTION',
  TASTE = 'TASTE',
  COST_BENEFIT = 'COST_BENEFIT',
  VEGAN_OPTIONS = 'VEGAN_OPTIONS',
  GLUTEN_FREE = 'GLUTEN_FREE',
  WAIT_TIME = 'WAIT_TIME',
  CLEANLINESS = 'CLEANLINESS',
  NOISE_LEVEL = 'NOISE_LEVEL',
  PARKING = 'PARKING',
  ACCESSIBILITY = 'ACCESSIBILITY',
  DRINKS = 'DRINKS',
  DESSERTS = 'DESSERTS',
}

export enum VibeStatus {
  EMPTY = '🌵',
  BUSY = '🔥',
  QUEUE = '⏳',
  GOOD_MUSIC = '🎵',
  GOOD_SERVICE = '👏',
  BAD_SERVICE = '😤',
  NOISY = '📢',
  ROMANTIC = '💡',
  GROUP_FRIENDLY = '🍻',
  OVERPRICED = '💸',
}

export enum NotificationType {
  LIKE_REVIEW = 'LIKE_REVIEW',
  COMMENT_REVIEW = 'COMMENT_REVIEW',
  FOLLOW = 'FOLLOW',
  GROUP_INVITE = 'GROUP_INVITE',
  LIST_COLLAB = 'LIST_COLLAB',
  LIST_SHARE = 'LIST_SHARE',
  MENTION = 'MENTION',
  STREAK_WARNING = 'STREAK_WARNING',
  BADGE_EARNED = 'BADGE_EARNED',
  TRENDING_RESTAURANT = 'TRENDING_RESTAURANT',
}

export enum GroupRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export enum BadgeRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export enum IllnessSymptom {
  INTOXICACAO = 'INTOXICACAO',
  DIARREIA = 'DIARREIA',
  VOMITO = 'VOMITO',
  MAL_ESTAR = 'MAL_ESTAR',
  OUTRO = 'OUTRO',
}

export interface UserPreferences {
  defaultCity: string | null
  notifyLikes: boolean
  notifyComments: boolean
  notifyGroupActivity: boolean
  darkMode: boolean
  slangLevel: SlangLevel
}

export interface User {
  id: string
  username: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  coverUrl: string | null
  followerCount: number
  followingCount: number
  reviewCount: number
  isVerified: boolean
  influencerTier: InfluencerTier | null
  badges: Badge[]
  currentStreak: number
  longestStreak: number
  preferences: UserPreferences
  cpf?: string
  cpfValid?: boolean
  createdAt: string
}

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface Address {
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string | null
  fullFormatted: string
}

export interface OpeningHour {
  dayOfWeek: number // 1 = Monday, 7 = Sunday
  opensAt: string // "HH:MM"
  closesAt: string // "HH:MM"
}

export interface Restaurant {
  id: string
  name: string
  description: string | null
  categories: RestaurantCategory[]
  priceRange: PriceRange
  address: Address
  coordinates: GeoPoint | null
  phone: string | null
  website: string | null
  openingHours: OpeningHour[] | null
  photos: string[]
  menuPhotos: string[]
  averageOverallScore: number | null
  averageMetrics: Record<MetricId, number>
  reviewCount: number
  vibeCheckCount: number
  isOpenNow: boolean | null
  illnessReports90d: number
  illnessWarning: boolean
  eloByCuisine: Record<string, number>
  createdAt: string
}

export interface Comment {
  id: string
  reviewId: string
  userId: string
  user?: User
  text: string
  parentId: string | null
  likes: number
  isLikedByMe: boolean
  createdAt: string
}

export interface TargetDestination {
  type: 'profile' | 'group'
  id: string
}

export interface Review {
  id: string
  userId: string
  user?: User
  restaurantId: string
  restaurant?: Restaurant
  overallScore: number | null // 1-5, null = Só colei lá
  metrics: Record<MetricId, number>
  comment: string | null
  photos: string[]
  targetDestinations: TargetDestination[]
  receiptPhoto: string | null
  totalSpent?: number
  partySize?: number
  visitDate: string // YYYY-MM-DD
  companions: string[] | null // user IDs
  likes: number
  comments: Comment[]
  isLikedByMe: boolean
  createdAt: string
}

export interface VibeCheck {
  id: string
  userId: string
  user?: User
  restaurantId: string
  restaurant?: Restaurant
  status: VibeStatus
  note: string | null // max 100 chars
  photo: string | null
  expiresAt: string
  createdAt: string
}

export interface Notification {
  id: string
  type: NotificationType
  actor?: User
  targetReview?: Review
  targetRestaurant?: Restaurant
  targetGroup?: Group
  targetList?: CustomList
  message: string
  isRead: boolean
  createdAt: string
}

export interface GroupMember {
  userId: string
  user?: User
  role: GroupRole
  joinedAt: string
}

export interface RestaurantRanking {
  restaurantId: string
  restaurant: Restaurant | null
  score: number
  reviewCount: number
  position: number
}

export interface UserRanking {
  userId: string
  user: User | null
  reviewCount: number
  likesReceived: number
  position: number
}

export interface GroupRanking {
  topRestaurants: RestaurantRanking[]
  topReviewers: UserRanking[]
  lastUpdated: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  adminId: string
  admins: string[]
  isOpen: boolean
  members: GroupMember[]
  memberCount: number
  mandatoryMetrics: MetricId[]
  groupRankings: GroupRanking | null
  createdAt: string
}

export interface ListItem {
  restaurantId: string
  restaurant: Restaurant | null
  addedBy: string
  note: string | null
  priority: number // 1-3
  addedAt: string
}

export interface CustomList {
  id: string
  ownerId: string
  name: string
  description: string | null
  iconUrl: string | null
  coverColor: string | null
  isPublic: boolean
  isWishlist: boolean
  collaborators: string[]
  sharedWith: string[]
  themes: RestaurantCategory[]
  restaurants: ListItem[]
  followerCount: number
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  rarity: BadgeRarity
  earnedAt: string | null
}

export interface UserStats {
  totalReviews: number
  totalPhotos: number
  totalCitiesVisited: number
  totalCategoriesTried: number
  favoriteCategory: RestaurantCategory | null
  averageScoreGiven: number
  longestStreak: number
  currentStreak: number
  totalLikesReceived: number
  rankingInCity: number | null
}

export interface PollOption {
  id: string
  restaurantId: string | null
  text: string
  votes: string[] // user IDs
  voteCount: number
}

export interface Poll {
  id: string
  groupId: string
  createdBy: string
  question: string
  options: PollOption[]
  expiresAt: string
  isMultipleChoice: boolean
  createdAt: string
}

// ==========================================
// NEW FEATURE MODELS
// ==========================================

export interface Story {
  id: string
  userId: string
  user?: User
  restaurantId?: string
  restaurant?: Restaurant
  photoUrl: string
  caption?: string
  viewers: string[] // user IDs
  expiresAt: string
  createdAt: string
}

export interface IllnessReport {
  id: string
  restaurantId: string
  reporterUserId: string // internal only, never exposed in client query results
  symptom: IllnessSymptom
  note?: string
  mealDate: string // YYYY-MM-DD
  createdAt: string
}

/**
 * The only illness shape ever returned to clients: the reporter's identity is
 * stripped so reports can never be traced back to a user (anti-defamation, §1.6).
 */
export type PublicIllnessReport = Omit<IllnessReport, 'reporterUserId'>

export interface DuelQuestion {
  aspect: MetricId
  prompt: string
  chosenId: string // chosen restaurantId
}

export interface RestaurantDuel {
  id: string
  userId: string
  cuisine: RestaurantCategory
  aId: string // restaurant A
  bId: string // restaurant B
  questions: DuelQuestion[]
  winnerId: string // overall winner restaurantId
  createdAt: string
}

export interface CuisineElo {
  restaurantId: string
  cuisine: RestaurantCategory
  rating: number // default 1000
  duels: number // count of duels participated
}

export interface AiUserProfile {
  userId: string
  markdown: string
  updatedAt: string
  version: number
}

export interface AiChatMessage {
  id: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
