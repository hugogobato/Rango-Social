package com.gurudosrestaurantes.data.mock
import kotlinx.datetime.minus
import com.gurudosrestaurantes.domain.model.Address
import com.gurudosrestaurantes.domain.model.Badge
import com.gurudosrestaurantes.domain.model.BadgeRarity
import com.gurudosrestaurantes.domain.model.Comment
import com.gurudosrestaurantes.domain.model.CustomList
import com.gurudosrestaurantes.domain.model.GeoPoint
import com.gurudosrestaurantes.domain.model.Group
import com.gurudosrestaurantes.domain.model.GroupMember
import com.gurudosrestaurantes.domain.model.GroupRole
import com.gurudosrestaurantes.domain.model.InfluencerTier
import com.gurudosrestaurantes.domain.model.ListItem
import com.gurudosrestaurantes.domain.model.MetricId
import com.gurudosrestaurantes.domain.model.Notification
import com.gurudosrestaurantes.domain.model.NotificationType
import com.gurudosrestaurantes.domain.model.PriceRange
import com.gurudosrestaurantes.domain.model.Restaurant
import com.gurudosrestaurantes.domain.model.RestaurantCategory
import com.gurudosrestaurantes.domain.model.Review
import com.gurudosrestaurantes.domain.model.TargetDestination
import com.gurudosrestaurantes.domain.model.User
import com.gurudosrestaurantes.domain.model.UserPreferences
import com.gurudosrestaurantes.domain.model.VibeCheck
import com.gurudosrestaurantes.domain.model.VibeStatus
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlin.random.Random
import kotlin.time.Duration.Companion.days
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

/**
 * Static seed data for Phase 2. Returned as plain lists; FakeRepositories wrap
 * these in MutableStateFlow at app start so the UI can mutate state in-memory.
 *
 * Photos use `picsum.photos/seed/<id>/...` for determinism. Avatars use
 * dicebear so each user has a stable, distinct look.
 */
object MockData {

    // Fixed reference time keeps the generated feed deterministic (today is 2026-05-06).
    val now: Instant = Instant.parse("2026-05-06T20:00:00Z")
    private val random = Random(42)

    // ---------- Photos ----------

    private fun restaurantPhoto(id: String, idx: Int = 0): String =
        "https://picsum.photos/seed/${id}_$idx/900/600"

    private fun avatar(handle: String): String =
        "https://api.dicebear.com/9.x/avataaars/png?seed=$handle&backgroundColor=ff6b35,7b61ff,00d9c0"

    private fun cover(seed: String): String =
        "https://picsum.photos/seed/${seed}_cover/1200/400"

    // ---------- Users ----------

    val currentUser: User = User(
        id = "u_me",
        username = "@hugo",
        displayName = "Hugo",
        bio = "Cria de RP, sempre atrás de um rango bom 🌶️",
        avatarUrl = avatar("hugo_me"),
        coverUrl = cover("hugo_me"),
        followerCount = 47,
        followingCount = 132,
        reviewCount = 12,
        isVerified = false,
        influencerTier = null,
        currentStreak = 5,
        longestStreak = 11,
        preferences = UserPreferences(defaultCity = "Ribeirão Preto"),
        badges = listOf(
            Badge("b_first", "Primeiro Review", "Mandou a primeira braba", "🥇", BadgeRarity.COMMON, now - 30.days),
            Badge("b_streak5", "Streak de 5", "5 dias seguidos com review", "🔥", BadgeRarity.RARE, now - 1.days),
        ),
        createdAt = now - 60.days,
    )

