# Guru dos Restaurantes (GR) — Especificação Técnica Completa (v2.0)

**Plataforma:** Android Nativo (Kotlin + Jetpack Compose)  
**Público-Alvo:** Brasil — Gen Z & Gen Alpha  
**Tom:** Casual, irreverente, 100% pt-BR com gírias atualizadas. Parece conversa de WhatsApp entre amigos.  
**Arquitetura:** Clean Architecture + MVVM + Repository Pattern + Hilt DI

> **Como usar:** Salve este arquivo como `app_spec.md`. Ao iniciar o assistente de código, diga: _"Leia o app_spec.md e vamos construir o app fase por fase, começando pelo setup do projeto e tema visual."_

---

## 0. Glossário & Sistema de Linguagem (OBRIGATÓRIO)

Todo texto da UI deve seguir este dicionário. Nunca use português formal corporativo.

| Conceito Formal      | Copy Oficial no App                                         | Contexto                 |
| -------------------- | ----------------------------------------------------------- | ------------------------ |
| Avaliar / Review     | `Mandar a real`, `Dar o papo`, `Avaliar o rango`            | Botões, CTAs             |
| Sem nota / Só visita | `Só colei lá`, `Dei um pulo`, `Fui dar uma olhada`          | Opção de review sem nota |
| Em alta / Trending   | `Tá bombando`, `No hype`, `Virou febre`                     | Aba de trending, badges  |
| Lugar ruim           | `Flopou`, `Não tankei`, `Decepcionou`                       | Reviews negativos        |
| Lugar muito bom      | `Amassei`, `Rango de cria`, `Muito aesthetic`, `100% vibes` | Reviews positivos        |
| Publicar             | `Lançar a braba`, `Postar`, `Mandar ver`                    | Botão de submit          |
| Amigos               | `Bonde`, `Chegados`, `Parça`, `Cria`                        | Seção social             |
| Seguir (usuário)     | `Acompanhar`, `Tá na minha lista`                           | Botão de follow          |
| Grupos               | `Tropa`, `Squad`, `Gangue`                                  | Navegação de grupos      |
| Wishlist             | `Quero ir`, `Salvei`, `Na mira`                             | Ícone de bookmark        |
| Listas               | `Minhas listas`, `Meus rolês`                               | Perfil                   |
| Ranking              | `Top da galera`, `Quem tá no topo`                          | Aba de ranking           |
| Notificações         | `Fofoca`, `O que tá rolando`                                | Badge, tela              |
| Perfil               | `Meu perfil`, `Minha área`                                  | Bottom nav               |
| Comentários          | `Resenha`, `Papo`                                           | Threads de review        |
| Curtir               | `Amei`, `Fogo`, `Mandou bem`                                | Like button              |
| Buscar               | `Achar rango`, `Onde vou?`                                  | Search bar               |
| Filtros              | `Refinar o rolê`                                            | Bottom sheet de filtros  |
| Configurações        | `Ajustes`, `Meu esquema`                                    | Settings                 |
| Sair / Logout        | `Fui`, `Vazar`                                              | —                        |
| Carregando           | `Preparando o rolê...`, `Só um seg...`                      | Loading states           |
| Erro                 | `Deu ruim`, `Algo flopou`                                   | Error states             |

**Regras de Copy:**

- Use **emojis com moderação** — máximo 1 por elemento de UI.
- Preferência por **caixa baixa** em botões secundários (`mandar a real` vs `Mandar a Real`).
- Use **reticências** para criar suspense: `Lançando a braba...`
- Abreviações são bem-vindas: `tb`, `vc`, `mt`, `pq`, `q` (em contextos informais, não em labels principais).

---

## 1. Visão Geral do Produto

**Guru dos Restaurantes** é uma rede social de descoberta gastronômica onde o usuário acompanha reviews de amigos, criadores de conteúdo e grupos de interesse. A proposta é substituir o "Google Maps genérico" por recomendações de gente real — com tom de conversa, métricas customizáveis e descoberta social.

**Diferenciais:**

1. **Reviews segmentados por grupos** — a mesma visita pode ter avaliações diferentes dependendo do contexto (date vs. rolê com os cria).
2. **Influenciadores integrados** — não é só rede de amigos; creators gastronômicos têm perfis verificados e conteúdo próprio.
3. **Descoberta por vibe** — o app entende humor, ocasião e orçamento, não só nota geral.
4. **Gamificação leve** — badges, streaks de review e rankings dentro de grupos.

---

## 2. Arquitetura Técnica

### 2.1 Stack Android

```
UI Layer:        Jetpack Compose + Material 3 + Coil (imagens)
State Mgmt:      ViewModel + StateFlow + Compose State
Navigation:      Navigation Compose (type-safe)
DI:              Hilt
Local DB:        Room (cache offline, listas, perfil)
Remote:          Retrofit + OkHttp + Kotlinx Serialization
Images:          Coil
Maps:            OSMDroid (OpenStreetMap) ou Google Maps Compose
Auth:            Firebase Auth (Mock inicial)
Analytics:       Firebase Analytics (Mock inicial)
Notifications:   Firebase Cloud Messaging (Mock inicial)
```

### 2.2 Clean Architecture Layers

