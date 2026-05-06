package com.gurudosrestaurantes.domain.model

/** Categories used to group metrics in the UI. */
enum class MetricCategory(val label: String) {
    VALUE("Valor"),
    EXPERIENCE("Experiência"),
    LOGISTICS("Logística"),
    ATMOSPHERE("Atmosfera"),
    FOOD("Comida"),
    DIETARY("Dietas")
}

/** Global metric catalogue. Reviewers tick these as 1–5 sliders. */
enum class MetricId(
    val label: String,
    val emoji: String,
    val category: MetricCategory,
) {
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