    val influencers: List<User> = listOf(
        influencer(
            id = "u_dudacomida", handle = "@dudacomida", name = "Duda Comida",
            tier = InfluencerTier.MEGA, followers = 2_400_000, following = 312, reviews = 487,
            bio = "Lenda do rango BR. Manda bala que eu te indico 🔥",
        ),
        influencer(
            id = "u_chefnando", handle = "@chefnando", name = "Chef Nando",
            tier = InfluencerTier.MACRO, followers = 320_000, following = 98, reviews = 230,
            bio = "Chef e crítico. Só falo verdade aqui 🍽️",
        ),
        influencer(
            id = "u_pizzaqueen", handle = "@pizzaqueen", name = "Pizza Queen",
            tier = InfluencerTier.MACRO, followers = 180_000, following = 45, reviews = 156,
            bio = "Vivo de pizza. Top 10 sempre na bio 👑🍕",
        ),
        influencer(
            id = "u_rangosp", handle = "@rangosp", name = "Rango SP",
            tier = InfluencerTier.MICRO, followers = 67_000, following = 412, reviews = 198,
            bio = "Cobrindo cada bairro de SP, um rango por vez.",
        ),
        influencer(
            id = "u_baratinharp", handle = "@baratinharp", name = "Baratinha RP",
            tier = InfluencerTier.MICRO, followers = 28_500, following = 213, reviews = 88,
            bio = "Achei o melhor R\$ por gramatura. Ribeirão na veia 💸",
        ),
        influencer(
            id = "u_veganasaudavel", handle = "@veganasaudavel", name = "Vegana Saudável",
            tier = InfluencerTier.MICRO, followers = 41_200, following = 156, reviews = 142,
            bio = "Plant-based só. Indicação raiz 🌱",
        ),
        influencer(
            id = "u_japasecreto", handle = "@japasecreto", name = "Japa Secreto",
            tier = InfluencerTier.NANO, followers = 8_400, following = 67, reviews = 53,
            bio = "Os japas que ninguém indica, eu acho 🍣",
        ),
        influencer(
            id = "u_baracria", handle = "@baracria", name = "Bar de Cria",
            tier = InfluencerTier.NANO, followers = 5_200, following = 89, reviews = 41,
            bio = "Botecos e bares de bairro. Cerveja gelada importa.",
        ),
    )

    val allUsers: List<User> = listOf(currentUser) + influencers

    private fun influencer(
        id: String,
        handle: String,
        name: String,
        tier: InfluencerTier,
        followers: Int,
        following: Int,
        reviews: Int,
        bio: String,
    ) = User(
        id = id,
        username = handle,
        displayName = name,
        bio = bio,
        avatarUrl = avatar(handle.removePrefix("@")),
        coverUrl = cover(handle.removePrefix("@")),
        followerCount = followers,
        followingCount = following,
        reviewCount = reviews,
        isVerified = true,
        influencerTier = tier,
        currentStreak = random.nextInt(0, 30),
        longestStreak = random.nextInt(15, 90),
        createdAt = now - (180 + random.nextInt(0, 600)).days,
    )

    // ---------- Restaurants ----------

    private data class RestaurantSeed(
        val name: String,
        val categories: List<RestaurantCategory>,
        val price: PriceRange,
    )