```
presentation/     → UI (Compose Screens, ViewModels, States)
  ├── components/ → Componentes reutilizáveis (ReviewCard, MetricSlider, etc.)
  ├── theme/      → Cores, Tipografia, Shapes (Material 3 custom)
  └── navigation/ → NavHost, Routes sealed class

domain/           → Regras de negócio puras
  ├── model/      → Data classes de domínio
  ├── repository/ → Interfaces de Repository
  └── usecase/    → Casos de uso (GetFeedUseCase, PostReviewUseCase, etc.)

data/             → Implementações
  ├── local/      → Room Entities, DAOs, LocalDataSource
  ├── remote/     → DTOs, ApiService, RemoteDataSource
  └── repository/ → Impls das interfaces de domain
```

### 2.3 Tema Visual (Design System)

**Paleta sugerida (Dark-first, aesthetic):**

- **Background:** `#0F0F0F` (quase preto) ou `#1A1A1A`
- **Surface:** `#242424`
- **Primary:** `#FF6B35` (laranja vibrante — energia, fome)
- **Secondary:** `#7B61FF` (roxo — criatividade, influencer)
- **Accent:** `#00D9C0` (verde água — sucesso, check)
- **Error:** `#FF453A`
- **Text Primary:** `#FFFFFF`
- **Text Secondary:** `#A0A0A0`

**Tipografia:**

- Títulos: `Display Large` — peso Bold, levemente compactado
- Body: `Body Large` — peso Regular, line-height confortável
- Labels/Slang: `Label Large` — peso Medium, caixa baixa permitida

**Shapes:**

- Cards: `16dp` rounded
- Buttons: `24dp` pill-shaped (fully rounded)
- Chips: `8dp` rounded
- Bottom Sheet: `24dp` top rounded

---

## 3. Modelos de Dados (Kotlin Data Classes)

### 3.1 Usuário & Rede Social

```kotlin
data class User(
    val id: String,
    val username: String,           // @handle
    val displayName: String,        // Nome público
    val bio: String?,               // Bio curta, pode ter links
    val avatarUrl: String?,
    val coverUrl: String?,
    val followerCount: Int,
    val followingCount: Int,
    val reviewCount: Int,
    val isVerified: Boolean,        // Influencer verificado
    val influencerTier: InfluencerTier?, // NANO, MICRO, MACRO, MEGA
    val badges: List<Badge>,        // Conquistas visíveis no perfil
    val currentStreak: Int,         // Dias seguidos com review
    val longestStreak: Int,
    val preferences: UserPreferences,
    val createdAt: Instant
)

enum class InfluencerTier {
    NANO,      // 1K-10K seguidores  → "Cria Verificado"
    MICRO,     // 10K-100K           → "Influencer de Bairro"
    MACRO,     // 100K-1M            → "Chef de Conteúdo"
    MEGA       // 1M+                → "Lenda do Rango"
}

data class UserPreferences(
    val defaultCity: String?,       // SP, Ribeirão Preto, etc.
    val notifyLikes: Boolean = true,
    val notifyComments: Boolean = true,
    val notifyGroupActivity: Boolean = true,
    val darkMode: Boolean = true,
    val slangLevel: SlangLevel = SlangLevel.MEDIUM // LOW, MEDIUM, HIGH
)

enum class SlangLevel { LOW, MEDIUM, HIGH }
```

### 3.2 Restaurante

```kotlin
data class Restaurant(
    val id: String,
    val name: String,
    val description: String?,
    val categories: List<RestaurantCategory>, // PIZZARIA, JAPONES, PODRAO, etc.
    val priceRange: PriceRange,     // $, $$, $$$, $$$$
    val address: Address,
    val coordinates: GeoPoint?,     // Lat/Lng para mapa
    val phone: String?,
    val website: String?,
    val openingHours: List<OpeningHour>?,
    val photos: List<String>,       // URLs de fotos do lugar
    val menuPhotos: List<String>,   // Fotos de cardápio (upload user)
    val averageOverallScore: Float?, // Média geral (null se sem reviews)
    val averageMetrics: Map<MetricId, Float>, // Médias por métrica
    val reviewCount: Int,
    val vibeCheckCount: Int,        // Quantos vibe checks recentes
    val isOpenNow: Boolean?,        // Calculado no backend
    val createdAt: Instant
)

data class Address(
    val street: String,
    val number: String,
    val complement: String?,
    val neighborhood: String,
    val city: String,               // São Paulo, Ribeirão Preto
    val state: String,              // SP
    val zipCode: String?,
    val fullFormatted: String       // "Rua Augusta, 1500 - Consolação, São Paulo - SP"
)

enum class PriceRange(val symbol: String, val label: String) {
    CHEAP("$", "Baratin"),
    MODERATE("$$", "Na média"),
    EXPENSIVE("$$$", "Tá caro"),
    LUXURY("$$$$", "Luxo");
}
```

### 3.3 Review (Avaliação)

