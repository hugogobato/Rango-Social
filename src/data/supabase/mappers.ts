/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SlangLevel,
  GroupRole,
  type User,
  type Restaurant,
  type Review,
  type Comment,
  type VibeCheck,
  type Group,
  type GroupMember,
  type CustomList,
  type ListItem,
  type Notification,
  type Story,
  type PublicIllnessReport,
  type IllnessReport,
  type RestaurantDuel,
  type CuisineElo,
  type AiUserProfile,
  type AiChatMessage,
  type InfluencerTier,
  type RestaurantCategory,
  type PriceRange,
  type MetricId,
  type NotificationType,
  type VibeStatus,
  type IllnessSymptom,
} from '../../domain/models'

const DEFAULT_PREFS: User['preferences'] = {
  defaultCity: null,
  notifyLikes: true,
  notifyComments: true,
  notifyGroupActivity: true,
  darkMode: true,
  slangLevel: SlangLevel.MEDIUM,
}

// ---------- User ----------
export function mapUser(r: any): User {
  return {
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    bio: r.bio ?? null,
    avatarUrl: r.avatar_url ?? null,
    coverUrl: r.cover_url ?? null,
    followerCount: r.follower_count ?? 0,
    followingCount: r.following_count ?? 0,
    reviewCount: r.review_count ?? 0,
    isVerified: r.is_verified ?? false,
    influencerTier: (r.influencer_tier ?? null) as InfluencerTier | null,
    badges: r.badges ?? [],
    currentStreak: r.current_streak ?? 0,
    longestStreak: r.longest_streak ?? 0,
    preferences: { ...DEFAULT_PREFS, ...(r.preferences ?? {}) },
    cpf: r.cpf ?? undefined,
    cpfValid: r.cpf_valid ?? undefined,
    createdAt: r.created_at,
  }
}

export function userToRow(u: User) {
  return {
    id: u.id,
    username: u.username,
    display_name: u.displayName,
    bio: u.bio,
    avatar_url: u.avatarUrl,
    cover_url: u.coverUrl,
    follower_count: u.followerCount,
    following_count: u.followingCount,
    review_count: u.reviewCount,
    is_verified: u.isVerified,
    influencer_tier: u.influencerTier,
    badges: u.badges,
    current_streak: u.currentStreak,
    longest_streak: u.longestStreak,
    preferences: u.preferences,
    cpf: u.cpf ?? null,
    cpf_valid: u.cpfValid ?? null,
    created_at: u.createdAt,
  }
}

// ---------- Restaurant ----------
export function mapRestaurant(r: any): Restaurant {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    categories: (r.categories ?? []) as RestaurantCategory[],
    priceRange: r.price_range as PriceRange,
    address: r.address ?? {},
    coordinates: r.coordinates ?? null,
    phone: r.phone ?? null,
    website: r.website ?? null,
    openingHours: r.opening_hours ?? null,
    photos: r.photos ?? [],
    menuPhotos: r.menu_photos ?? [],
    averageOverallScore: r.average_overall_score ?? null,
    averageMetrics: (r.average_metrics ?? {}) as Record<MetricId, number>,
    reviewCount: r.review_count ?? 0,
    vibeCheckCount: r.vibe_check_count ?? 0,
    isOpenNow: r.is_open_now ?? null,
    illnessReports90d: r.illness_reports_90d ?? 0,
    illnessWarning: r.illness_warning ?? false,
    eloByCuisine: r.elo_by_cuisine ?? {},
    createdAt: r.created_at,
  }
}

export function restaurantToRow(r: Restaurant) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    categories: r.categories,
    price_range: r.priceRange,
    address: r.address,
    coordinates: r.coordinates,
    phone: r.phone,
    website: r.website,
    opening_hours: r.openingHours,
    photos: r.photos,
    menu_photos: r.menuPhotos,
    average_overall_score: r.averageOverallScore,
    average_metrics: r.averageMetrics,
    review_count: r.reviewCount,
    vibe_check_count: r.vibeCheckCount,
    is_open_now: r.isOpenNow,
    illness_reports_90d: r.illnessReports90d,
    illness_warning: r.illnessWarning,
    elo_by_cuisine: r.eloByCuisine,
    created_at: r.createdAt,
  }
}

// ---------- Comment ----------
export function mapComment(r: any): Comment {
  return {
    id: r.id,
    reviewId: r.review_id,
    userId: r.user_id,
    user: r.author ? mapUser(r.author) : undefined,
    text: r.text,
    parentId: r.parent_id ?? null,
    likes: r.likes ?? 0,
    isLikedByMe: false,
    createdAt: r.created_at,
  }
}

// ---------- Review ----------
export function mapReview(r: any, likedReviewIds?: Set<string>): Review {
  return {
    id: r.id,
    userId: r.user_id,
    user: r.author ? mapUser(r.author) : undefined,
    restaurantId: r.restaurant_id,
    restaurant: r.restaurant ? mapRestaurant(r.restaurant) : undefined,
    overallScore: r.overall_score ?? null,
    metrics: (r.metrics ?? {}) as Record<MetricId, number>,
    comment: r.comment ?? null,
    photos: r.photos ?? [],
    targetDestinations: r.target_destinations ?? [],
    receiptPhoto: r.receipt_photo ?? null,
    totalSpent: r.total_spent ?? undefined,
    partySize: r.party_size ?? undefined,
    visitDate: r.visit_date,
    companions: r.companions ?? null,
    likes: r.likes ?? 0,
    comments: Array.isArray(r.comments)
      ? r.comments.map(mapComment).sort((a: Comment, b: Comment) =>
          a.createdAt < b.createdAt ? -1 : 1
        )
      : [],
    isLikedByMe: likedReviewIds ? likedReviewIds.has(r.id) : false,
    createdAt: r.created_at,
  }
}