    private val spSeeds = listOf(
        RestaurantSeed("Rango do Zé", listOf(RestaurantCategory.PODRAO), PriceRange.CHEAP),
        RestaurantSeed("Sushi Yamato", listOf(RestaurantCategory.JAPONES), PriceRange.EXPENSIVE),
        RestaurantSeed("Pizzaria Bella", listOf(RestaurantCategory.PIZZARIA, RestaurantCategory.ITALIANO), PriceRange.MODERATE),
        RestaurantSeed("Hambúrguer da Esquina", listOf(RestaurantCategory.HAMBURGERIA), PriceRange.MODERATE),
        RestaurantSeed("Trattoria do Beppe", listOf(RestaurantCategory.ITALIANO), PriceRange.EXPENSIVE),
        RestaurantSeed("Verde Que Te Quero Verde", listOf(RestaurantCategory.VEGANO, RestaurantCategory.SAUDAVEL), PriceRange.MODERATE),
        RestaurantSeed("Churrascaria Brasa Boa", listOf(RestaurantCategory.CHURRASCARIA, RestaurantCategory.BRASILEIRO), PriceRange.LUXURY),
        RestaurantSeed("Café Quintal", listOf(RestaurantCategory.CAFETERIA), PriceRange.MODERATE),
        RestaurantSeed("Boteco do Léo", listOf(RestaurantCategory.BAR, RestaurantCategory.BRASILEIRO), PriceRange.CHEAP),
        RestaurantSeed("Doceria Mel & Açúcar", listOf(RestaurantCategory.DOCERIA), PriceRange.MODERATE),
        RestaurantSeed("Sushi Roll", listOf(RestaurantCategory.JAPONES), PriceRange.MODERATE),
        RestaurantSeed("Pizzaria Forno Lenha", listOf(RestaurantCategory.PIZZARIA), PriceRange.MODERATE),
        RestaurantSeed("Burger Bros", listOf(RestaurantCategory.HAMBURGERIA), PriceRange.MODERATE),
        RestaurantSeed("Cantina Romana", listOf(RestaurantCategory.ITALIANO), PriceRange.MODERATE),
        RestaurantSeed("Veggie Bowl", listOf(RestaurantCategory.VEGANO), PriceRange.MODERATE),
        RestaurantSeed("Brasa Premium", listOf(RestaurantCategory.CHURRASCARIA), PriceRange.LUXURY),
        RestaurantSeed("Café da Vila", listOf(RestaurantCategory.CAFETERIA), PriceRange.MODERATE),
        RestaurantSeed("Bar do Tio", listOf(RestaurantCategory.BAR), PriceRange.CHEAP),
        RestaurantSeed("Doce Vida", listOf(RestaurantCategory.DOCERIA, RestaurantCategory.CAFETERIA), PriceRange.MODERATE),
        RestaurantSeed("Lanchonete Saideira", listOf(RestaurantCategory.PODRAO), PriceRange.CHEAP),
        RestaurantSeed("Sashimi House", listOf(RestaurantCategory.JAPONES), PriceRange.LUXURY),
        RestaurantSeed("Mama Mia Pizza", listOf(RestaurantCategory.PIZZARIA), PriceRange.CHEAP),
        RestaurantSeed("Smash Burguer SP", listOf(RestaurantCategory.HAMBURGERIA), PriceRange.MODERATE),
        RestaurantSeed("Osteria Pasta", listOf(RestaurantCategory.ITALIANO), PriceRange.EXPENSIVE),
        RestaurantSeed("Plant Power", listOf(RestaurantCategory.VEGANO, RestaurantCategory.SAUDAVEL), PriceRange.EXPENSIVE),
        RestaurantSeed("Boteco da Esquina", listOf(RestaurantCategory.BAR), PriceRange.CHEAP),
        RestaurantSeed("Padaria Boutique", listOf(RestaurantCategory.CAFETERIA, RestaurantCategory.DOCERIA), PriceRange.MODERATE),
        RestaurantSeed("Tacos & Margarita", listOf(RestaurantCategory.MEXICANO), PriceRange.MODERATE),
        RestaurantSeed("Wok Express", listOf(RestaurantCategory.CHINESE), PriceRange.CHEAP),
        RestaurantSeed("Shawarma do Habibi", listOf(RestaurantCategory.ARABE), PriceRange.MODERATE),
    )