```kotlin
data class Review(
    val id: String,
    val userId: String,
    val user: User?,                // Denormalizado para feed
    val restaurantId: String,
    val restaurant: Restaurant?,    // Denormalizado para feed
    val overallScore: Int?,         // 1-5, null = "só colei lá"
    val metrics: Map<MetricId, Int>, // Métricas preenchidas
    val comment: String?,
    val photos: List<String>,
    val targetDestinations: List<TargetDestination>, // PROFILE + grupos
    val receiptPhoto: String?,      // Foto da nota fiscal (opcional, mostra valor gasto)
    val totalSpent: Double?,        // Quanto gastou (opcional, social proof)
    val visitDate: LocalDate,       // Quando foi (pode ser diferente do post)
    val companions: List<String>?,  // IDs de amigos que estavam juntos
    val likes: Int,
    val comments: List<Comment>,
    val isLikedByMe: Boolean,
    val createdAt: Instant
)

sealed class TargetDestination {
    data class Profile(val userId: String) : TargetDestination()
    data class Group(val groupId: String) : TargetDestination()
}
```

### 3.4 Vibe Check (Status Rápido)

> **Feature nova:** Update rápido sem review completa. Tipo Stories do Instagram mas para status do restaurante.

```kotlin
data class VibeCheck(
    val id: String,
    val userId: String,
    val user: User?,
    val restaurantId: String,
    val status: VibeStatus,         // LOTADO, VAZIO, FILA, MUSICA_BOA, etc.
    val note: String?,              // Texto livre curto (max 100 chars)
    val photo: String?,             // Opcional
    val expiresAt: Instant,         // 4h de duração
    val createdAt: Instant
)

enum class VibeStatus(val emoji: String, val label: String) {
    EMPTY("🌵", "Tá vazio"),
    BUSY("🔥", "Tá lotado"),
    QUEUE("⏳", "Fila grande"),
    GOOD_MUSIC("🎵", "Música boa"),
    GOOD_SERVICE("👏", "Atendimento on"),
    BAD_SERVICE("😤", "Atendimento off"),
    NOISY("📢", "Barulhento"),
    ROMANTIC("💡", "Clima de date"),
    GROUP_FRIENDLY("🍻", "Bom pra tropa"),
    OVERPRICED("💸", "Tá caro hoje")
}
```

### 3.5 Grupos

```kotlin
data class Group(
    val id: String,
    val name: String,
    val description: String?,
    val coverUrl: String?,
    val adminId: String,
    val admins: List<String>,       // Múltiplos admins
    val isOpen: Boolean,            // Qualquer um pode entrar?
    val members: List<GroupMember>,
    val memberCount: Int,
    val mandatoryMetrics: List<MetricId>,
    val groupRankings: GroupRanking?, // Ranking interno do grupo
    val createdAt: Instant
)

data class GroupMember(
    val userId: String,
    val user: User?,
    val role: GroupRole,
    val joinedAt: Instant
)

enum class GroupRole { ADMIN, MODERATOR, MEMBER }

data class GroupRanking(
    val topRestaurants: List<RestaurantRanking>,
    val topReviewers: List<UserRanking>,
    val lastUpdated: Instant
)
```

### 3.6 Listas & Wishlist

```kotlin
data class CustomList(
    val id: String,
    val ownerId: String,
    val name: String,
    val description: String?,
    val iconUrl: String?,           // Emoji ou imagem custom
    val coverColor: String?,        // Hex color para fallback
    val isPublic: Boolean,
    val isWishlist: Boolean,        // true = wishlist oficial
    val collaborators: List<String>,
    val sharedWith: List<String>,   // User IDs ou Group IDs
    val themes: List<RestaurantCategory>,
    val restaurants: List<ListItem>,
    val followerCount: Int,         // Quantos seguem esta lista
    val createdAt: Instant,
    val updatedAt: Instant
)

data class ListItem(
    val restaurantId: String,
    val restaurant: Restaurant?,
    val addedBy: String,
    val note: String?,              // "Pedir o strogonoff"
    val priority: Int,              // 1-3 estrelas de prioridade
    val addedAt: Instant
)
```

### 3.7 Métricas Globais (Constants)

```kotlin
enum class MetricId(val label: String, val emoji: String, val category: MetricCategory) {
    PRICE("Preço", "💰", MetricCategory.VALUE),
    SERVICE("Atendimento", "👨‍🍳", MetricCategory.EXPERIENCE),
    LOCATION("Localização", "📍", MetricCategory.LOGISTICS),
    VIBE("Vibe", "✨", MetricCategory.ATMOSPHERE),
    AESTHETIC("Estética", "📸", MetricCategory.ATMOSPHERE),
    PORTION("Tamanho da Porção", "🍽️", MetricCategory.FOOD),
    TASTE("Sabor", "👅", MetricCategory.FOOD),
    COST_BENEFIT("Custo-benefício", "⚖️", MetricCategory.VALUE),
    VEGAN_OPTIONS("Opção Vegana", "🌱", MetricCategory.DIETARY),
    GLUTEN_FREE("Sem Glúten", "🌾", MetricCategory.DIETARY),
    WAIT_TIME("Tempo de Espera", "⏱️", MetricCategory.LOGISTICS),
    CLEANLINESS("Limpeza", "🧼", MetricCategory.EXPERIENCE),
    NOISE_LEVEL("Barulho", "🔊", MetricCategory.ATMOSPHERE),
    PARKING("Estacionamento", "🚗", MetricCategory.LOGISTICS),
    ACCESSIBILITY("Acessibilidade", "♿", MetricCategory.LOGISTICS),
    DRINKS("Bebidas", "🍹", MetricCategory.FOOD),
    DESSERTS("Sobremesas", "🍰", MetricCategory.FOOD);
}

enum class MetricCategory { VALUE, EXPERIENCE, LOGISTICS, ATMOSPHERE, FOOD, DIETARY }
```

