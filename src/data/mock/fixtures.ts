import {
  InfluencerTier,
  RestaurantCategory,
  PriceRange,
  MetricId,
  VibeStatus,
  NotificationType,
  GroupRole,
  BadgeRarity,
  SlangLevel,
} from '../../domain/models'

import type {
  User,
  UserPreferences,
  Restaurant,
  Review,
  Comment,
  Group,
  CustomList,
  VibeCheck,
  Notification,
} from '../../domain/models'

// Simple LCG / Mulberry32 Seeded PRNG for determinism
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max?: number): number {
    if (max === undefined) {
      max = min
      min = 0
    }
    return Math.floor(this.next() * (max - min)) + min
  }

  nextFloat(): number {
    return this.next()
  }

  nextBoolean(): boolean {
    return this.next() < 0.5
  }

  randomElement<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)]
  }

  shuffle<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1)
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
    }
    return arr
  }
}

// Fixed reference time keeps the generated feed deterministic (today is 2026-05-06).
export const now = '2026-05-06T20:00:00Z'
const nowObj = new Date(now)
const random = new SeededRandom(42)

// ---------- Helper Functions ----------

function subDays(days: number): string {
  return new Date(nowObj.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

function subHours(hours: number): string {
  return new Date(nowObj.getTime() - hours * 60 * 60 * 1000).toISOString()
}

function subMinutes(minutes: number): string {
  return new Date(nowObj.getTime() - minutes * 60 * 1000).toISOString()
}

function addHours(baseIso: string, hours: number): string {
  return new Date(
    new Date(baseIso).getTime() + hours * 60 * 60 * 1000
  ).toISOString()
}

function formatDate(date: Date): string {
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const restaurantPhoto = (id: string, idx: number = 0): string =>
  `https://picsum.photos/seed/${id}_${idx}/900/600`

const avatar = (handle: string): string =>
  `https://api.dicebear.com/9.x/avataaars/png?seed=${handle}&backgroundColor=ff6b35,7b61ff,00d9c0`

const cover = (seed: string): string =>
  `https://picsum.photos/seed/${seed}_cover/1200/400`

function getCategoryLabel(cat: RestaurantCategory): string {
  switch (cat) {
    case RestaurantCategory.PODRAO:
      return 'podrão'
    case RestaurantCategory.JAPONES:
      return 'japonês'
    case RestaurantCategory.ITALIANO:
      return 'italiano'
    case RestaurantCategory.PIZZARIA:
      return 'pizzaria'
    case RestaurantCategory.HAMBURGERIA:
      return 'hamburgueria'
    case RestaurantCategory.VEGANO:
      return 'vegano'
    case RestaurantCategory.CHURRASCARIA:
      return 'churrascaria'
    case RestaurantCategory.CAFETERIA:
      return 'cafeteria'
    case RestaurantCategory.BAR:
      return 'bar'
    case RestaurantCategory.DOCERIA:
      return 'doceria'
    case RestaurantCategory.BRASILEIRO:
      return 'brasileiro'
    case RestaurantCategory.CHINESE:
      return 'chinês'
    case RestaurantCategory.MEXICANO:
      return 'mexicano'
    case RestaurantCategory.SAUDAVEL:
      return 'saudável'
    case RestaurantCategory.ARABE:
      return 'árabe'
    default:
      return String(cat).toLowerCase()
  }
}

const defaultPreferences = (defaultCity: string | null): UserPreferences => ({
  defaultCity,
  notifyLikes: true,
  notifyComments: true,
  notifyGroupActivity: true,
  darkMode: false,
  slangLevel: SlangLevel.MEDIUM,
})

// ---------- Users ----------

export const currentUser: User = {
  id: 'u_me',
  username: '@hugo',
  displayName: 'Hugo',
  bio: 'Cria de RP, sempre atrás de um rango bom 🌶️',
  avatarUrl: avatar('hugo_me'),
  coverUrl: cover('hugo_me'),
  followerCount: 47,
  followingCount: 132,
  reviewCount: 12,
  isVerified: false,
  influencerTier: null,
  currentStreak: 5,
  longestStreak: 11,
  preferences: defaultPreferences('Ribeirão Preto'),
  badges: [
    {
      id: 'b_first',
      name: 'Primeiro Review',
      description: 'Mandou a primeira braba',
      iconUrl: '🥇',
      rarity: BadgeRarity.COMMON,
      earnedAt: subDays(30),
    },
    {
      id: 'b_streak5',
      name: 'Streak de 5',
      description: '5 dias seguidos com review',
      iconUrl: '🔥',
      rarity: BadgeRarity.RARE,
      earnedAt: subDays(1),
    },
  ],
  createdAt: subDays(60),
}

function influencer(
  id: string,
  handle: string,
  name: string,
  tier: InfluencerTier,
  followers: number,
  following: number,
  reviewsCount: number,
  bio: string
): User {
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle
  return {
    id,
    username: handle,
    displayName: name,
    bio,
    avatarUrl: avatar(cleanHandle),
    coverUrl: cover(cleanHandle),
    followerCount: followers,
    followingCount: following,
    reviewCount: reviewsCount,
    isVerified: true,
    influencerTier: tier,
    currentStreak: random.nextInt(0, 30),
    longestStreak: random.nextInt(15, 90),
    preferences: defaultPreferences(null),
    badges: [],
    createdAt: subDays(180 + random.nextInt(0, 600)),
  }
}

export const influencers: User[] = [
  influencer(
    'u_dudacomida',
    '@dudacomida',
    'Duda Comida',
    InfluencerTier.MEGA,
    2400000,
    312,
    487,
    'Lenda do rango BR. Manda bala que eu te indico 🔥'
  ),
  influencer(
    'u_chefnando',
    '@chefnando',
    'Chef Nando',
    InfluencerTier.MACRO,
    320000,
    98,
    230,
    'Chef e crítico. Só falo verdade aqui 🍽️'
  ),
  influencer(
    'u_pizzaqueen',
    '@pizzaqueen',
    'Pizza Queen',
    InfluencerTier.MACRO,
    180000,
    45,
    156,
    'Vivo de pizza. Top 10 sempre na bio 👑🍕'
  ),
  influencer(
    'u_rangosp',
    '@rangosp',
    'Rango SP',
    InfluencerTier.MICRO,
    67000,
    412,
    198,
    'Cobrindo cada bairro de SP, um rango por vez.'
  ),
  influencer(
    'u_baratinharp',
    '@baratinharp',
    'Baratinha RP',
    InfluencerTier.MICRO,
    28500,
    213,
    88,
    'Achei o melhor R$ por gramatura. Ribeirão na veia 💸'
  ),
  influencer(
    'u_veganasaudavel',
    '@veganasaudavel',
    'Vegana Saudável',
    InfluencerTier.MICRO,
    41200,
    156,
    142,
    'Plant-based só. Indicação raiz 🌱'
  ),
  influencer(
    'u_japasecreto',
    '@japasecreto',
    'Japa Secreto',
    InfluencerTier.NANO,
    8400,
    67,
    53,
    'Os japas que ninguém indica, eu acho 🍣'
  ),
  influencer(
    'u_baracria',
    '@baracria',
    'Bar de Cria',
    InfluencerTier.NANO,
    5200,
    89,
    41,
    'Botecos e bares de bairro. Cerveja gelada importa.'
  ),
]

export const allUsers: User[] = [currentUser, ...influencers]

// ---------- Restaurants ----------

interface RestaurantSeed {
  name: string
  categories: RestaurantCategory[]
  price: PriceRange
}

const spSeeds: RestaurantSeed[] = [
  {
    name: 'Rango do Zé',
    categories: [RestaurantCategory.PODRAO],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Sushi Yamato',
    categories: [RestaurantCategory.JAPONES],
    price: PriceRange.EXPENSIVE,
  },
  {
    name: 'Pizzaria Bella',
    categories: [RestaurantCategory.PIZZARIA, RestaurantCategory.ITALIANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Hambúrguer da Esquina',
    categories: [RestaurantCategory.HAMBURGERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Trattoria do Beppe',
    categories: [RestaurantCategory.ITALIANO],
    price: PriceRange.EXPENSIVE,
  },
  {
    name: 'Verde Que Te Quero Verde',
    categories: [RestaurantCategory.VEGANO, RestaurantCategory.SAUDAVEL],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Churrascaria Brasa Boa',
    categories: [
      RestaurantCategory.CHURRASCARIA,
      RestaurantCategory.BRASILEIRO,
    ],
    price: PriceRange.LUXURY,
  },
  {
    name: 'Café Quintal',
    categories: [RestaurantCategory.CAFETERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Boteco do Léo',
    categories: [RestaurantCategory.BAR, RestaurantCategory.BRASILEIRO],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Doceria Mel & Açúcar',
    categories: [RestaurantCategory.DOCERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Sushi Roll',
    categories: [RestaurantCategory.JAPONES],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Pizzaria Forno Lenha',
    categories: [RestaurantCategory.PIZZARIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Burger Bros',
    categories: [RestaurantCategory.HAMBURGERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Cantina Romana',
    categories: [RestaurantCategory.ITALIANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Veggie Bowl',
    categories: [RestaurantCategory.VEGANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Brasa Premium',
    categories: [RestaurantCategory.CHURRASCARIA],
    price: PriceRange.LUXURY,
  },
  {
    name: 'Café da Vila',
    categories: [RestaurantCategory.CAFETERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Bar do Tio',
    categories: [RestaurantCategory.BAR],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Doce Vida',
    categories: [RestaurantCategory.DOCERIA, RestaurantCategory.CAFETERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Lanchonete Saideira',
    categories: [RestaurantCategory.PODRAO],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Sashimi House',
    categories: [RestaurantCategory.JAPONES],
    price: PriceRange.LUXURY,
  },
  {
    name: 'Mama Mia Pizza',
    categories: [RestaurantCategory.PIZZARIA],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Smash Burguer SP',
    categories: [RestaurantCategory.HAMBURGERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Osteria Pasta',
    categories: [RestaurantCategory.ITALIANO],
    price: PriceRange.EXPENSIVE,
  },
  {
    name: 'Plant Power',
    categories: [RestaurantCategory.VEGANO, RestaurantCategory.SAUDAVEL],
    price: PriceRange.EXPENSIVE,
  },
  {
    name: 'Boteco da Esquina',
    categories: [RestaurantCategory.BAR],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Padaria Boutique',
    categories: [RestaurantCategory.CAFETERIA, RestaurantCategory.DOCERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Tacos & Margarita',
    categories: [RestaurantCategory.MEXICANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Wok Express',
    categories: [RestaurantCategory.CHINESE],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Shawarma do Habibi',
    categories: [RestaurantCategory.ARABE],
    price: PriceRange.MODERATE,
  },
]

const ribeiraoSeeds: RestaurantSeed[] = [
  {
    name: 'Pingo Doce',
    categories: [RestaurantCategory.PODRAO, RestaurantCategory.BRASILEIRO],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Yakitori RP',
    categories: [RestaurantCategory.JAPONES],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Pizzaria Marechal',
    categories: [RestaurantCategory.PIZZARIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Mr. Fries Burger',
    categories: [RestaurantCategory.HAMBURGERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Cantina Italianíssima',
    categories: [RestaurantCategory.ITALIANO],
    price: PriceRange.EXPENSIVE,
  },
  {
    name: 'Verde Cozinha',
    categories: [RestaurantCategory.VEGANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Churrascaria Pampas',
    categories: [RestaurantCategory.CHURRASCARIA],
    price: PriceRange.LUXURY,
  },
  {
    name: 'Café Estação',
    categories: [RestaurantCategory.CAFETERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Bar do Choperão',
    categories: [RestaurantCategory.BAR],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Confeitaria Carolina',
    categories: [RestaurantCategory.DOCERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Temaki da Vila',
    categories: [RestaurantCategory.JAPONES],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Pizza na Tábua',
    categories: [RestaurantCategory.PIZZARIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Big Burger Ribeirão',
    categories: [RestaurantCategory.HAMBURGERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Pasta Fresca',
    categories: [RestaurantCategory.ITALIANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Salada Power',
    categories: [RestaurantCategory.SAUDAVEL, RestaurantCategory.VEGANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Espeto de Ouro',
    categories: [
      RestaurantCategory.CHURRASCARIA,
      RestaurantCategory.BRASILEIRO,
    ],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Café da Praça',
    categories: [RestaurantCategory.CAFETERIA],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Boteco Ribeirão',
    categories: [RestaurantCategory.BAR],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Sweet RP',
    categories: [RestaurantCategory.DOCERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Cantina Bambino',
    categories: [RestaurantCategory.ITALIANO, RestaurantCategory.PIZZARIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Sushi Boutique',
    categories: [RestaurantCategory.JAPONES],
    price: PriceRange.LUXURY,
  },
  {
    name: 'Hambúrguer da Maria',
    categories: [RestaurantCategory.HAMBURGERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Vegano Daqui',
    categories: [RestaurantCategory.VEGANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Costela Premium',
    categories: [RestaurantCategory.CHURRASCARIA],
    price: PriceRange.LUXURY,
  },
  {
    name: 'Café Sereno',
    categories: [RestaurantCategory.CAFETERIA, RestaurantCategory.DOCERIA],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Choperia do Centro',
    categories: [RestaurantCategory.BAR],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Doce Açúcar',
    categories: [RestaurantCategory.DOCERIA],
    price: PriceRange.CHEAP,
  },
  {
    name: 'China in Box RP',
    categories: [RestaurantCategory.CHINESE],
    price: PriceRange.CHEAP,
  },
  {
    name: 'Tacomania',
    categories: [RestaurantCategory.MEXICANO],
    price: PriceRange.MODERATE,
  },
  {
    name: 'Esfiha do Líbano',
    categories: [RestaurantCategory.ARABE],
    price: PriceRange.CHEAP,
  },
]

const spNeighborhoods = [
  'Pinheiros',
  'Vila Madalena',
  'Consolação',
  'Centro',
  'Liberdade',
  'Itaim Bibi',
  'Jardins',
  'Moema',
]
const ribeiraoNeighborhoods = [
  'Centro',
  'Jardim Paulista',
  'Vila Seixas',
  'Ribeirânia',
]
const spStreets = [
  'Rua Augusta',
  'Rua Aspicuelta',
  'Rua Bela Cintra',
  'Rua Oscar Freire',
  'Av. Paulista',
  'Rua Pamplona',
  'Rua Wisard',
  'Rua Harmonia',
]
const ribeiraoStreets = [
  'Av. Independência',
  'Rua São Sebastião',
  'Av. Presidente Vargas',
  'Rua Visconde de Inhaúma',
  'Av. Café',
]

function buildRestaurant(
  id: string,
  seed: RestaurantSeed,
  city: string,
  state: string,
  neighborhoods: string[],
  streets: string[],
  baseLat: number,
  baseLng: number
): Restaurant {
  const neighborhood = random.randomElement(neighborhoods)
  const street = random.randomElement(streets)
  const number = (50 + random.nextInt(0, 1950)).toString()
  const avgScore = Math.min(3.0 + random.nextFloat() * 2.0, 5.0)
  const reviewCount = random.nextInt(8, 240)

  // Pick 4–6 metrics to populate averages.
  const metricKeys = random
    .shuffle(Object.values(MetricId))
    .slice(0, 5) as MetricId[]
  const avgMetrics = {} as Record<MetricId, number>
  for (const key of metricKeys) {
    avgMetrics[key] = Math.min(3.2 + random.nextFloat() * 1.7, 5.0)
  }

  return {
    id,
    name: seed.name,
    description: `Lugar de cria — ${getCategoryLabel(seed.categories[0])} de respeito.`,
    categories: seed.categories,
    priceRange: seed.price,
    address: {
      street,
      number,
      complement: null,
      neighborhood,
      city,
      state,
      zipCode: null,
      fullFormatted: `${street}, ${number} - ${neighborhood}, ${city} - ${state}`,
    },
    coordinates: {
      latitude: baseLat + (random.next() - 0.5) * 0.08,
      longitude: baseLng + (random.next() - 0.5) * 0.08,
    },
    phone: null,
    website: null,
    openingHours: null,
    photos: [0, 1, 2].map((idx) => restaurantPhoto(id, idx)),
    menuPhotos: [],
    averageOverallScore: avgScore,
    averageMetrics: avgMetrics,
    reviewCount,
    vibeCheckCount: random.nextInt(0, 6),
    isOpenNow: random.nextBoolean(),
    illnessReports90d: 0,
    illnessWarning: false,
    eloByCuisine: {},
    createdAt: subDays(random.nextInt(30, 720)),
  }
}

export const restaurants: Restaurant[] = [
  ...spSeeds.map((seed, index) =>
    buildRestaurant(
      `r_sp_${index}`,
      seed,
      'São Paulo',
      'SP',
      spNeighborhoods,
      spStreets,
      -23.55,
      -46.65
    )
  ),
  ...ribeiraoSeeds.map((seed, index) =>
    buildRestaurant(
      `r_rp_${index}`,
      seed,
      'Ribeirão Preto',
      'SP',
      ribeiraoNeighborhoods,
      ribeiraoStreets,
      -21.17,
      -47.81
    )
  ),
]

// ---------- Reviews ----------

function buildReviews(): Review[] {
  const texts = [
    'Amassei o parmegiana, mt aesthetic e o atendimento tava on 🔥',
    'Flopou pra mim, esperava mais. Preço não condiz com o que entregam.',
    'Lugar de cria. Voltaria 10/10. Pede o prato do dia.',
    'Atendimento on, comida 100% vibes. Bom pra ir com a tropa.',
    'Tá caro pra qualidade. Dei um pulo só pq tava perto.',
    'Sobremesa é a estrela. Pega o pudim, sério.',
    'Achei meio barulhento, mas a comida salvou.',
    'Vibe ótima, decoração aesthetic, mt boa pra date.',
    'Não tankei o sushi, peixe não tava fresco. Decepção.',
    'Custo-benefício na régua. Vou virar cliente fixo.',
    'Lugar pequeno mas charmoso. Reserva antes.',
    'Porção generosa, dá pra dividir tranquilo.',
    'Cardápio limitado mas tudo que tem é top.',
    'Música boa, pessoal simpático, comida na régua.',
    'Demorou demais pra sair os pratos. Esperava mais.',
  ]

  const list: Review[] = []
  let id = 0
  for (let i = 0; i < 28; i++) {
    const user = random.randomElement(allUsers)
    const restaurant = random.randomElement(restaurants)
    const score = random.nextInt(10) < 2 ? null : random.nextInt(2, 6) // 20% sem nota
    const metricSubset = random
      .shuffle(Object.values(MetricId))
      .slice(0, random.nextInt(2, 5)) as MetricId[]

    const metricsMap = {} as Record<MetricId, number>
    for (const m of metricSubset) {
      metricsMap[m] = random.nextInt(2, 6)
    }

    const ageHours = random.nextInt(1, 240)
    const photos =
      random.nextInt(10) < 7
        ? Array.from({ length: random.nextInt(0, 3) }, (_, idx) =>
            restaurantPhoto(restaurant.id, idx + 10)
          )
        : []

    const dayOffset = Math.floor(ageHours / 24)
    const visitDateObj = new Date(
      new Date('2026-05-06T00:00:00Z').getTime() -
        dayOffset * 24 * 60 * 60 * 1000
    )
    const visitDate = formatDate(visitDateObj)

    list.push({
      id: `rev_${id++}`,
      userId: user.id,
      user,
      restaurantId: restaurant.id,
      restaurant,
      overallScore: score,
      metrics: metricsMap,
      comment: random.randomElement(texts),
      photos,
      targetDestinations: [{ type: 'profile', id: user.id }],
      receiptPhoto: null,
      totalSpent: random.nextBoolean()
        ? 25.0 + random.nextInt(0, 200)
        : undefined,
      visitDate,
      companions:
        random.nextInt(10) < 3 ? [random.randomElement(allUsers).id] : null,
      likes: random.nextInt(0, 250),
      comments: [],
      isLikedByMe: random.nextInt(10) < 3,
      createdAt: subHours(ageHours),
    })
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export const reviews: Review[] = buildReviews()

// ---------- Comments ----------

export const comments: Comment[] = reviews.slice(0, 5).flatMap((review) => [
  {
    id: `c_${review.id}_1`,
    reviewId: review.id,
    userId: currentUser.id,
    user: currentUser,
    text: 'Caraca, vou nesse rolê!',
    parentId: null,
    likes: 3,
    isLikedByMe: false,
    createdAt: addHours(review.createdAt, 0.5),
  },
  {
    id: `c_${review.id}_2`,
    reviewId: review.id,
    userId: influencers[0].id,
    user: influencers[0],
    text: 'Mandou bem 🔥',
    parentId: null,
    likes: 12,
    isLikedByMe: true,
    createdAt: addHours(review.createdAt, 1),
  },
])

// Associate comments back to reviews
for (const comment of comments) {
  const review = reviews.find((r) => r.id === comment.reviewId)
  if (review) {
    review.comments.push(comment)
  }
}

// ---------- Groups ----------

export const groups: Group[] = [
  {
    id: 'g_podraos_sp',
    name: 'Podrões SP',
    description: 'Os melhores podrões da capital. Só rango de cria.',
    coverUrl: cover('podraos_sp'),
    adminId: influencers[3].id, // @rangosp
    admins: [influencers[3].id],
    isOpen: true,
    members: [
      {
        userId: currentUser.id,
        user: currentUser,
        role: GroupRole.MEMBER,
        joinedAt: subDays(20),
      },
      {
        userId: influencers[3].id,
        user: influencers[3],
        role: GroupRole.ADMIN,
        joinedAt: subDays(60),
      },
      {
        userId: influencers[0].id,
        user: influencers[0],
        role: GroupRole.MEMBER,
        joinedAt: subDays(40),
      },
    ],
    memberCount: 412,
    mandatoryMetrics: [MetricId.PRICE, MetricId.PORTION, MetricId.TASTE],
    groupRankings: null,
    createdAt: subDays(90),
  },
  {
    id: 'g_japa_secreto',
    name: 'Japa Secreto',
    description: 'Sushi raiz — só os japas que ninguém indica.',
    coverUrl: cover('japa_secreto'),
    adminId: influencers[6].id, // @japasecreto
    admins: [influencers[6].id],
    isOpen: false,
    members: [
      {
        userId: influencers[6].id,
        user: influencers[6],
        role: GroupRole.ADMIN,
        joinedAt: subDays(70),
      },
      {
        userId: influencers[1].id,
        user: influencers[1],
        role: GroupRole.MODERATOR,
        joinedAt: subDays(50),
      },
    ],
    memberCount: 68,
    mandatoryMetrics: [MetricId.TASTE, MetricId.AESTHETIC, MetricId.SERVICE],
    groupRankings: null,
    createdAt: subDays(110),
  },
  {
    id: 'g_baratin_rp',
    name: 'Baratin Ribeirão',
    description: 'Onde gastar pouco e comer muito em RP.',
    coverUrl: cover('baratin_rp'),
    adminId: influencers[4].id, // @baratinharp
    admins: [influencers[4].id],
    isOpen: true,
    members: [
      {
        userId: currentUser.id,
        user: currentUser,
        role: GroupRole.MEMBER,
        joinedAt: subDays(15),
      },
      {
        userId: influencers[4].id,
        user: influencers[4],
        role: GroupRole.ADMIN,
        joinedAt: subDays(80),
      },
    ],
    memberCount: 247,
    mandatoryMetrics: [MetricId.PRICE, MetricId.COST_BENEFIT, MetricId.PORTION],
    groupRankings: null,
    createdAt: subDays(100),
  },
]

// ---------- Lists ----------

export const lists: CustomList[] = [
  {
    id: 'l_quero_ir',
    ownerId: currentUser.id,
    name: 'Quero ir',
    description: 'Os rangos da minha mira.',
    iconUrl: '💾',
    coverColor: '#FF6B35',
    isPublic: false,
    isWishlist: true,
    collaborators: [],
    sharedWith: [],
    themes: [],
    restaurants: random
      .shuffle(restaurants)
      .slice(0, 8)
      .map((r) => ({
        restaurantId: r.id,
        restaurant: r,
        addedBy: currentUser.id,
        note: null,
        priority: 1,
        addedAt: subDays(random.nextInt(1, 30)),
      })),
    followerCount: 0,
    createdAt: subDays(60),
    updatedAt: subDays(1),
  },
  {
    id: 'l_rolê_sexta',
    ownerId: currentUser.id,
    name: 'Rolê de sexta',
    description: 'Lugares com vibe pra sextou.',
    iconUrl: '🍻',
    coverColor: '#7B61FF',
    isPublic: true,
    isWishlist: false,
    collaborators: [],
    sharedWith: [],
    themes: [RestaurantCategory.BAR, RestaurantCategory.HAMBURGERIA],
    restaurants: restaurants
      .filter(
        (r) =>
          r.categories.includes(RestaurantCategory.BAR) ||
          r.categories.includes(RestaurantCategory.HAMBURGERIA)
      )
      .slice(0, 6)
      .map((r) => ({
        restaurantId: r.id,
        restaurant: r,
        addedBy: currentUser.id,
        note: null,
        priority: 2,
        addedAt: subDays(random.nextInt(1, 60)),
      })),
    followerCount: 8,
    createdAt: subDays(45),
    updatedAt: subDays(3),
  },
  {
    id: 'l_date_aesthetic',
    ownerId: currentUser.id,
    name: 'Date aesthetic',
    description: 'Lugar bonito pra impressionar.',
    iconUrl: '💡',
    coverColor: '#00D9C0',
    isPublic: true,
    isWishlist: false,
    collaborators: [],
    sharedWith: [],
    themes: [RestaurantCategory.ITALIANO, RestaurantCategory.JAPONES],
    restaurants: restaurants
      .filter(
        (r) =>
          r.priceRange === PriceRange.EXPENSIVE ||
          r.priceRange === PriceRange.LUXURY
      )
      .slice(0, 5)
      .map((r) => ({
        restaurantId: r.id,
        restaurant: r,
        addedBy: currentUser.id,
        note: 'Pega o vinho da casa',
        priority: 3,
        addedAt: subDays(random.nextInt(1, 30)),
      })),
    followerCount: 14,
    createdAt: subDays(30),
    updatedAt: subDays(5),
  },
  {
    id: 'l_baratin_rp',
    ownerId: influencers[4].id,
    name: 'Baratin de RP',
    description: 'Curadoria do @baratinharp.',
    iconUrl: '💸',
    coverColor: '#FF6B35',
    isPublic: true,
    isWishlist: false,
    collaborators: [],
    sharedWith: [],
    themes: [],
    restaurants: restaurants
      .filter(
        (r) =>
          r.address.city === 'Ribeirão Preto' &&
          r.priceRange === PriceRange.CHEAP
      )
      .slice(0, 7)
      .map((r) => ({
        restaurantId: r.id,
        restaurant: r,
        addedBy: influencers[4].id,
        note: null,
        priority: 1,
        addedAt: subDays(random.nextInt(1, 90)),
      })),
    followerCount: 218,
    createdAt: subDays(70),
    updatedAt: subDays(7),
  },
  {
    id: 'l_top_pizza',
    ownerId: influencers[2].id,
    name: 'Top Pizzas SP',
    description: 'Pelas mãos da @pizzaqueen.',
    iconUrl: '🍕',
    coverColor: '#FF453A',
    isPublic: true,
    isWishlist: false,
    collaborators: [],
    sharedWith: [],
    themes: [RestaurantCategory.PIZZARIA],
    restaurants: restaurants
      .filter(
        (r) =>
          r.categories.includes(RestaurantCategory.PIZZARIA) &&
          r.address.city === 'São Paulo'
      )
      .slice(0, 6)
      .map((r) => ({
        restaurantId: r.id,
        restaurant: r,
        addedBy: influencers[2].id,
        note: null,
        priority: 2,
        addedAt: subDays(random.nextInt(1, 120)),
      })),
    followerCount: 1242,
    createdAt: subDays(120),
    updatedAt: subDays(2),
  },
]

// ---------- Vibe Checks ----------

function buildVibeChecks(): VibeCheck[] {
  const notes = [
    null,
    'Tá voando',
    'Fila grande mas vale',
    'Pediu música, tocaram',
    'Lotado, espera 30min',
  ]
  const list: VibeCheck[] = []
  for (let idx = 0; idx < 6; idx++) {
    const user = random.randomElement(allUsers)
    const rest = random.randomElement(restaurants)
    const ageMin = random.nextInt(5, 220)
    const createdAt = subMinutes(ageMin)
    const expiresAt = addHours(createdAt, 4)

    list.push({
      id: `v_${idx}`,
      userId: user.id,
      user,
      restaurantId: rest.id,
      restaurant: rest,
      status: random.randomElement(Object.values(VibeStatus)) as VibeStatus,
      note: random.randomElement(notes),
      photo: random.nextBoolean() ? restaurantPhoto(rest.id, 99) : null,
      expiresAt,
      createdAt,
    })
  }
  return list
}

export const vibeChecks: VibeCheck[] = buildVibeChecks()

// ---------- Notifications ----------

export const notifications: Notification[] = [
  {
    id: 'n_1',
    type: NotificationType.LIKE_REVIEW,
    actor: influencers[0],
    targetReview: reviews[0],
    message: `${influencers[0].username} amou seu review`,
    isRead: false,
    createdAt: subMinutes(30),
  },
  {
    id: 'n_2',
    type: NotificationType.FOLLOW,
    actor: influencers[1],
    message: `${influencers[1].username} começou a te acompanhar`,
    isRead: false,
    createdAt: subHours(2),
  },
  {
    id: 'n_3',
    type: NotificationType.GROUP_INVITE,
    actor: influencers[6],
    targetGroup: groups[1],
    message: `Você foi chamado pra tropa ${groups[1].name}`,
    isRead: false,
    createdAt: subHours(6),
  },
  {
    id: 'n_4',
    type: NotificationType.STREAK_WARNING,
    message: 'Falta 1 review pra manter seu streak de 5 dias! 🔥',
    isRead: false,
    createdAt: subHours(12),
  },
  {
    id: 'n_5',
    type: NotificationType.BADGE_EARNED,
    message: 'Nova conquista: Streak de 5 🏆',
    isRead: true,
    createdAt: subDays(1),
  },
  {
    id: 'n_6',
    type: NotificationType.TRENDING_RESTAURANT,
    targetRestaurant: restaurants[0],
    message: `${restaurants[0].name} tá bombando 🔥`,
    isRead: true,
    createdAt: subDays(2),
  },
]