    private val ribeiraoSeeds = listOf(
        RestaurantSeed("Pingo Doce", listOf(RestaurantCategory.PODRAO, RestaurantCategory.BRASILEIRO), PriceRange.CHEAP),
        RestaurantSeed("Yakitori RP", listOf(RestaurantCategory.JAPONES), PriceRange.MODERATE),
        RestaurantSeed("Pizzaria Marechal", listOf(RestaurantCategory.PIZZARIA), PriceRange.MODERATE),
        RestaurantSeed("Mr. Fries Burger", listOf(RestaurantCategory.HAMBURGERIA), PriceRange.MODERATE),
        RestaurantSeed("Cantina Italianíssima", listOf(RestaurantCategory.ITALIANO), PriceRange.EXPENSIVE),
        RestaurantSeed("Verde Cozinha", listOf(RestaurantCategory.VEGANO), PriceRange.MODERATE),
        RestaurantSeed("Churrascaria Pampas", listOf(RestaurantCategory.CHURRASCARIA), PriceRange.LUXURY),
        RestaurantSeed("Café Estação", listOf(RestaurantCategory.CAFETERIA), PriceRange.MODERATE),
        RestaurantSeed("Bar do Choperão", listOf(RestaurantCategory.BAR), PriceRange.CHEAP),
        RestaurantSeed("Confeitaria Carolina", listOf(RestaurantCategory.DOCERIA), PriceRange.MODERATE),
        RestaurantSeed("Temaki da Vila", listOf(RestaurantCategory.JAPONES), PriceRange.CHEAP),
        RestaurantSeed("Pizza na Tábua", listOf(RestaurantCategory.PIZZARIA), PriceRange.MODERATE),
        RestaurantSeed("Big Burger Ribeirão", listOf(RestaurantCategory.HAMBURGERIA), PriceRange.MODERATE),
        RestaurantSeed("Pasta Fresca", listOf(RestaurantCategory.ITALIANO), PriceRange.MODERATE),
        RestaurantSeed("Salada Power", listOf(RestaurantCategory.SAUDAVEL, RestaurantCategory.VEGANO), PriceRange.MODERATE),
        RestaurantSeed("Espeto de Ouro", listOf(RestaurantCategory.CHURRASCARIA, RestaurantCategory.BRASILEIRO), PriceRange.MODERATE),
        RestaurantSeed("Café da Praça", listOf(RestaurantCategory.CAFETERIA), PriceRange.CHEAP),
        RestaurantSeed("Boteco Ribeirão", listOf(RestaurantCategory.BAR), PriceRange.CHEAP),
        RestaurantSeed("Sweet RP", listOf(RestaurantCategory.DOCERIA), PriceRange.MODERATE),
        RestaurantSeed("Cantina Bambino", listOf(RestaurantCategory.ITALIANO, RestaurantCategory.PIZZARIA), PriceRange.MODERATE),
        RestaurantSeed("Sushi Boutique", listOf(RestaurantCategory.JAPONES), PriceRange.LUXURY),
        RestaurantSeed("Hambúrguer da Maria", listOf(RestaurantCategory.HAMBURGERIA), PriceRange.MODERATE),
        RestaurantSeed("Vegano Daqui", listOf(RestaurantCategory.VEGANO), PriceRange.MODERATE),
        RestaurantSeed("Costela Premium", listOf(RestaurantCategory.CHURRASCARIA), PriceRange.LUXURY),
        RestaurantSeed("Café Sereno", listOf(RestaurantCategory.CAFETERIA, RestaurantCategory.DOCERIA), PriceRange.MODERATE),
        RestaurantSeed("Choperia do Centro", listOf(RestaurantCategory.BAR), PriceRange.CHEAP),
        RestaurantSeed("Doce Açúcar", listOf(RestaurantCategory.DOCERIA), PriceRange.CHEAP),
        RestaurantSeed("China in Box RP", listOf(RestaurantCategory.CHINESE), PriceRange.CHEAP),
        RestaurantSeed("Tacomania", listOf(RestaurantCategory.MEXICANO), PriceRange.MODERATE),
        RestaurantSeed("Esfiha do Líbano", listOf(RestaurantCategory.ARABE), PriceRange.CHEAP),
    )