### 3.8 Comentários & Interações

```kotlin
data class Comment(
    val id: String,
    val reviewId: String,
    val userId: String,
    val user: User?,
    val text: String,
    val parentId: String?,          // Para threads (reply)
    val likes: Int,
    val isLikedByMe: Boolean,
    val createdAt: Instant
)

data class Notification(
    val id: String,
    val type: NotificationType,
    val actor: User?,               // Quem causou
    val targetReview: Review?,      // Review relacionada
    val targetRestaurant: Restaurant?,
    val targetGroup: Group?,
    val targetList: CustomList?,
    val message: String,            // Texto pré-formatado
    val isRead: Boolean,
    val createdAt: Instant
)

enum class NotificationType {
    LIKE_REVIEW,        // "@fulano amou seu review"
    COMMENT_REVIEW,     // "@fulano comentou no seu papo"
    FOLLOW,             // "@fulano começou a te acompanhar"
    GROUP_INVITE,       // "Você foi chamado pra tropa X"
    LIST_COLLAB,        // "@fulano te adicionou como colaborador"
    LIST_SHARE,         // "@fulano compartilhou uma lista com você"
    MENTION,            // "@fulano te marcou em um review"
    STREAK_WARNING,     // "Falta 1 review pra manter seu streak! 🔥"
    BADGE_EARNED,       // "Nova conquista: Podrão Expert 🏆"
    TRENDING_RESTAURANT // "O lugar que você avaliou tá bombando!"
}
```

### 3.9 Gamificação

```kotlin
data class Badge(
    val id: String,
    val name: String,               // "Explorador de SP", "Podrão Expert"
    val description: String,
    val iconUrl: String,
    val rarity: BadgeRarity,        // COMUM, RARO, ÉPICO, LENDÁRIO
    val earnedAt: Instant?
)

enum class BadgeRarity(val color: String) {
    COMMON("#A0A0A0"),
    RARE("#4A90D9"),
    EPIC("#7B61FF"),
    LEGENDARY("#FFD700");
}

data class UserStats(
    val totalReviews: Int,
    val totalPhotos: Int,
    val totalCitiesVisited: Int,
    val totalCategoriesTried: Int,
    val favoriteCategory: RestaurantCategory?,
    val averageScoreGiven: Float,
    val longestStreak: Int,
    val currentStreak: Int,
    val totalLikesReceived: Int,
    val rankingInCity: Int?         // Posição no ranking da cidade
)
```

### 3.10 Enquetes (Feature de Grupo)

```kotlin
data class Poll(
    val id: String,
    val groupId: String,
    val createdBy: String,
    val question: String,           // "Onde a gente vai sexta?"
    val options: List<PollOption>,
    val expiresAt: Instant,
    val isMultipleChoice: Boolean,
    val createdAt: Instant
)

data class PollOption(
    val id: String,
    val restaurantId: String?,      // Pode ser restaurante ou texto livre
    val text: String,
    val votes: List<String>,        // User IDs
    val voteCount: Int
)
```

---

## 4. Funcionalidades Core (Melhoradas)

### 4.1 Fluxo de Review ("Mandar a Real")

**Tela:** Full-screen bottom sheet (navegação por steps).

**Step 1 — Onde foi?**

- Search bar com autocomplete de restaurantes (mock SP / Ribeirão Preto).
- Se não existir: botão `"Lugar novo"` → formulário de endereço completo (obrigatório: logradouro, número, bairro, cidade, estado).
- Mapa miniatura para confirmar localização.

**Step 2 — Quando e com quem?**

- Date picker (default: hoje).
- Toggle `"Fui sozinho"` / `"Fui com o bonde"`.
- Se com bonde: multi-select de amigos (busca por @handle).

**Step 3 — Pra onde vai esse review?**

- Chips selecionáveis:
  - `📱 Meu Perfil` (sempre disponível, default on)
  - `👥 [Nome do Grupo]` (só grupos que o user participa)
- **Validação dinâmica:** ao selecionar um grupo, aparece badge com as métricas obrigatórias dele.
- Se dois grupos exigem a mesma métrica, o user preenche uma vez e mapeia para ambos.
- **Warning visual:** se uma métrica obrigatória não for preenchida, o grupo fica com badge vermelho `"Faltou métrica"` e o review não será postado lá.

**Step 4 — A nota e as métricas**

- **Nota geral:** 1-5 estrelas customizadas (formato de 🌶️ pimentas ou ⭐ estrelas). Toggle `"Só colei lá"` zera a nota geral.
- **Métricas:** Grid de chips expansível. Cada métrica tem slider 1-5 com emojis dinâmicos (1 = 😤, 5 = 🤩).
- **Métricas obrigatórias:** Destacadas com borda colorida e label `"Obrigatório pra [Grupo X]"`.
- **Métricas sugeridas:** Baseadas no tipo de restaurante (japonês sugere `"Sabor"`, `"Estética"`).

