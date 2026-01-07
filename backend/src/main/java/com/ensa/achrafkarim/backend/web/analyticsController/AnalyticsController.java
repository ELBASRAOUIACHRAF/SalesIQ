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

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
//@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AdvancedAnalyticsService advancedAnalyticsService;
    private final SaleService saleService;

    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
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

//    @PreAuthorize("permitAll()")
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
}
