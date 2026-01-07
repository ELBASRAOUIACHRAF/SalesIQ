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

    SalesTrendAnalysisDto analyzeSalesTrend(LocalDateTime startDate, LocalDateTime endDate, TimeGranularity granularity);

    double calculateSalesGrowthRate(LocalDateTime period1Start, LocalDateTime period1End, LocalDateTime period2Start, LocalDateTime period2End);

    SeasonalityAnalysisDto analyzeSeasonality(LocalDateTime startDate, LocalDateTime endDate);

    SalesForecastDto forecastSales(int daysAhead);

    CohortAnalysisDto analyzeCohorts(LocalDateTime startDate, LocalDateTime endDate);

    double calculateAverageBasketValue(LocalDateTime startDate, LocalDateTime endDate);

    public List<PurchaseFrequencyAnalysisDto> analyzePurchaseFrequency();

    // ========================================
    // 2. ANALYSES DE PRODUITS (PRODUCT ANALYTICS)
    // ========================================

    ABCAnalysisDto performABCAnalysis();

    ProductAffinityAnalysisDto analyzeProductAffinity(int minSupportCount);

    /**
     * Market Basket Analysis (MBA)
     * Association rules: Si produit A acheté → probabilité d'acheter B
     */
    List<AssociationRuleDto> performMarketBasketAnalysis(double minSupport, double minConfidence);

    ProductLifecycleDto analyzeProductLifecycle(Long productId);

    double calculateInventoryTurnoverRatio(Long productId, LocalDateTime startDate, LocalDateTime endDate);

    List<CategoryPerformanceDto> analyzeCategoryPerformance(LocalDateTime startDate, LocalDateTime endDate);

    List<ProfitMarginAnalysisDto> analyzeProfitMargins();

    // ========================================
    // 3. ANALYSES DE PRIX (PRICING ANALYTICS)
    // ========================================

    //PriceElasticityDto calculatePriceElasticity(Long productId);

    //OptimalPriceDto calculateOptimalPrice(Long productId);


    public PromotionImpactAnalysisDto analyzePromotionImpact();

    /** future updates*/
    //CompetitivePricingDto analyzeCompetitivePricing(Long productId);


    // ========================================
    // 4. ANALYSES CLIENT (CUSTOMER ANALYTICS)
    // ========================================

    List<RFMSegmentDto> performRFMAnalysis();

    double calculateCustomerLifetimeValue(Long userId);

    double calculateRetentionRate(LocalDateTime startDate, LocalDateTime endDate);

    ChurnAnalysisDto analyzeChurnRate(LocalDateTime startDate, LocalDateTime endDate);

    List<CustomerSegmentDto> segmentCustomers(int numberOfSegments);

    SegmentBehaviorAnalysisDto analyzeBehaviorBySegment(String segmentName);

    List<ChurnPredictionDto> predictCustomerChurn();

    //NPSAnalysisDto calculateNPS();

    // ========================================
    // 5. ANALYSES DE PERFORMANCE (PERFORMANCE METRICS)
    // ========================================

    DashboardKPIsDto calculateMainKPIs(LocalDateTime startDate, LocalDateTime endDate);

    //ConversionFunnelDto analyzeConversionFunnel(LocalDateTime startDate, LocalDateTime endDate);

    //List<ChannelPerformanceDto> analyzeChannelPerformance(LocalDateTime startDate, LocalDateTime endDate);

    //double calculateGrossMarginRate(LocalDateTime startDate, LocalDateTime endDate);

    // ========================================
    // 6. ANALYSES PRÉDICTIVES (PREDICTIVE ANALYTICS)
    // ========================================

    RankingPredictionDto predictFutureRanking(Long productId, int daysAhead);

    List<PotentialBestSellerDto> identifyPotentialBestSellers();

    List<StockoutPredictionDto> predictStockouts(int daysAhead);

    //ReplenishmentRecommendationDto recommendReplenishment(Long productId);

    List<AnomalyDetectionDto> detectSalesAnomalies(LocalDateTime startDate, LocalDateTime endDate);

    //DemandForecastDto forecastDemand(Long productId, int daysAhead);

    // ========================================
    // 7. ANALYSES COMPARATIVES (COMPARATIVE ANALYTICS)
    // ========================================

    PeriodComparisonDto comparePeriods(LocalDateTime period1Start, LocalDateTime period1End,LocalDateTime period2Start, LocalDateTime period2End);

    //ProductBenchmarkDto benchmarkProduct(Long productId, List<Long> competitorIds);


    VarianceAnalysisDto analyzeVariance(LocalDateTime startDate, LocalDateTime endDate);
    // ========================================
    // 8. ANALYSES DE CONTENU (CONTENT ANALYTICS)
    // ========================================

    List<ReviewsSentimentAnalysisDto> analyzeSentiment();

    List<ProductDto> getSimilarProductsByProduct(Long productId);


    List<TopicDto> extractReviewTopics(Long productId);


    //RatingSalesCorrelationDto analyzeRatingSalesCorrelation();

    //List<SuspiciousReviewDto> detectSuspiciousReviews(Long productId);

    // ========================================
    // 9. ANALYSES GÉOGRAPHIQUES (GEO ANALYTICS)
    // for future updates
    // ========================================

    //List<GeographicSalesDto> analyzeSalesByRegion();

    //List<MarketPotentialDto> identifyHighPotentialMarkets();

    //MarketPenetrationDto analyzeMarketPenetration(String region);

    // ========================================
    // 10. TABLEAUX DE BORD ET RAPPORTS
    // ========================================
    ExecutiveDashboardDto generateExecutiveDashboard(LocalDateTime startDate, LocalDateTime endDate);

    ComprehensiveProductReportDto generateProductReport(Long productId);

    PortfolioAnalysisReportDto generatePortfolioReport();

    PerformanceScorecardDto generatePerformanceScorecard(LocalDateTime startDate, LocalDateTime endDate);
}