**Step 5 — O papo (opcional)**

- TextField multiline (max 500 chars) com placeholder rotativo:
  - `"Conta como foi o rolê..."`
  - `"O que pediu? Valeu a pena?"`
  - `"Manda a real, sem caô"`
- Upload de fotos: grid 3x3, máximo 5 fotos. Botão `"📷 Add foto"` e `"📸 Add nota fiscal"` (separado).
- Toggle `"Mostrar quanto gastei"` + input de valor (social proof de preço real).

**Step 6 — Preview & Publicar**

- Card de preview mostrando como ficará no feed.
- Botão principal: `"Lançar a braba 🚀"`.
- Loading: `"Postando o papo..."`.
- Sucesso: animação de confete + `"Mandou bem! 🔥"`.

---

### 4.2 Feed / Home ("O que tá rolando")

**Estrutura do Feed:**

1. **Stories Rail (horizontal):** Vibe Checks ativos de amigos e influencers seguidos. Círculo com borda gradiente = tem vibe check ativo. Duração 4h.
2. **Seção "Recomendado pra vc"** (1-2 cards): Algoritmo simples baseado em categorias que o user mais avalia.
3. **Feed principal:** Reviews em ordem cronológica (default) ou por relevância.

**Card de Review:**

```
┌─────────────────────────────────────┐
│ [Avatar] @fulano · 2h · [🌶️🌶️🌶️🌶️]│
│ 📍 Rango do Zé · Consolação, SP     │
│                                     │
│ "Amassei o parmegiana, mt aesthetic │
│  e o atendimento tava on 🔥"        │
│                                     │
│ [📷][📷][📷]                        │
│                                     │
│ 💰 R$ 45/pessoa · 👥 com @ciclano   │
│                                     │
│ ❤️ 12 · 💬 4 · 📤 · 💾 Salvar       │
│ Postado em: Perfil + 🍔 Podrões SP  │
└─────────────────────────────────────┘
```

**Interações no Card:**

- **Like (❤️):** Double-tap na foto também dá like. Animação de coração.
- **Comentar (💬):** Abre bottom sheet com thread. Suporta reply.
- **Compartilhar (📤):** Gera imagem estilo Instagram Story com o review (shareable card).
- **Salvar (💾):** Salva em uma lista ou wishlist.

---

### 4.3 Ranking ("Top da Galera")

**Filtros (persistentes entre sessões):**

- **Cidade:** Dropdown (São Paulo, Ribeirão Preto, + outras futuras).
- **Alcance:** Segmented button:
  - `"Todo mundo"` (global)
  - `"Só os de verdade"` (só quem você acompanha)
  - `"Minha tropa"` (só grupos específicos — dropdown)
- **Métrica:** Bottom sheet com lista de métricas. `"Nota Geral"` é default.

**Lista:**

- Posição numerada (1, 2, 3 com medalhas 🥇🥈🥉).
- Card horizontal: foto do restaurante + nome + nota + quantidade de reviews.
- Badge `"Tá bombando 🔥"` se teve spike de reviews nas últimas 48h.

**Botão Trending (canto superior direito, ícone 🔥):**

- Alterna para modo `"Tá bombando"` — ranking por velocidade de reviews recentes + média móvel de 7 dias.
- Badge de `"Hype"` nos que estão subindo rápido.

---

### 4.4 Descoberta / Busca ("Achar Rango")

> **Feature nova:** Tela dedicada de descoberta, acessível via ícone de busca no topo do Feed.

**Modos de Busca:**

1. **Texto:** Busca por nome, categoria, bairro.
2. **Filtros Avançados (Bottom Sheet):**
   - Categorias: chips multi-select (Italiano, Japonês, Podrão, Vegano, etc.)
   - Faixa de preço: slider $ a $$$$
   - Nota mínima: 1-5
   - Métrica específica: "Quero lugar com Atendimento 4+"
   - Aberto agora: toggle
   - Distância: slider (se tiver permissão de localização)
3. **Mapa:** Mapa com pins dos restaurantes filtrados. Tap no pin abre card resumido.

**Seção "Não sabe onde ir?" (Roulette):**

- Botão grande `"🎲 Onde vou hoje?"`.
- Abre modal com spinner/roleta animada.
- Pré-filtros: `"Toquei o fodase"` (qualquer lugar) ou `"Só [categoria]"`.
- Resultado: card do restaurante sorteado com botões `"Bora!"` (abre maps) ou `"De novo 🎲"`.

---

### 4.5 Perfil ("Minha Área")

**Header:**

- Avatar (tap para editar), cover photo.
- @handle, nome, bio.
- Stats em row: `XX reviews · YY seguidores · ZZ seguindo`.
- Streak visual: 🔥 `12 dias` (se > 0).
- Badges: horizontal scroll dos badges conquistados (tap para ver detalhes).

**Action Row (ícones acima do feed):**

- `📝 Listas` → Navega para tela de listas
- `👥 Grupos` → Navega para tela de grupos
- `💾 Wishlist` → Navega para wishlist
- `🏆 Conquistas` → **Novo:** Tela de badges e estatísticas

**Tabs no Perfil:**