    private val spNeighborhoods = listOf("Pinheiros", "Vila Madalena", "Consolação", "Centro", "Liberdade", "Itaim Bibi", "Jardins", "Moema")
    private val ribeiraoNeighborhoods = listOf("Centro", "Jardim Paulista", "Vila Seixas", "Ribeirânia")
    private val spStreets = listOf("Rua Augusta", "Rua Aspicuelta", "Rua Bela Cintra", "Rua Oscar Freire", "Av. Paulista", "Rua Pamplona", "Rua Wisard", "Rua Harmonia")
    private val ribeiraoStreets = listOf("Av. Independência", "Rua São Sebastião", "Av. Presidente Vargas", "Rua Visconde de Inhaúma", "Av. Café")

    val restaurants: List<Restaurant> = buildList {
        spSeeds.forEachIndexed { index, seed ->
            add(buildRestaurant("r_sp_$index", seed, "São Paulo", "SP", spNeighborhoods, spStreets, baseLat = -23.55, baseLng = -46.65))
        }
        ribeiraoSeeds.forEachIndexed { index, seed ->
            add(buildRestaurant("r_rp_$index", seed, "Ribeirão Preto", "SP", ribeiraoNeighborhoods, ribeiraoStreets, baseLat = -21.17, baseLng = -47.81))
        }
    }

    private fun buildRestaurant(
        id: String,
        seed: RestaurantSeed,
        city: String,
        state: String,
        neighborhoods: List<String>,
        streets: List<String>,
        baseLat: Double,
        baseLng: Double,
    ): Restaurant {
        val neighborhood = neighborhoods.random(random)
        val street = streets.random(random)
        val number = (50 + random.nextInt(0, 1950)).toString()
        val avgScore = (3.0f + random.nextFloat() * 2.0f).coerceAtMost(5.0f)
        val reviewCount = random.nextInt(8, 240)

        // Pick 4–6 metrics to populate averages.
        val metricKeys = MetricId.entries.shuffled(random).take(5)
        val avgMetrics = metricKeys.associateWith { (3.2f + random.nextFloat() * 1.7f).coerceAtMost(5.0f) }

        return Restaurant(
            id = id,
            name = seed.name,
            description = "Lugar de cria — ${seed.categories.first().label.lowercase()} de respeito.",
            categories = seed.categories,
            priceRange = seed.price,
            address = Address(
                street = street,
                number = number,
                complement = null,
                neighborhood = neighborhood,
                city = city,
                state = state,
                zipCode = null,
                fullFormatted = "$street, $number - $neighborhood, $city - $state",
            ),
            coordinates = GeoPoint(
                latitude = baseLat + (random.nextDouble() - 0.5) * 0.08,
                longitude = baseLng + (random.nextDouble() - 0.5) * 0.08,
            ),
            phone = null,
            website = null,
            openingHours = null,
            photos = (0..2).map { restaurantPhoto(id, it) },
            menuPhotos = emptyList(),
            averageOverallScore = avgScore,
            averageMetrics = avgMetrics,
            reviewCount = reviewCount,
            vibeCheckCount = random.nextInt(0, 6),
            isOpenNow = random.nextBoolean(),
            createdAt = now - (random.nextInt(30, 720)).days,
        )
    }

    // ---------- Reviews ----------

    val reviews: List<Review> = buildReviews()