export function reviewInsertToRow(
  review: Omit<Review, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLikedByMe'>
) {
  return {
    user_id: review.userId,
    restaurant_id: review.restaurantId,
    overall_score: review.overallScore,
    metrics: review.metrics,
    comment: review.comment,
    photos: review.photos,
    target_destinations: review.targetDestinations,
    receipt_photo: review.receiptPhoto,
    total_spent: review.totalSpent ?? null,
    party_size: review.partySize ?? null,
    visit_date: review.visitDate,
    companions: review.companions,
  }
}

// ---------- VibeCheck ----------
export function mapVibeCheck(r: any): VibeCheck {
  return {
    id: r.id,
    userId: r.user_id,
    user: r.author ? mapUser(r.author) : undefined,
    restaurantId: r.restaurant_id,
    restaurant: r.restaurant ? mapRestaurant(r.restaurant) : undefined,
    status: r.status as VibeStatus,
    note: r.note ?? null,
    photo: r.photo ?? null,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }
}

// ---------- Group ----------
export function mapGroupMember(r: any): GroupMember {
  return {
    userId: r.user_id,
    user: r.member ? mapUser(r.member) : undefined,
    role: (r.role ?? 'MEMBER') as GroupRole,
    joinedAt: r.joined_at,
  }
}

export function mapGroup(r: any): Group {
  const members: GroupMember[] = Array.isArray(r.group_members)
    ? r.group_members.map(mapGroupMember)
    : []
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    coverUrl: r.cover_url ?? null,
    adminId: r.admin_id,
    admins: r.admins ?? [],
    isOpen: r.is_open ?? true,
    members,
    memberCount: members.length || (r.member_count ?? 0),
    mandatoryMetrics: (r.mandatory_metrics ?? []) as MetricId[],
    groupRankings: null,
    createdAt: r.created_at,
  }
}

// ---------- List ----------
export function mapListItem(r: any): ListItem {
  return {
    restaurantId: r.restaurant_id,
    restaurant: r.restaurant ? mapRestaurant(r.restaurant) : null,
    addedBy: r.added_by,
    note: r.note ?? null,
    priority: r.priority ?? 1,
    addedAt: r.added_at,
  }
}

export function mapList(r: any): CustomList {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    description: r.description ?? null,
    iconUrl: r.icon_url ?? null,
    coverColor: r.cover_color ?? null,
    isPublic: r.is_public ?? true,
    isWishlist: r.is_wishlist ?? false,
    collaborators: r.collaborators ?? [],
    sharedWith: r.shared_with ?? [],
    themes: (r.themes ?? []) as RestaurantCategory[],
    restaurants: Array.isArray(r.list_items) ? r.list_items.map(mapListItem) : [],
    followerCount: r.follower_count ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

// ---------- Notification ----------
export function mapNotification(r: any): Notification {
  return {
    id: r.id,
    type: r.type as NotificationType,
    actor: r.actor ? mapUser(r.actor) : undefined,
    targetReview: r.target_review ? mapReview(r.target_review) : undefined,
    targetRestaurant: r.target_restaurant ? mapRestaurant(r.target_restaurant) : undefined,
    targetGroup: r.target_group ? mapGroup(r.target_group) : undefined,
    targetList: r.target_list ? mapList(r.target_list) : undefined,
    message: r.message,
    isRead: r.is_read ?? false,
    createdAt: r.created_at,
  }
}

// ---------- Story ----------
export function mapStory(r: any): Story {
  return {
    id: r.id,
    userId: r.user_id,
    user: r.author ? mapUser(r.author) : undefined,
    restaurantId: r.restaurant_id ?? undefined,
    restaurant: r.restaurant ? mapRestaurant(r.restaurant) : undefined,
    photoUrl: r.photo_url,
    caption: r.caption ?? undefined,
    viewers: r.viewers ?? [],
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }
}

// ---------- Illness ----------
export function mapPublicIllness(r: any): PublicIllnessReport {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    symptom: r.symptom as IllnessSymptom,
    note: r.note ?? undefined,
    mealDate: r.meal_date,
    createdAt: r.created_at,
  }
}

export function mapIllness(r: any): IllnessReport {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    reporterUserId: r.reporter_user_id,
    symptom: r.symptom as IllnessSymptom,
    note: r.note ?? undefined,
    mealDate: r.meal_date,
    createdAt: r.created_at,
  }
}

// ---------- Duel / ELO ----------
export function mapDuel(r: any): RestaurantDuel {
  return {
    id: r.id,
    userId: r.user_id,
    cuisine: r.cuisine as RestaurantCategory,
    aId: r.a_id,
    bId: r.b_id,
    questions: r.questions ?? [],
    winnerId: r.winner_id,
    createdAt: r.created_at,
  }
}

export function mapElo(r: any): CuisineElo {
  return {
    restaurantId: r.restaurant_id,
    cuisine: r.cuisine as RestaurantCategory,
    rating: Number(r.rating ?? 1000),
    duels: r.duels ?? 0,
  }
}

// ---------- AI ----------
export function mapAiProfile(r: any): AiUserProfile {
  return {
    userId: r.user_id,
    markdown: r.markdown ?? '',
    version: r.version ?? 1,
    updatedAt: r.updated_at,
  }
}

export function mapAiChat(r: any): AiChatMessage {
  return {
    id: r.id,
    userId: r.user_id,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
  }
}