- `Reviews` (default): feed pessoal de reviews.
- `Fotos`: grid de todas as fotos postadas.
- `Vibe Checks`: histórico de vibe checks.
- `Curtidas`: reviews que o user curtiu.

**Perfil de Outro Usuário:**

- Se for influencer verificado: badge dourado com tier (`Cria Verificado`, `Chef de Conteúdo`, etc.).
- Botão `"Acompanhar"` / `"Deixar de acompanhar"`.
- Se acompanhar: reviews dele aparecem no seu feed.

---

### 4.6 Grupos ("Tropas")

**Tela de Grupos (acessível pelo Perfil):**

- Horizontal scroll de chips no topo: `"Todas"`, `"Administro"`, `"Membro"`.
- Lista vertical de cards de grupo: cover, nome, quantidade de membros, métricas obrigatórias.
- FAB `"Criar tropa"`.

**Dentro de um Grupo:**

- Header: cover, nome, descrição, contagem de membros.
- Tabs:
  - `Feed`: Reviews postadas no grupo.
  - `Ranking`: Ranking interno do grupo (restaurantes + membros mais ativos).
  - `Membros`: Lista com busca.
  - `Enquetes` (**novo**): Votações ativas e encerradas.
- Admin actions (se for admin): editar métricas obrigatórias, moderar, convidar.

**Criação de Grupo:**

- Nome, descrição, cover (opcional).
- Toggle: `"Tropa aberta"` (qualquer um entra) vs `"Tropa fechada"` (convite).
- Seleção de métricas obrigatórias (da lista global).

---

### 4.7 Listas & Wishlist ("Meus Rolês")

**Tela de Listas:**

- Segmented control: `"Minhas"` / `"Colaboro"` / `"Seguindo"`.
- Card de lista: cover/icon, nome, quantidade de lugares, privacidade (🔒 / 🌍).
- FAB `"Nova lista"`.

**Criação/Edição de Lista:**

- Nome, descrição.
- Ícone: emoji picker ou upload de imagem.
- Cor de capa (color picker simples).
- Temas: multi-select de categorias.
- Privacidade: toggle `"Pública"` / `"Privada"`.
- Se privada: `"Compartilhar com..."` → busca de usuários ou grupos.
- Colaboradores: busca de usuários para adicionar.

**Dentro de uma Lista:**

- Lista de restaurantes com nota, foto, nota pessoal.
- Reorder por drag-and-drop.
- Tap no restaurante → abre perfil do lugar.
- FAB `"Add lugar"` → busca.

---

### 4.8 Vibe Check ("Como tá o rolê?")

> **Feature nova e diferencial.** Acesso rápido via FAB secundário ou dentro do perfil do restaurante.

**Fluxo:**

1. User seleciona restaurante (ou está na página dele).
2. Tap em `"Como tá?"`.
3. Bottom sheet com grid de status (Vazio, Lotado, Fila, Música boa, etc.).
4. Opcional: foto + texto curto (100 chars).
5. Posta. Dura 4h no feed de stories do restaurante e dos amigos.

**Visualização:**

- Stories rail no topo do Feed (amigos).
- Aba `"Agora"` no perfil do restaurante: lista de vibe checks ativos.
- Mapa: pins pulsantes em restaurantes com vibe check recente.

---

### 4.9 Notificações ("Fofoca")

**Tela de Notificações:**

- Agrupadas por data: `"Hoje"`, `"Ontem"`, `"Esta semana"`.
- Tipos visuais distintos por categoria:
  - Social (likes, follows): ícone de coração.
  - Grupos: ícone de pessoas.
  - Conquistas: ícone de troféu dourado.
  - Sistema: ícone de app.
- Tap na notificação navega para o contexto (review, perfil, grupo, etc.).
- Swipe para marcar como lida / deletar.

---

### 4.10 Shareable Cards ("Compartilhar Review")

> **Feature nova:** Geração de imagem para compartilhar no Instagram/WhatsApp.

**Ao tapar em Compartilhar num review:**

- Bottom sheet com opções:
  - `"Gerar card"` → Preview de imagem estilo Story (9:16).
  - `"Copiar link"`.
  - `"Mandar no WhatsApp"`.
- O card contém: foto do restaurante, nota em pimentas, quote do review, @handle do app, QR code para baixar.
- Cores do card seguem o tema do app.

---

## 5. Navegação & UI Architecture

### 5.1 Bottom Navigation

```
┌─────┬─────┬─────────┬─────┬─────┐
│ 🏠  │ 🏆  │   ➕    │ 🔔  │ 👤  │
│Home │Rank │ Review  │Notif│Perfil│
└─────┴─────┴─────────┴─────┴─────┘
```

- **Home:** Feed principal.
- **Ranking:** Leaderboards.
- **Review (FAB central):** Ícone fino `+` ou `✎`, levemente elevado, com glow sutil na cor primary.
- **Notificações:** Badge vermelho com contador.
- **Perfil:** Meu perfil.

### 5.2 Telas Principais (Routes)

