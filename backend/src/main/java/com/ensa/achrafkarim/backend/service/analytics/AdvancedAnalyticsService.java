package com.ensa.achrafkarim.backend.service.analytics;
// ============================================
// INTERFACE: AdvancedAnalyticsService
// Méthodes de Statistiques et d'Analyse Avancées
// ============================================

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.*;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;

import java.time.LocalDateTime;
import java.util.List;

public interface
AdvancedAnalyticsService {

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
    double calculateSalesGrowthRate(LocalDateTime period1Start, LocalDateTime period1End, LocalDateTime period2Start, LocalDateTime period2End);

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
    public List<PurchaseFrequencyAnalysisDto> analyzePurchaseFrequency();

    // ========================================
    // 2. ANALYSES DE PRODUITS (PRODUCT ANALYTICS)
    // ========================================

    /**
     * Analyse ABC des produits (Pareto Analysis)
     * Classe A: 20% produits générant 80% revenu
     * Classe B: 30% produits générant 15% revenu
     * Classe C: 50% produits générant 5% revenu
     */
    ABCAnalysisDto performABCAnalysis();

    /**
     * Analyse de corrélation entre produits (Product Affinity Analysis)
     * Identifie quels produits sont souvent achetés ensemble
     */
    ProductAffinityAnalysisDto analyzeProductAffinity(int minSupportCount);

    /**
     * Market Basket Analysis (MBA)
     * Association rules: Si produit A acheté → probabilité d'acheter B
     */
    List<AssociationRuleDto> performMarketBasketAnalysis(double minSupport, double minConfidence);

    /**
     * Analyse du cycle de vie produit (Product Lifecycle Analysis)
     * Phases : Introduction, Croissance, Maturité, Déclin
     */
    ProductLifecycleDto analyzeProductLifecycle(Long productId);

    /**
     * Calcul du taux de rotation des stocks (Inventory Turnover Ratio)
     * Formule : Coût des ventes / Stock moyen
     */
    //double calculateInventoryTurnoverRatio(Long productId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Analyse de performance par catégorie
     */
    //List<CategoryPerformanceDto> analyzeCategoryPerformance(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Identification des produits à forte/faible marge
     */
    //ProfitMarginAnalysisDto analyzeProfitMargins();

    /**
     * Analyse de la cannibalisation entre produits
     * Détecte si un produit "vole" les ventes d'un autre
     */
    //CannibalizationAnalysisDto analyzeProductCannibalization();

    // ========================================
    // 3. ANALYSES DE PRIX (PRICING ANALYTICS)
    // ========================================

    /**
     * Analyse d'élasticité des prix (Price Elasticity)
     * Mesure la sensibilité de la demande aux changements de prix
     * Formule : (% changement quantité) / (% changement prix)
     */
    //PriceElasticityDto calculatePriceElasticity(Long productId);

    /**
     * Optimisation dynamique des prix (Dynamic Pricing)
     * Recommande le prix optimal basé sur demande, stock, concurrence
     */
    //OptimalPriceDto calculateOptimalPrice(Long productId);

    /**
     * Analyse de l'impact des promotions
     * Mesure l'effet des réductions sur les ventes
     */
    //PromotionImpactAnalysisDto analyzePromotionImpact(Long promotionId);

    /**
     * Analyse comparative des prix (Competitive Pricing Analysis)
     */
    //CompetitivePricingDto analyzeCompetitivePricing(Long productId);

    /**
     * Calcul du prix psychologique optimal
     * Trouve le prix maximisant acceptation clients et profit
     */
    //PsychologicalPricingDto calculatePsychologicalPrice(Long productId);

    // ========================================
    // 4. ANALYSES CLIENT (CUSTOMER ANALYTICS)
    // ========================================

    /**
     * Analyse RFM (Recency, Frequency, Monetary)
     * Segmente les clients selon :
     * - R : Dernière date d'achat
     * - F : Fréquence d'achat
     * - M : Montant dépensé
     */
    //List<RFMSegmentDto> performRFMAnalysis();

    /**
     * Calcul de la valeur vie client (Customer Lifetime Value - CLV)
     * Formule : (Valeur moyenne achat × Fréquence × Durée vie client)
     */
    double calculateCustomerLifetimeValue(Long userId);

    /**
     * Analyse du taux de rétention (Retention Rate)
     * Formule : ((Clients fin - Nouveaux clients) / Clients début) × 100
     */
    //double calculateRetentionRate(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Analyse du taux de churn (Churn Rate)
     * Pourcentage de clients perdus sur une période
     */
    //ChurnAnalysisDto analyzeChurnRate(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Segmentation client automatique (K-Means Clustering)
     */
    List<CustomerSegmentDto> segmentCustomers(int numberOfSegments);

    /**
     * Analyse du comportement d'achat par segment
     */
    //SegmentBehaviorAnalysisDto analyzeBehaviorBySegment(String segmentName);

    /**
     * Prédiction du churn client (Churn Prediction)
     * Identifie les clients à risque de partir
     */
    //List<ChurnPredictionDto> predictCustomerChurn();

    /**
     * Analyse du Net Promoter Score (NPS)
     * Basé sur les avis : Promoteurs (9-10), Passifs (7-8), Détracteurs (0-6)
     */
    //NPSAnalysisDto calculateNPS();

    // ========================================
    // 5. ANALYSES DE PERFORMANCE (PERFORMANCE METRICS)
    // ========================================

    /**
     * Calcul des KPIs principaux (Key Performance Indicators)
     * Revenue, Profit, Conversion Rate, AOV, etc.
     */
    //DashboardKPIsDto calculateMainKPIs(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Analyse de conversion (Conversion Funnel Analysis)
     * Vues → Clics → Paniers → Achats
     */
    //ConversionFunnelDto analyzeConversionFunnel(LocalDateTime startDate, LocalDateTime endDate);



    /**
     * Analyse de la performance par canal de vente
     */
    //List<ChannelPerformanceDto> analyzeChannelPerformance(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Calcul du taux de marge brute
     * Formule : ((Ventes - Coût des ventes) / Ventes) × 100
     */
    //double calculateGrossMarginRate(LocalDateTime startDate, LocalDateTime endDate);

    // ========================================
    // 6. ANALYSES PRÉDICTIVES (PREDICTIVE ANALYTICS)
    // ========================================

    /**
     * Prédiction de la position future dans le classement
     */
    //RankingPredictionDto predictFutureRanking(Long productId, int daysAhead);

    /**
     * Identification des best-sellers potentiels
     * Utilise ML pour détecter les produits qui vont exploser
     */
    //List<PotentialBestSellerDto> identifyPotentialBestSellers();

    /**
     * Prédiction de rupture de stock (Stock-out Prediction)
     */
    //List<StockoutPredictionDto> predictStockouts(int daysAhead);

    /**
     * Recommandation de réapprovisionnement
     * Calcule la quantité optimale à commander
     */
    //ReplenishmentRecommendationDto recommendReplenishment(Long productId);

    /**
     * Détection d'anomalies dans les ventes
     * Identifie les pics ou chutes inhabituels
     */
    //List<AnomalyDetectionDto> detectSalesAnomalies(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Prédiction de la demande future (Demand Forecasting)
     */
    //DemandForecastDto forecastDemand(Long productId, int daysAhead);

    // ========================================
    // 7. ANALYSES COMPARATIVES (COMPARATIVE ANALYTICS)
    // ========================================

    /**
     * Comparaison de performance entre périodes
     * Exemple : Ce mois vs mois dernier
     */
    //PeriodComparisonDto comparePeriods(LocalDateTime period1Start, LocalDateTime period1End,LocalDateTime period2Start, LocalDateTime period2End);

    /**
     * Benchmarking de produits similaires
     */
    //ProductBenchmarkDto benchmarkProduct(Long productId, List<Long> competitorIds);

    /**
     * Analyse d'écart (Variance Analysis)
     * Compare résultats réels vs prévisions/objectifs
     */
    //VarianceAnalysisDto analyzeVariance(LocalDateTime startDate, LocalDateTime endDate);

    // ========================================
    // 8. ANALYSES DE CONTENU (CONTENT ANALYTICS)
    // ========================================

    /**
     * Analyse de sentiment des avis clients
     * Utilise NLP pour classifier : Positif, Neutre, Négatif
     */
    List<ReviewsSentimentAnalysisDto> analyzeSentiment();

    List<ProductDto> getSimilarProductsByProduct(Long productId);

    /**
     * Extraction de topics des avis (Topic Modeling)
     * Identifie les thèmes récurrents dans les commentaires
     */
    //List<TopicDto> extractReviewTopics(Long productId);

    /**
     * Analyse de corrélation note/ventes
     * Mesure l'impact des notes sur les performances
     */
    //RatingSalesCorrelationDto analyzeRatingSalesCorrelation();

    /**
     * Détection de faux avis (Fake Review Detection)
     */
    //List<SuspiciousReviewDto> detectSuspiciousReviews(Long productId);

    // ========================================
    // 9. ANALYSES GÉOGRAPHIQUES (GEO ANALYTICS)
    // ========================================

    /**
     * Analyse des ventes par région géographique
     */
    //List<GeographicSalesDto> analyzeSalesByRegion();

    /**
     * Identification des marchés à fort potentiel
     */
    //List<MarketPotentialDto> identifyHighPotentialMarkets();

    /**
     * Analyse de pénétration de marché
     */
    //MarketPenetrationDto analyzeMarketPenetration(String region);

    // ========================================
    // 10. TABLEAUX DE BORD ET RAPPORTS
    // ========================================

    /**
     * Génération du dashboard exécutif complet
     */
    //ExecutiveDashboardDto generateExecutiveDashboard(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Rapport d'analyse complet pour un produit
     */
    //ComprehensiveProductReportDto generateProductReport(Long productId);

    /**
     * Rapport d'analyse de portefeuille produits
     */
    //PortfolioAnalysisReportDto generatePortfolioReport();

    /**
     * Scorecard de performance globale
     */
    //PerformanceScorecardDto generatePerformanceScorecard(LocalDateTime startDate, LocalDateTime endDate);
}