    private fun buildReviews(): List<Review> {
        val texts = listOf(
            "Amassei o parmegiana, mt aesthetic e o atendimento tava on 🔥",
            "Flopou pra mim, esperava mais. Preço não condiz com o que entregam.",
            "Lugar de cria. Voltaria 10/10. Pede o prato do dia.",
            "Atendimento on, comida 100% vibes. Bom pra ir com a tropa.",
            "Tá caro pra qualidade. Dei um pulo só pq tava perto.",
            "Sobremesa é a estrela. Pega o pudim, sério.",
            "Achei meio barulhento, mas a comida salvou.",
            "Vibe ótima, decoração aesthetic, mt boa pra date.",
            "Não tankei o sushi, peixe não tava fresco. Decepção.",
            "Custo-benefício na régua. Vou virar cliente fixo.",
            "Lugar pequeno mas charmoso. Reserva antes.",
            "Porção generosa, dá pra dividir tranquilo.",
            "Cardápio limitado mas tudo que tem é top.",
            "Música boa, pessoal simpático, comida na régua.",
            "Demorou demais pra sair os pratos. Esperava mais.",
        )

        val list = mutableListOf<Review>()
        var id = 0
        repeat(28) {
            val user = (allUsers).random(random)
            val restaurant = restaurants.random(random)
            val score = if (random.nextInt(10) < 2) null else random.nextInt(2, 6)  // 20% sem nota
            val metricSubset = MetricId.entries.shuffled(random).take(random.nextInt(2, 5))
            val metricsMap = metricSubset.associateWith { random.nextInt(2, 6) }
            val ageHours = random.nextInt(1, 240)

            list += Review(
                id = "rev_${id++}",
                userId = user.id,
                user = user,
                restaurantId = restaurant.id,
                restaurant = restaurant,
                overallScore = score,
                metrics = metricsMap,
                comment = texts.random(random),
                photos = if (random.nextInt(10) < 7) (0..random.nextInt(0, 3)).map { restaurantPhoto(restaurant.id, it + 10) } else emptyList(),
                targetDestinations = listOf(TargetDestination.Profile(user.id)),
                receiptPhoto = null,
                totalSpent = if (random.nextBoolean()) (25.0 + random.nextInt(0, 200)).toDouble() else null,
                visitDate = run {
                    val dayOffset = (ageHours / 24)
                    LocalDate.parse("2026-05-06").minus(kotlinx.datetime.DatePeriod(days = dayOffset))
                },
                companions = if (random.nextInt(10) < 3) listOf(allUsers.random(random).id) else null,
                likes = random.nextInt(0, 250),
                comments = emptyList(),
                isLikedByMe = random.nextInt(10) < 3,
                createdAt = now - ageHours.hours,
            )
        }
        return list.sortedByDescending { it.createdAt }
    }

    // ---------- Comments ----------

    val comments: List<Comment> = reviews.take(5).flatMap { review ->
        listOf(
            Comment(
                id = "c_${review.id}_1",
                reviewId = review.id,
                userId = currentUser.id,
                user = currentUser,
                text = "Caraca, vou nesse rolê!",
                parentId = null,
                likes = 3,
                isLikedByMe = false,
                createdAt = review.createdAt + 30.minutes,
            ),
            Comment(
                id = "c_${review.id}_2",
                reviewId = review.id,
                userId = influencers.first().id,
                user = influencers.first(),
                text = "Mandou bem 🔥",
                parentId = null,
                likes = 12,
                isLikedByMe = true,
                createdAt = review.createdAt + 1.hours,
            ),
        )
    }

    // ---------- Groups ----------

