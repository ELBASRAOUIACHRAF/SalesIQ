package com.ensa.achrafkarim.backend.service.analytics;

public interface AdvancedAnalyticsService {

    // ========================================
    // 1. ANALYSES DE VENTES (SALES ANALYTICS)
    // ========================================

    /**
     * Analyse des tendances de ventes sur une période
     * Retourne : évolution quotidienne/hebdomadaire/mensuelle
     */
    SalesTrendAnalysisDto analyzeSalesTrend(LocalDateTime startDate, LocalDateTime endDate, TimeGranularity granularity);

    /**
     * Calcul du taux de croissance des ventes (Growth Rate)
     * Formule : ((Ventes actuelles - Ventes précédentes) / Ventes précédentes) * 100
     */
    double calculateSalesGrowthRate(LocalDateTime period1Start, LocalDateTime period1End,
                                    LocalDateTime period2Start, LocalDateTime period2End);

    /**
     * Analyse de saisonnalité des ventes (Seasonal Decomposition)
     * Identifie les patterns saisonniers, tendances et cycles
     */
    SeasonalityAnalysisDto analyzeSeasonality(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Prévision des ventes futures (Sales Forecasting)
     * Utilise des modèles de séries temporelles (ARIMA, Moving Average)
     */
    SalesForecastDto forecastSales(int daysAhead);

    /**
     * Analyse de cohort (Cohorte Analysis)
     * Groupe les clients par date d'inscription et analyse leur comportement
     */
    CohortAnalysisDto analyzeCohorts(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Calcul du panier moyen (Average Basket/Cart Value)
     */
    double calculateAverageBasketValue(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Analyse de la fréquence d'achat par client
     */
    PurchaseFrequencyAnalysisDto analyzePurchaseFrequency();

