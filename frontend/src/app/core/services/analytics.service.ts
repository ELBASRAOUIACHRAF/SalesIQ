import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SeasonalityAnalysisDto } from '../models/seasonality.model';
import { CohortAnalysisDto, defaultCohortAnalysis } from '../models/cohort.model';
import { SalesTrendAnalysisDto, TimeGranularity, defaultSalesTrendAnalysis } from '../models/salesTrend.model';
import { SalesForecastDto, defaultSalesForecast } from '../models/salesForecast.model';
import { ABCAnalysisDto, defaultABCAnalysis } from '../models/abcAnalysis.model';
import { PurchaseFrequencyAnalysisDto, defaultPurchaseFrequency } from '../models/purchaseFrequency.model';
import { ChurnAnalysisDto, defaultChurnAnalysis } from '../models/churnAnalysis.model';
import { ChurnPredictionDto, defaultChurnPredictions } from '../models/churnPrediction.model';
import { RFMSegmentDto, defaultRFMAnalysis } from '../models/rfmAnalysis.model';
import { PotentialBestSellerDto, defaultPotentialBestsellers } from '../models/potentialBestseller.model';
import { StockoutPredictionDto, defaultStockoutPredictions } from '../models/stockoutPrediction.model';
import { AnomalyDetectionDto, defaultAnomalies } from '../models/anomalyDetection.model';
import { PeriodComparisonDto, defaultPeriodComparison } from '../models/periodComparison.model';
import { ExecutiveDashboardDto, defaultExecutiveDashboard } from '../models/executiveDashboard.model';
import { PerformanceScorecardDto, defaultPerformanceScorecard } from '../models/performanceScorecard.model';
import { VarianceAnalysisDto, defaultVarianceAnalysis } from '../models/varianceAnalysis.model';
import { SegmentBehaviorAnalysisDto, defaultSegmentBehavior } from '../models/segmentBehavior.model';
import { ProductLifecycleDto, defaultProductLifecycle } from '../models/productLifecycle.model';
import { RankingPredictionDto, defaultRankingPrediction } from '../models/rankingPrediction.model';
import { CategoryPerformanceDto, defaultCategoryPerformance } from '../models/categoryPerformance.model';
import { ReviewsSentimentAnalysisDto, defaultReviewsSentiment } from '../models/reviewsSentiment.model';
import { TopicDto, defaultTopics } from '../models/topic.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private readonly API_URL = 'http://localhost:8080/api/v1/analytics';

  constructor(private http: HttpClient) {}

  /**
   * Get Category Performance Analysis
   * Shows revenue, quantity sold, and sales count per category
   */
  getCategoryPerformance(startDate?: string, endDate?: string): Observable<CategoryPerformanceDto[]> {
    // Default to last 2 years if no date range provided
    if (!startDate) {
      const defaultStart = new Date();
      defaultStart.setFullYear(defaultStart.getFullYear() - 2);
      startDate = defaultStart.toISOString().split('T')[0];
    }
    if (!endDate) {
      endDate = new Date().toISOString().split('T')[0];
    }
    
    return this.http.get<CategoryPerformanceDto[] | null>(
      `${this.API_URL}/category-performance`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? defaultCategoryPerformance)
    );
  }

  analyzeSeasonality(startDate: string, endDate: string): Observable<SeasonalityAnalysisDto> {
    return this.http.get<SeasonalityAnalysisDto | null>(
      `${this.API_URL}/seasonality`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => {
        const fallback: SeasonalityAnalysisDto = {
          originalSeries: [],
          trendSeries: [],
          seasonalSeries: [],
          residualSeries: [],
          seasonalityType: 'NONE',
          seasonalityStrength: 0
        };
        return res ?? fallback;
      })
    );
  }

  getCohortAnalysis(start: string, end: string): Observable<CohortAnalysisDto> {
    return this.http.get<CohortAnalysisDto | null>(
      `${this.API_URL}/cohorts`,
      { params: { startDate: start, endDate: end } }
    ).pipe(
      map(res => res ?? defaultCohortAnalysis)
    );
  }

  /**
   * Step 3: Angular Service Method
   * This method makes an HTTP GET request to the backend endpoint
   * 
   * @param startDate - ISO date string (e.g., "2024-01-01T00:00:00")
   * @param endDate - ISO date string (e.g., "2024-12-31T23:59:59")
   * @param granularity - Time granularity: 'DAILY', 'WEEKLY', 'MONTHLY', or 'YEARLY'
   * @returns Observable of SalesTrendAnalysisDto
   */
  getSalesTrend(
    startDate: string,
    endDate: string,
    granularity: TimeGranularity = 'DAILY'
  ): Observable<SalesTrendAnalysisDto> {
    return this.http.get<SalesTrendAnalysisDto | null>(
      `${this.API_URL}/sales-trend`,
      {
        params: {
          startDate: startDate,
          endDate: endDate,
          granularity: granularity
        }
      }
    ).pipe(
      map(res => res ?? defaultSalesTrendAnalysis)
    );
  }

  /**
   * Calculate Sales Growth Rate between two periods
   * Compares period2 revenue vs period1 revenue
   * 
   * @param period1Start - Start of first period (baseline)
   * @param period1End - End of first period
   * @param period2Start - Start of second period (comparison)
   * @param period2End - End of second period
   * @returns Observable<number> - Growth rate as percentage (e.g., 20 means 20% growth)
   */
  getSalesGrowthRate(
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string
  ): Observable<number> {
    return this.http.get<number | null>(
      `${this.API_URL}/growth-rate`,
      {
        params: {
          period1Start,
          period1End,
          period2Start,
          period2End
        }
      }
    ).pipe(
      map(res => res ?? 0)
    );
  }

  /**
   * Forecast future sales using time series models (ARIMA, Moving Average)
   * 
   * @param daysAhead - Number of days to forecast into the future
   * @returns Observable<SalesForecastDto> - Forecast data with predicted values
   */
  forecastSales(daysAhead: number = 7): Observable<SalesForecastDto> {
    return this.http.get<SalesForecastDto | null>(
      `${this.API_URL}/forecastSales`,
      {
        params: { daysAhead: daysAhead.toString() }
      }
    ).pipe(
      map(res => res ?? defaultSalesForecast)
    );
  }

  /**
   * ABC Analysis - Classify products by revenue contribution
   * 
   * Class A: Top 80% revenue (most valuable products)
   * Class B: Next 15% revenue
   * Class C: Remaining 5% revenue
   * 
   * @returns Observable<ABCAnalysisDto> - Products classified into A, B, C categories
   */
  getABCAnalysis(): Observable<ABCAnalysisDto> {
    return this.http.get<ABCAnalysisDto | null>(
      `${this.API_URL}/abc-analysis`
    ).pipe(
      map(res => res ?? defaultABCAnalysis)
    );
  }

  /**
   * Purchase Frequency Analysis - Analyze customer buying patterns
   * 
   * @returns Observable<PurchaseFrequencyAnalysisDto[]> - List of customers with purchase metrics
   */
  getPurchaseFrequency(): Observable<PurchaseFrequencyAnalysisDto[]> {
    return this.http.get<PurchaseFrequencyAnalysisDto[] | null>(
      `${this.API_URL}/purchase-frequency`
    ).pipe(
      map(res => res ?? defaultPurchaseFrequency)
    );
  }

  /**
   * Average Basket Value - Calculate average order value within a date range
   * 
   * @param startDate ISO datetime string
   * @param endDate ISO datetime string
   * @returns Observable<number> - Average basket value
   */
  getAverageBasketValue(startDate: string, endDate: string): Observable<number> {
    return this.http.get<number>(
      `${this.API_URL}/average-basket-value`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? 0)
    );
  }

  // ========================================
  // CHURN & RETENTION ANALYTICS
  // ========================================

  /**
   * Churn Rate Analysis
   * Measures percentage of customers lost during a period
   */
  getChurnAnalysis(startDate: string, endDate: string): Observable<ChurnAnalysisDto> {
    return this.http.get<ChurnAnalysisDto | null>(
      `${this.API_URL}/churn-rate`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? defaultChurnAnalysis)
    );
  }

  /**
   * Churn Prediction
   * Identifies customers at risk of churning using ML
   */
  getChurnPredictions(): Observable<ChurnPredictionDto[]> {
    return this.http.get<ChurnPredictionDto[] | null>(
      `${this.API_URL}/churn-prediction`
    ).pipe(
      map(res => res ?? defaultChurnPredictions)
    );
  }

  /**
   * Retention Rate
   * Percentage of customers retained during a period
   */
  getRetentionRate(startDate: string, endDate: string): Observable<number> {
    return this.http.get<number | null>(
      `${this.API_URL}/retention-rate`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? 0)
    );
  }

  // ========================================
  // RFM & CUSTOMER SEGMENTATION
  // ========================================

  /**
   * RFM Analysis - Segment customers by Recency, Frequency, Monetary
   */
  getRFMAnalysis(): Observable<RFMSegmentDto[]> {
    return this.http.get<RFMSegmentDto[] | null>(
      `${this.API_URL}/rfm-analysis`
    ).pipe(
      map(res => res ?? defaultRFMAnalysis)
    );
  }

  /**
   * Segment Behavior Analysis
   */
  getSegmentBehavior(segmentName: string): Observable<SegmentBehaviorAnalysisDto> {
    return this.http.get<SegmentBehaviorAnalysisDto | null>(
      `${this.API_URL}/segment-behavior/${segmentName}`
    ).pipe(
      map(res => res ?? defaultSegmentBehavior)
    );
  }

  // ========================================
  // PREDICTIVE ANALYTICS
  // ========================================

  /**
   * Potential Bestsellers
   * Identifies products likely to become bestsellers
   */
  getPotentialBestsellers(): Observable<PotentialBestSellerDto[]> {
    return this.http.get<PotentialBestSellerDto[] | null>(
      `${this.API_URL}/potential-bestsellers`
    ).pipe(
      map(res => res ?? defaultPotentialBestsellers)
    );
  }

  /**
   * Stockout Predictions
   * Predicts which products will run out of stock
   */
  getStockoutPredictions(daysAhead: number = 14): Observable<StockoutPredictionDto[]> {
    return this.http.get<StockoutPredictionDto[] | null>(
      `${this.API_URL}/stockout-prediction`,
      { params: { daysAhead: daysAhead.toString() } }
    ).pipe(
      map(res => res ?? defaultStockoutPredictions)
    );
  }

  /**
   * Ranking Prediction
   * Predicts future product ranking
   */
  getRankingPrediction(productId: number, daysAhead: number = 7): Observable<RankingPredictionDto> {
    return this.http.get<RankingPredictionDto | null>(
      `${this.API_URL}/ranking-prediction/${productId}`,
      { params: { daysAhead: daysAhead.toString() } }
    ).pipe(
      map(res => res ?? defaultRankingPrediction)
    );
  }

  // ========================================
  // ANOMALY DETECTION
  // ========================================

  /**
   * Detect Sales Anomalies
   * Identifies unusual sales patterns (spikes, drops)
   */
  detectAnomalies(startDate: string, endDate: string): Observable<AnomalyDetectionDto[]> {
    return this.http.get<AnomalyDetectionDto[] | null>(
      `${this.API_URL}/anomaly-detection`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? defaultAnomalies)
    );
  }

  // ========================================
  // COMPARATIVE ANALYTICS
  // ========================================

  /**
   * Period Comparison
   * Compare metrics between two time periods
   */
  comparePeriods(
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string
  ): Observable<PeriodComparisonDto> {
    return this.http.get<PeriodComparisonDto | null>(
      `${this.API_URL}/compare-periods`,
      {
        params: {
          period1Start,
          period1End,
          period2Start,
          period2End
        }
      }
    ).pipe(
      map(res => res ?? defaultPeriodComparison)
    );
  }

  /**
   * Variance Analysis
   * Compare actual vs expected performance
   */
  getVarianceAnalysis(startDate: string, endDate: string): Observable<VarianceAnalysisDto> {
    return this.http.get<VarianceAnalysisDto | null>(
      `${this.API_URL}/variance-analysis`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? defaultVarianceAnalysis)
    );
  }

  // ========================================
  // DASHBOARD & REPORTS
  // ========================================

  /**
   * Executive Dashboard
   * Comprehensive dashboard with all key metrics
   */
  getExecutiveDashboard(startDate: string, endDate: string): Observable<ExecutiveDashboardDto> {
    return this.http.get<ExecutiveDashboardDto | null>(
      `${this.API_URL}/executive-dashboard`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? defaultExecutiveDashboard)
    );
  }

  /**
   * Performance Scorecard
   * Overall business performance scoring
   */
  getPerformanceScorecard(startDate: string, endDate: string): Observable<PerformanceScorecardDto> {
    return this.http.get<PerformanceScorecardDto | null>(
      `${this.API_URL}/performance-scorecard`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? defaultPerformanceScorecard)
    );
  }

  // ========================================
  // PRODUCT ANALYTICS
  // ========================================

  /**
   * Product Lifecycle Analysis
   * Determine product's lifecycle phase
   */
  getProductLifecycle(productId: number): Observable<ProductLifecycleDto> {
    return this.http.get<ProductLifecycleDto | null>(
      `${this.API_URL}/productslifecycle/${productId}`
    ).pipe(
      map(res => res ?? defaultProductLifecycle)
    );
  }

  /**
   * Inventory Turnover Ratio
   * Calculate how fast inventory is sold
   */
  getInventoryTurnover(productId: number, startDate: string, endDate: string): Observable<number> {
    return this.http.get<number | null>(
      `${this.API_URL}/inventory-turnover/${productId}`,
      { params: { startDate, endDate } }
    ).pipe(
      map(res => res ?? 0)
    );
  }

  // ========================================
  // REVIEWS ANALYTICS
  // ========================================

  /**
   * Get Reviews Sentiment Analysis
   * Analyzes sentiment of customer reviews across all products
   */
  getReviewsSentiment(): Observable<ReviewsSentimentAnalysisDto[]> {
    return this.http.get<ReviewsSentimentAnalysisDto[] | null>(
      `${this.API_URL}/reviews-sentiment`
    ).pipe(
      map(res => res ?? defaultReviewsSentiment)
    );
  }

  /**
   * Get Review Topics for a Product
   * Extract recurring themes from product reviews using NLP
   */
  getReviewTopics(productId: number): Observable<TopicDto[]> {
    return this.http.get<TopicDto[] | null>(
      `${this.API_URL}/review-topics/${productId}`
    ).pipe(
      map(res => res ?? defaultTopics)
    );
  }
}