    val groups: List<Group> = listOf(
        Group(
            id = "g_podraos_sp",
            name = "Podrões SP",
            description = "Os melhores podrões da capital. Só rango de cria.",
            coverUrl = cover("podraos_sp"),
            adminId = influencers[3].id,    // @rangosp
            admins = listOf(influencers[3].id),
            isOpen = true,
            members = listOf(
                GroupMember(currentUser.id, currentUser, GroupRole.MEMBER, now - 20.days),
                GroupMember(influencers[3].id, influencers[3], GroupRole.ADMIN, now - 60.days),
                GroupMember(influencers[0].id, influencers[0], GroupRole.MEMBER, now - 40.days),
            ),
            memberCount = 412,
            mandatoryMetrics = listOf(MetricId.PRICE, MetricId.PORTION, MetricId.TASTE),
            createdAt = now - 90.days,
        ),
        Group(
            id = "g_japa_secreto",
            name = "Japa Secreto",
            description = "Sushi raiz — só os japas que ninguém indica.",
            coverUrl = cover("japa_secreto"),
            adminId = influencers[6].id,    // @japasecreto
            admins = listOf(influencers[6].id),
            isOpen = false,
            members = listOf(
                GroupMember(influencers[6].id, influencers[6], GroupRole.ADMIN, now - 70.days),
                GroupMember(influencers[1].id, influencers[1], GroupRole.MODERATOR, now - 50.days),
            ),
            memberCount = 68,
            mandatoryMetrics = listOf(MetricId.TASTE, MetricId.AESTHETIC, MetricId.SERVICE),
            createdAt = now - 110.days,
        ),
        Group(
            id = "g_baratin_rp",
            name = "Baratin Ribeirão",
            description = "Onde gastar pouco e comer muito em RP.",
            coverUrl = cover("baratin_rp"),
            adminId = influencers[4].id,    // @baratinharp
            admins = listOf(influencers[4].id),
            isOpen = true,
            members = listOf(
                GroupMember(currentUser.id, currentUser, GroupRole.MEMBER, now - 15.days),
                GroupMember(influencers[4].id, influencers[4], GroupRole.ADMIN, now - 80.days),
            ),
            memberCount = 247,
            mandatoryMetrics = listOf(MetricId.PRICE, MetricId.COST_BENEFIT, MetricId.PORTION),
            createdAt = now - 100.days,
        ),
    )

    // ---------- Lists ----------

    val lists: List<CustomList> = listOf(
        CustomList(
            id = "l_quero_ir",
            ownerId = currentUser.id,
            name = "Quero ir",
            description = "Os rangos da minha mira.",
            iconUrl = "💾",
            coverColor = "#FF6B35",
            isPublic = false,
            isWishlist = true,
            collaborators = emptyList(),
            sharedWith = emptyList(),
            themes = emptyList(),
            restaurants = restaurants.shuffled(random).take(8).map {
                ListItem(it.id, it, currentUser.id, null, 1, now - random.nextInt(1, 30).days)
            },
            followerCount = 0,
            createdAt = now - 60.days,
            updatedAt = now - 1.days,
        ),
        CustomList(
            id = "l_rolê_sexta",
            ownerId = currentUser.id,
            name = "Rolê de sexta",
            description = "Lugares com vibe pra sextou.",
            iconUrl = "🍻",
            coverColor = "#7B61FF",
            isPublic = true,
            isWishlist = false,
            themes = listOf(RestaurantCategory.BAR, RestaurantCategory.HAMBURGERIA),
            restaurants = restaurants.filter { RestaurantCategory.BAR in it.categories || RestaurantCategory.HAMBURGERIA in it.categories }
                .take(6)
                .map { ListItem(it.id, it, currentUser.id, null, 2, now - random.nextInt(1, 60).days) },
            followerCount = 8,
            createdAt = now - 45.days,
            updatedAt = now - 3.days,
        ),
        CustomList(
            id = "l_date_aesthetic",
            ownerId = currentUser.id,
            name = "Date aesthetic",
            description = "Lugar bonito pra impressionar.",
            iconUrl = "💡",
            coverColor = "#00D9C0",
            isPublic = true,
            isWishlist = false,
            themes = listOf(RestaurantCategory.ITALIANO, RestaurantCategory.JAPONES),
            restaurants = restaurants.filter { it.priceRange == PriceRange.EXPENSIVE || it.priceRange == PriceRange.LUXURY }
                .take(5)
                .map { ListItem(it.id, it, currentUser.id, "Pega o vinho da casa", 3, now - random.nextInt(1, 30).days) },
            followerCount = 14,
            createdAt = now - 30.days,
            updatedAt = now - 5.days,
        ),
        CustomList(
            id = "l_baratin_rp",
            ownerId = influencers[4].id,
            name = "Baratin de RP",
            description = "Curadoria do @baratinharp.",
            iconUrl = "💸",
            coverColor = "#FF6B35",
            isPublic = true,
            isWishlist = false,
            themes = emptyList(),
            restaurants = restaurants.filter { it.address.city == "Ribeirão Preto" && it.priceRange == PriceRange.CHEAP }
                .take(7)
                .map { ListItem(it.id, it, influencers[4].id, null, 1, now - random.nextInt(1, 90).days) },
            followerCount = 218,
            createdAt = now - 70.days,
            updatedAt = now - 7.days,
        ),
        CustomList(
            id = "l_top_pizza",
            ownerId = influencers[2].id,
            name = "Top Pizzas SP",
            description = "Pelas mãos da @pizzaqueen.",
            iconUrl = "🍕",
            coverColor = "#FF453A",
            isPublic = true,
            isWishlist = false,
            themes = listOf(RestaurantCategory.PIZZARIA),
            restaurants = restaurants.filter { RestaurantCategory.PIZZARIA in it.categories && it.address.city == "São Paulo" }
                .take(6)
                .map { ListItem(it.id, it, influencers[2].id, null, 2, now - random.nextInt(1, 120).days) },
            followerCount = 1_242,
            createdAt = now - 120.days,
            updatedAt = now - 2.days,
        ),
    )

