package com.gurudosrestaurantes.domain.model

import kotlinx.datetime.DayOfWeek
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalTime

enum class RestaurantCategory(val label: String, val emoji: String) {
    PODRAO("Podrão", "🍔"),
    JAPONES("Japonês", "🍣"),
    ITALIANO("Italiano", "🍝"),
    PIZZARIA("Pizzaria", "🍕"),
    HAMBURGERIA("Hamburgeria", "🍔"),
    VEGANO("Vegano", "🌱"),
    CHURRASCARIA("Churrascaria", "🥩"),
    CAFETERIA("Cafeteria", "☕"),
    BAR("Bar", "🍻"),
    DOCERIA("Doceria", "🍰"),
    BRASILEIRO("Brasileiro", "🍛"),
    CHINESE("Chinês", "🥡"),
    MEXICANO("Mexicano", "🌮"),
    SAUDAVEL("Saudável", "🥗"),
    ARABE("Árabe", "🥙");
}

enum class PriceRange(val symbol: String, val label: String) {
    CHEAP("$", "Baratin"),
    MODERATE("$$", "Na média"),
    EXPENSIVE("$$$", "Tá caro"),
    LUXURY("$$$$", "Luxo");
}

data class GeoPoint(
    val latitude: Double,
    val longitude: Double,
)

data class Address(
    val street: String,
    val number: String,
    val complement: String? = null,
    val neighborhood: String,
    val city: String,
    val state: String,
    val zipCode: String? = null,
    val fullFormatted: String,
)

data class OpeningHour(
    val dayOfWeek: DayOfWeek,
    val opensAt: LocalTime,
    val closesAt: LocalTime,
)

data class Restaurant(
    val id: String,
    val name: String,
    val description: String? = null,
    val categories: List<RestaurantCategory>,
    val priceRange: PriceRange,
    val address: Address,
    val coordinates: GeoPoint? = null,
    val phone: String? = null,
    val website: String? = null,
    val openingHours: List<OpeningHour>? = null,
    val photos: List<String> = emptyList(),
    val menuPhotos: List<String> = emptyList(),
    val averageOverallScore: Float? = null,
    val averageMetrics: Map<MetricId, Float> = emptyMap(),
    val reviewCount: Int = 0,
    val vibeCheckCount: Int = 0,
    val isOpenNow: Boolean? = null,
    val createdAt: Instant,
)