```kotlin
sealed class Route(val path: String) {
    object Home : Route("home")
    object Ranking : Route("ranking")
    object ReviewFlow : Route("review") // Bottom sheet / dialog
    object Notifications : Route("notifications")
    object Profile : Route("profile/{userId}")
    object RestaurantDetail : Route("restaurant/{restaurantId}")
    object GroupDetail : Route("group/{groupId}")
    object ListDetail : Route("list/{listId}")
    object Search : Route("search")
    object Roulette : Route("roulette")
    object Badges : Route("badges/{userId}")
    object Settings : Route("settings")
    object Onboarding : Route("onboarding")
}
```

### 5.3 Onboarding (Primeira Experiência)

> **Novo:** Fluxo de onboarding essencial para reter Gen Z.

**Step 1 — Bem-vindo:**

- Animação de comida/estrelas.
- Texto: `"Bem-vindo ao Rango Social 👋"`
- Sub: `"Onde sua tropa descobre os melhores rolês."`

**Step 2 — Escolha seu estilo:**

- Cards selecionáveis (single choice):
  - `"🍔 Sou do bonde"` — social, curte ir com amigos.
  - `"📸 Influencer"` — quer postar reviews detalhados.
  - `"🍽️ Foodie"` — focado em qualidade e experiência.
  - `"💸 Baratin"` — focado em custo-benefício.
- Isso influencia as métricas sugeridas e o feed inicial.

**Step 3 — Escolha sua cidade:**

- Dropdown: São Paulo, Ribeirão Preto.
- Toggle `"Usar minha localização"`.

**Step 4 — Siga gente:**

- Lista de influencers mock (gastronômicos fictícios brasileiros).
- Toggle follow rápido.
- `"Pular"` disponível.

**Step 5 — Pronto:**

- `"Bora explorar! 🚀"`.

---

## 6. Dados Mock (Restaurantes)

**Cidades permitidas:** São Paulo (SP) e Ribeirão Preto (SP).

**Gerar ~30 restaurantes mock por cidade** com variação de:

- Categorias: Podrão, Japonês, Italiano, Pizzaria, Hamburgeria, Vegano, Churrascaria, Cafeteria, Bar, Doceria.
- Bairros de SP: Pinheiros, Vila Madalena, Consolação, Centro, Liberdade, Itaim Bibi, Jardins, Moema.
- Bairros de Ribeirão: Centro, Jardim Paulista, Vila Seixas, Ribeirânia.
- Faixas de preço distribuídas.
- Endereços completos realistas (fictícios mas plausíveis).
- Fotos: usar placeholders via `https://picsum.photos/` ou `https://placehold.co/` com seed por ID.

**Influencers Mock:**

- Criar 5-8 perfis de influencers fictícios brasileiros com:
  - Nome de handle estilo TikTok/Instagram.
  - Tier (Nano a Macro).
  - Bio com gírias.
  - 3-5 reviews mock cada um.

---

## 7. Lógicas de Negócio Importantes

### 7.1 Cálculo de Ranking

```
score = (média_geral * 0.4) + (média_métrica_selecionada * 0.3) + (fator_reviews_recentes * 0.2) + (fator_engajamento * 0.1)

fator_reviews_recentes = reviews_ultimos_7_dias / reviews_total (normalizado 0-1)
fator_engajamento = (likes + comentarios) / reviews_total (normalizado 0-1)
```

### 7.2 Trending / Hype

```
hype_score = (reviews_ultimas_48h * 2) + (media_movel_7_dias - media_movel_14_dias)
Se hype_score > threshold → badge "Tá bombando 🔥"
```

### 7.3 Streak de Reviews

- Contar dias consecutivos com pelo menos 1 review.
- Reset se passar 48h sem review.
- Notificação push mock: `"Falta 1 review pra manter seu streak de 5 dias! 🔥"`.

### 7.4 Métricas Obrigatórias (Regras)

- Ao selecionar grupos no review, fazer UNION das métricas obrigatórias.
- Se o user preenche `"Atendimento"` e dois grupos exigem, mapear para ambos.
- Se o user NÃO preenche uma métrica obrigatória:
  - O grupo fica com badge vermelho.
  - Ao publicar, o review vai para os destinos válidos (perfil + grupos satisfeitos).
  - Snackbar: `"Review postado, mas faltou métrica pra [Grupo X]"`.

### 7.5 Feed Algorithm (Simples)

```
feed = (
  reviews_de_quem_eu_acompanho (peso 1.0)
  + reviews_de_grupos_que_participo (peso 0.8)
  + reviews_de_influencers_verificados (peso 0.6)
  + recomendacoes_por_categoria_favorita (peso 0.4)
) ordenado por timestamp DESC
```

---

## 8. Fases de Desenvolvimento (Execução)

> **Instrução para o AI Dev:** Execute por fases. Aguarde aprovação do usuário antes de avançar.

### Fase 1: Setup & Tema Visual

- [ ] Criar projeto Android (Empty Activity, minSdk 26, targetSdk 35).
- [ ] Configurar Gradle: Compose BOM, Navigation, Hilt, Room, Retrofit, Coil, Kotlinx Serialization.
- [ ] Implementar tema customizado (Material 3) com as cores definidas.
- [ ] Configurar tipografia e shapes.
- [ ] Criar estrutura de pacotes Clean Architecture.
- [ ] Configurar Hilt (Application class, modules).
- [ ] Criar sistema de strings em pt-BR (`strings.xml` com todo o glossário).
- [ ] Criar `NavHost` com as 5 rotas principais do bottom nav.
- [ ] Implementar Bottom Navigation com FAB central.