    // ---------- Vibe Checks ----------

    val vibeChecks: List<VibeCheck> = buildList {
        repeat(6) { idx ->
            val user = (listOf(currentUser) + influencers).random(random)
            val rest = restaurants.random(random)
            val ageMin = random.nextInt(5, 220)
            add(
                VibeCheck(
                    id = "v_$idx",
                    userId = user.id,
                    user = user,
                    restaurantId = rest.id,
                    restaurant = rest,
                    status = VibeStatus.entries.random(random),
                    note = listOf(null, "Tá voando", "Fila grande mas vale", "Pediu música, tocaram", "Lotado, espera 30min").random(random),
                    photo = if (random.nextBoolean()) restaurantPhoto(rest.id, 99) else null,
                    expiresAt = now - ageMin.minutes + 4.hours,
                    createdAt = now - ageMin.minutes,
                )
            )
        }
    }

    // ---------- Notifications ----------

    val notifications: List<Notification> = buildList {
        val rev = reviews.first()
        add(
            Notification(
                id = "n_1",
                type = NotificationType.LIKE_REVIEW,
                actor = influencers[0],
                targetReview = rev,
                message = "${influencers[0].username} amou seu review",
                isRead = false,
                createdAt = now - 30.minutes,
            )
        )
        add(
            Notification(
                id = "n_2",
                type = NotificationType.FOLLOW,
                actor = influencers[1],
                message = "${influencers[1].username} começou a te acompanhar",
                isRead = false,
                createdAt = now - 2.hours,
            )
        )
        add(
            Notification(
                id = "n_3",
                type = NotificationType.GROUP_INVITE,
                actor = influencers[6],
                targetGroup = groups[1],
                message = "Você foi chamado pra tropa ${groups[1].name}",
                isRead = false,
                createdAt = now - 6.hours,
            )
        )
        add(
            Notification(
                id = "n_4",
                type = NotificationType.STREAK_WARNING,
                message = "Falta 1 review pra manter seu streak de 5 dias! 🔥",
                isRead = false,
                createdAt = now - 12.hours,
            )
        )
        add(
            Notification(
                id = "n_5",
                type = NotificationType.BADGE_EARNED,
                message = "Nova conquista: Streak de 5 🏆",
                isRead = true,
                createdAt = now - 1.days,
            )
        )
        add(
            Notification(
                id = "n_6",
                type = NotificationType.TRENDING_RESTAURANT,
                targetRestaurant = restaurants.first(),
                message = "${restaurants.first().name} tá bombando 🔥",
                isRead = true,
                createdAt = now - 2.days,
            )
        )
    }
}
