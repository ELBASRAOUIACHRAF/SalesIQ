package com.ensa.achrafkarim.backend.web.analyticsController;

import com.ensa.achrafkarim.backend.dto.ProductDto;
import com.ensa.achrafkarim.backend.dto.analyticsDto.*;
import com.ensa.achrafkarim.backend.enums.analyticsEnum.TimeGranularity;
import com.ensa.achrafkarim.backend.service.SaleService;
import com.ensa.achrafkarim.backend.service.analytics.AdvancedAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AdvancedAnalyticsService advancedAnalyticsService;
    private final SaleService saleService;

    /**
     * Helper method to parse date strings flexibly
     * Accepts both "2024-01-01" and "2024-01-01T00:00:00" formats
     */
    private LocalDateTime parseDate(String dateStr, boolean endOfDay) {
        if (dateStr == null || dateStr.isEmpty()) {
            return endOfDay ? LocalDateTime.now() : LocalDateTime.now().minusDays(30);
        }

        try {
            // Try parsing as LocalDateTime first
            if (dateStr.contains("T")) {
                return LocalDateTime.parse(dateStr);
            }
            // Parse as LocalDate and convert to LocalDateTime
            LocalDate date = LocalDate.parse(dateStr);
            return endOfDay ? date.atTime(LocalTime.MAX) : date.atStartOfDay();
        } catch (Exception e) {
            return endOfDay ? LocalDateTime.now() : LocalDateTime.now().minusDays(30);
        }
    }

    @GetMapping("/forecastSales")
    public ResponseEntity<SalesForecastDto> getForecast(
            @RequestParam(defaultValue = "7") int daysAhead
    ) {
        try {
            SalesForecastDto forecast = advancedAnalyticsService.forecastSales(daysAhead);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            System.err.println("Forecasting error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/segmentCustomers")
    public void segmentationOfCustomers(@RequestParam int nbSegments) {
        advancedAnalyticsService.segmentCustomers(nbSegments);
    }


    /**
     * Step 1: Backend Controller Endpoint for Sales Trend Analysis
     * This endpoint receives HTTP GET requests and calls the service method
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/sales-trend")
    public ResponseEntity<SalesTrendAnalysisDto> getSalesTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "DAILY") TimeGranularity granularity
    ) {
        try {
            SalesTrendAnalysisDto result = advancedAnalyticsService.analyzeSalesTrend(startDate, endDate, granularity);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Sales trend analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Calculate Sales Growth Rate between two periods
     * Compares revenue of period2 vs period1 and returns percentage change
     * <p>
     * Formula: ((Revenue2 - Revenue1) / Revenue1) * 100
     * <p>
     * Example: period1 revenue = $1000, period2 revenue = $1200
     * Growth rate = ((1200-1000)/1000)*100 = 20%
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/growth-rate")
    public ResponseEntity<Double> getSalesGrowthRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime period1Start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime period1End,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime period2Start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime period2End
    ) {
        try {
            double growthRate = advancedAnalyticsService.calculateSalesGrowthRate(
                    period1Start, period1End, period2Start, period2End
            );
            return ResponseEntity.ok(growthRate);
        } catch (Exception e) {
            System.err.println("Growth rate calculation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Analyze Seasonality of sales data
     * Decomposes time series into: Original, Trend, Seasonal, and Residual components
     *
     * @param startDate - Start of analysis period
     * @param endDate   - End of analysis period
     * @return SeasonalityAnalysisDto with all components
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/seasonality")
    public ResponseEntity<SeasonalityAnalysisDto> getSeasonality(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        System.out.println("seasonality execute");
        try {
            SeasonalityAnalysisDto result = advancedAnalyticsService.analyzeSeasonality(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Seasonality analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/similarProducts/{productId}")
    public List<ProductDto> getSimilarProducts(@PathVariable Long productId) {
        return advancedAnalyticsService.getSimilarProductsByProduct(productId);
    }

    /**
     * Cohort Analysis Endpoint
     * Analyzes user cohorts based on registration date
     *
     * @param startDate - Start of analysis period
     * @param endDate   - End of analysis period
     * @return CohortAnalysisDto with cohort metrics
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/cohorts")
    public ResponseEntity<CohortAnalysisDto> getCohortAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            CohortAnalysisDto result = advancedAnalyticsService.analyzeCohorts(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Cohort analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * ABC Analysis Endpoint
     * Classifies products into A, B, C categories based on revenue contribution
     * - Class A: Top 80% of revenue (typically ~20% of products)
     * - Class B: Next 15% of revenue
     * - Class C: Remaining 5% of revenue
     *
     * @return ABCAnalysisDto with classified products
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/abc-analysis")
    public ResponseEntity<ABCAnalysisDto> getABCAnalysis() {
        try {
            ABCAnalysisDto result = advancedAnalyticsService.performABCAnalysis();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("ABC analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Purchase Frequency Analysis Endpoint
     * Analyzes customer purchase patterns and frequency
     *
     * @return List of PurchaseFrequencyAnalysisDto for all customers
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/purchase-frequency")
    public ResponseEntity<List<PurchaseFrequencyAnalysisDto>> getPurchaseFrequency() {
        try {
            List<PurchaseFrequencyAnalysisDto> result = advancedAnalyticsService.analyzePurchaseFrequency();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Purchase frequency analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Average Basket Value Endpoint
     * Calculates the average value of customer baskets/orders within a date range
     *
     * @param startDate Start of the period (ISO datetime)
     * @param endDate End of the period (ISO datetime)
     * @return Average basket value as a double
     */
    @GetMapping("/average-basket-value")
    public ResponseEntity<Double> getAverageBasketValue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            double result = advancedAnalyticsService.calculateAverageBasketValue(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Average basket value error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/api/v1/analytics/marketBasket")
    public List<AssociationRuleDto> getMarketBasketRules(
            @RequestParam double minSupport,
            @RequestParam double minConfidence
    ) {
        return advancedAnalyticsService.performMarketBasketAnalysis(minSupport, minConfidence);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/productslifecycle/{productId}")
    public ResponseEntity<ProductLifecycleDto> getProductLifecycle(
            @PathVariable("productId") Long productId
    ) {
        ProductLifecycleDto lifecycle = advancedAnalyticsService.analyzeProductLifecycle(productId);
        return ResponseEntity.ok(lifecycle);
    }

    // turnover controller
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @GetMapping("/inventory-turnover/{id}")
    public ResponseEntity<Double> getInventoryTurnoverRatio(
            @PathVariable("id") Long productId,
            @RequestParam("startDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,
            @RequestParam("endDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate
    ) {
        double ratio = advancedAnalyticsService
                .calculateInventoryTurnoverRatio(productId, startDate, endDate);

        return ResponseEntity.ok(ratio);
    }

    @GetMapping("/churn-rate")
    public ResponseEntity<ChurnAnalysisDto> getChurnRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            ChurnAnalysisDto result = advancedAnalyticsService.analyzeChurnRate(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Churn rate analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/segment-behavior/{segmentName}")
    public ResponseEntity<SegmentBehaviorAnalysisDto> getSegmentBehavior(
            @PathVariable String segmentName
    ) {
        try {
            SegmentBehaviorAnalysisDto result = advancedAnalyticsService.analyzeBehaviorBySegment(segmentName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Segment behavior analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/churn-prediction")
    public ResponseEntity<List<ChurnPredictionDto>> getChurnPrediction() {
        try {
            List<ChurnPredictionDto> result = advancedAnalyticsService.predictCustomerChurn();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Churn prediction error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/ranking-prediction/{productId}")
    public ResponseEntity<RankingPredictionDto> getRankingPrediction(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "7") int daysAhead
    ) {
        try {
            RankingPredictionDto result = advancedAnalyticsService.predictFutureRanking(productId, daysAhead);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Ranking prediction error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Churn Rate - Measures the percentage of users who stopped buying during a period. Users who made purchases before the period but didn't make any during it are considered "churned" or lost.
     * Retention Rate - Measures the percentage of users who continued buying during a period. It calculates how many of your existing users came back and made purchases again.
     * They are essentially opposite metrics:
     *
     * High churn = bad (losing customers)
     * High retention = good (keeping customers)*/

    @GetMapping("/retention-rate")
    public ResponseEntity<Double> getRetentionRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            double retentionRate = advancedAnalyticsService.calculateRetentionRate(startDate, endDate);
            return ResponseEntity.ok(retentionRate);
        } catch (Exception e) {
            System.err.println("Retention rate calculation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/potential-bestsellers")
    public ResponseEntity<List<PotentialBestSellerDto>> getPotentialBestSellers() {
        try {
            List<PotentialBestSellerDto> result = advancedAnalyticsService.identifyPotentialBestSellers();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Potential best sellers identification error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/stockout-prediction")
    public ResponseEntity<List<StockoutPredictionDto>> getStockoutPredictions(
            @RequestParam(defaultValue = "14") int daysAhead
    ) {
        try {
            List<StockoutPredictionDto> result = advancedAnalyticsService.predictStockouts(daysAhead);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Stockout prediction error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * RFM Analysis Endpoint
     * Segments customers based on Recency, Frequency, and Monetary value
     *
     * @return List of RFM segments with customer data
     */
    @GetMapping("/rfm-analysis")
    public ResponseEntity<List<RFMSegmentDto>> getRFMAnalysis() {
        try {
            List<RFMSegmentDto> result = advancedAnalyticsService.performRFMAnalysis();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("RFM analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/anomaly-detection")
    public ResponseEntity<List<AnomalyDetectionDto>> detectAnomalies(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDateTime start = parseDate(startDate, false);
            LocalDateTime end = parseDate(endDate, true);
            List<AnomalyDetectionDto> result = advancedAnalyticsService.detectSalesAnomalies(start, end);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Anomaly detection error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/compare-periods")
    public ResponseEntity<PeriodComparisonDto> comparePeriods(
            @RequestParam String period1Start,
            @RequestParam String period1End,
            @RequestParam String period2Start,
            @RequestParam String period2End
    ) {
        try {
            LocalDateTime p1Start = parseDate(period1Start, false);
            LocalDateTime p1End = parseDate(period1End, true);
            LocalDateTime p2Start = parseDate(period2Start, false);
            LocalDateTime p2End = parseDate(period2End, true);
            PeriodComparisonDto result = advancedAnalyticsService.comparePeriods(
                    p1Start, p1End, p2Start, p2End
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Period comparison error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/executive-dashboard")
    public ResponseEntity<ExecutiveDashboardDto> getExecutiveDashboard(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            LocalDateTime start = parseDate(startDate, false);
            LocalDateTime end = parseDate(endDate, true);
            ExecutiveDashboardDto result = advancedAnalyticsService.generateExecutiveDashboard(start, end);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Executive dashboard generation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/product-report/{productId}")
    public ResponseEntity<ComprehensiveProductReportDto> getProductReport(
            @PathVariable Long productId
    ) {
        try {
            ComprehensiveProductReportDto result = advancedAnalyticsService.generateProductReport(productId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Product report generation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/portfolio-report")
    public ResponseEntity<PortfolioAnalysisReportDto> getPortfolioReport() {
        try {
            PortfolioAnalysisReportDto result = advancedAnalyticsService.generatePortfolioReport();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Portfolio report generation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/performance-scorecard")
    public ResponseEntity<PerformanceScorecardDto> getPerformanceScorecard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            PerformanceScorecardDto result = advancedAnalyticsService.generatePerformanceScorecard(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Performance scorecard generation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/variance-analysis")
    public ResponseEntity<VarianceAnalysisDto> getVarianceAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            VarianceAnalysisDto result = advancedAnalyticsService.analyzeVariance(startDate, endDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Variance analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/category-performance")
    public ResponseEntity<List<CategoryPerformanceDto>> getCategoryPerformance(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            LocalDateTime start = parseDate(startDate, false);
            LocalDateTime end = parseDate(endDate, true);
            List<CategoryPerformanceDto> result = advancedAnalyticsService.analyzeCategoryPerformance(start, end);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Category performance analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Reviews Sentiment Analysis Endpoint
     * Analyzes sentiment of customer reviews across all products
     * Returns: List with positive, neutral, negative counts per product
     */
    @GetMapping("/reviews-sentiment")
    public ResponseEntity<List<ReviewsSentimentAnalysisDto>> getReviewsSentiment() {
        try {
            List<ReviewsSentimentAnalysisDto> result = advancedAnalyticsService.analyzeSentiment();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Reviews sentiment analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Extract Review Topics for a Product
     * Uses NLP to identify recurring themes in product reviews
     */
    @GetMapping("/review-topics/{productId}")
    public ResponseEntity<List<TopicDto>> getReviewTopics(
            @PathVariable Long productId
    ) {
        try {
            List<TopicDto> result = advancedAnalyticsService.extractReviewTopics(productId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Review topics extraction error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

}