### Fase 2: Modelos & Dados Mock

- [ ] Implementar todas as data classes de domínio (User, Restaurant, Review, etc.).
- [ ] Criar Room Entities e DAOs para cache local.
- [ ] Criar FakeRepository com dados mock:
  - [ ] 30 restaurantes em SP.
  - [ ] 30 restaurantes em Ribeirão Preto.
  - [ ] 8 influencers mock com reviews.
  - [ ] 3 grupos mock com métricas obrigatórias.
  - [ ] 5 listas mock (públicas e privadas).
- [ ] Implementar Use Cases básicos (GetFeed, GetRestaurants, etc.).
- [ ] Testar injeção de dependências e fluxo de dados.

### Fase 3: Onboarding & Autenticação (Mock)

- [ ] Tela de onboarding (4 steps: boas-vindas, estilo, cidade, seguir).
- [ ] Sistema de preferências locais (DataStore) para lembrar onboarding.
- [ ] Mock de login (não precisa de backend real, apenas estado de "logado").

### Fase 4: Feed & Navegação Social

- [ ] Implementar tela Home com Stories Rail (Vibe Checks mock).
- [ ] Implementar ReviewCard com todas as interações (like, comentar, compartilhar, salvar).
- [ ] Implementar tela de Search com filtros.
- [ ] Implementar tela de Notificações com dados mock.
- [ ] Implementar sistema de comentários (thread simples).

### Fase 5: Fluxo de Review Completo

- [ ] Tela de busca de restaurante (Step 1).
- [ ] Formulário de novo restaurante (endereço completo obrigatório).
- [ ] Seleção de destinos (perfil + grupos) com validação de métricas.
- [ ] Tela de métricas com sliders e obrigatórias dinâmicas.
- [ ] Tela de comentário + fotos + valor gasto.
- [ ] Preview e publicação com animação de sucesso.
- [ ] Integrar com FakeRepository para persistir review.

### Fase 6: Ranking & Descoberta

- [ ] Tela de Ranking com filtros (cidade, alcance, métrica).
- [ ] Lógica de cálculo de ranking com dados mock.
- [ ] Modo Trending/Hype com badge visual.
- [ ] Tela de Mapa com pins de restaurantes.
- [ ] Feature "Onde vou hoje?" (Roulette) com animação.

### Fase 7: Perfil, Grupos & Listas

- [ ] Tela de Perfil (próprio e de outros usuários).
- [ ] Sistema de follow/unfollow.
- [ ] Sub-telas: Listas, Grupos, Wishlist.
- [ ] Criação e edição de listas (com colaboradores e privacidade).
- [ ] Tela de Grupo com tabs (Feed, Ranking, Membros, Enquetes).
- [ ] Criação de grupo com métricas obrigatórias.

### Fase 8: Gamificação & Polimento

- [ ] Sistema de badges (visuais, não precisa de lógica complexa ainda).
- [ ] Streak visual no perfil.
- [ ] Tela de conquistas/estatísticas.
- [ ] Vibe Check: fluxo de criação e visualização no Stories Rail.
- [ ] Shareable Cards: geração de imagem do review.
- [ ] Animações: transições entre telas, skeleton loaders, micro-interações.
- [ ] Revisão completa de copy: garantir que TODO texto segue o glossário pt-BR / gírias.
- [ ] Testes de usabilidade: verificar se fluxos fazem sentido.

---

## 9. Checklist de Qualidade (Definition of Done)

- [ ] App roda em modo offline (cache Room funcional).
- [ ] Todas as telas têm estados de Loading, Empty e Error.
- [ ] Navegação por gestos funciona corretamente (back button, swipe).
- [ ] Tema dark é padrão e consistente.
- [ ] Nenhum texto em inglês visível ao usuário.
- [ ] Gírias estão naturais e não forçadas.
- [ ] Fotos carregam com placeholder e tratamento de erro.
- [ ] Bottom sheet não quebra com teclado aberto.
- [ ] Scroll performance é fluido (LazyColumn/LazyRow otimizados).
- [ ] Acessibilidade: content descriptions, tamanhos de touch target.

---

## 10. Roadmap Futuro (Pós-MVP)

1. **Integração real com Google Places API** para busca de restaurantes reais.
2. **Upload de fotos** para Firebase Storage (atualmente mock).
3. **Autenticação real** (Google Sign-In, Apple Sign-In).
4. **Push notifications** reais via Firebase.
5. **Algoritmo de recomendação** com ML (TensorFlow Lite on-device).
6. **Reservas / Fila virtual** integrada com restaurantes parceiros.
7. **Cupons e parcerias** (monetização).
8. **Modo "Rolê em Grupo"** — plano de visita com votação em tempo real.
9. **Integração com Instagram/TikTok** — embed de reels nos reviews.
10. **Versão iOS** (SwiftUI) compartilhando lógica via KMP (Kotlin Multiplatform).

---

_Documento gerado para desenvolvimento assistido por IA. Mantenha o tom casual, o código limpo e o usuário feliz. Bora codar! 🚀_
