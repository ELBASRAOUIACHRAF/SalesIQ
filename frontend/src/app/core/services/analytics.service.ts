import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SeasonalityAnalysisDto } from '../models/seasonality.model';
import { CohortAnalysisDto, defaultCohortAnalysis } from '../models/cohort.model';
import { SalesTrendAnalysisDto, TimeGranularity, defaultSalesTrendAnalysis } from '../models/salesTrend.model';
import { SalesForecastDto, defaultSalesForecast } from '../models/salesForecast.model';
import { ABCAnalysisDto, defaultABCAnalysis } from '../models/abcAnalysis.model';
import { PurchaseFrequencyAnalysisDto, defaultPurchaseFrequency } from '../models/purchaseFrequency.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private readonly API_URL = 'http://localhost:8080/api/v1/analytics';

  constructor(private http: HttpClient) {}

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
}
