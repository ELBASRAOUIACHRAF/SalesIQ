import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, forkJoin, map } from 'rxjs';
import { AnalyticsService } from './analytics.service';

// Report Data Interfaces
export interface RFMReportData {
  customerId: number;
  segment: string;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  totalScore: number;
  recencyDays: number;
  purchaseCount: number;
  totalSpent: number;
}

export interface ChurnReportData {
  userId: number;
  churnProbability: number;
  riskLevel: string;
  daysSinceLastPurchase: number;
  totalPurchases: number;
  totalSpent: number;
  avgOrderValue: number;
}

export interface ForecastReportData {
  date: string;
  predictedRevenue: number;
}

export interface StockoutReportData {
  productId: number;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  riskLevel: string;
  recommendedReorder: number;
}

export interface BestsellerReportData {
  productId: number;
  productName: string;
  category: string;
  currentSales: number;
  growthRate: number;
  potentialScore: number;
  potentialLevel: string;
}

export interface SentimentReportData {
  productId: number;
  productName: string;
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  overallSentiment: string;
}

export interface AnomalyReportData {
  date: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  anomalyType: string;
  severity: string;
}

export interface ABCReportData {
  productId: number;
  productName: string;
  category: string;
  totalRevenue: number;
  revenuePercentage: number;
  cumulativePercentage: number;
  classification: string;
}

export interface AnalyticsReportSummary {
  totalCustomers: number;
  atRiskCustomers: number;
  churnRate: number;
  totalProducts: number;
  lowStockProducts: number;
  potentialBestsellers: number;
  forecastedRevenue: number;
  avgSentiment: number;
  anomaliesDetected: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsReportService {
  private readonly API_URL = 'http://localhost:8080/api/v1/analytics';

  constructor(
    private http: HttpClient,
    private analyticsService: AnalyticsService
  ) {}

  // Get RFM Analysis Data
  getRFMReport(): Observable<RFMReportData[]> {
    return this.analyticsService.getRFMAnalysis().pipe(
      map(segments => segments.map(s => ({
        customerId: s.customerId,
        segment: s.segment,
        recencyScore: s.rScore,
        frequencyScore: s.fScore,
        monetaryScore: s.mScore,
        totalScore: s.rScore + s.fScore + s.mScore,
        recencyDays: s.recency,
        purchaseCount: s.frequency,
        totalSpent: s.monetary
      }))),
      catchError(() => of([]))
    );
  }

  // Get Churn Prediction Data
  getChurnReport(): Observable<ChurnReportData[]> {
    return this.analyticsService.getChurnPredictions().pipe(
      map(predictions => predictions.map(p => ({
        userId: p.userId,
        churnProbability: p.churnProbability,
        riskLevel: p.riskLevel,
        daysSinceLastPurchase: p.daysSinceLastPurchase,
        totalPurchases: p.totalPurchases,
        totalSpent: p.totalSpent,
        avgOrderValue: p.totalPurchases > 0 ? p.totalSpent / p.totalPurchases : 0
      }))),
      catchError(() => of([]))
    );
  }

  // Get Sales Forecast Data
  getForecastReport(daysAhead: number = 30): Observable<ForecastReportData[]> {
    return this.analyticsService.forecastSales(daysAhead).pipe(
      map(forecast => {
        if (!forecast.forecast || forecast.forecast.length === 0) {
          return [];
        }
        return forecast.forecast.map(point => ({
          date: point.date,
          predictedRevenue: point.predictedSales
        }));
      }),
      catchError(() => of([]))
    );
  }

  // Get Stockout Predictions
  getStockoutReport(): Observable<StockoutReportData[]> {
    return this.analyticsService.getStockoutPredictions(30).pipe(
      map(predictions => predictions.map(p => ({
        productId: p.productId,
        productName: p.productName || `Product ${p.productId}`,
        currentStock: p.currentStock,
        avgDailySales: p.avgDailySales,
        daysUntilStockout: p.daysUntilStockout,
        riskLevel: p.riskLevel,
        recommendedReorder: p.recommendedRestock || 0
      }))),
      catchError(() => of([]))
    );
  }

  // Get Potential Bestsellers
  getBestsellerReport(): Observable<BestsellerReportData[]> {
    return this.analyticsService.getPotentialBestsellers().pipe(
      map(bestsellers => bestsellers.map(b => ({
        productId: b.productId,
        productName: b.productName || `Product ${b.productId}`,
        category: b.categoryName || '-',
        currentSales: b.currentSales,
        growthRate: b.salesGrowthRate,
        potentialScore: b.potentialScore,
        potentialLevel: b.potentialLevel
      }))),
      catchError(() => of([]))
    );
  }

  // Get Sentiment Analysis
  getSentimentReport(): Observable<SentimentReportData[]> {
    return this.analyticsService.getReviewsSentiment().pipe(
      map(sentiments => sentiments.map(s => ({
        productId: s.productId,
        productName: `Product ${s.productId}`,
        totalReviews: s.totalReviews,
        positiveCount: s.positiveCount,
        neutralCount: s.neutralCount,
        negativeCount: s.negativeCount,
        overallSentiment: s.overallSentiment
      }))),
      catchError(() => of([]))
    );
  }

  // Get Anomaly Detection Data
  getAnomalyReport(): Observable<AnomalyReportData[]> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    return this.analyticsService.detectAnomalies(startDate, endDate).pipe(
      map(anomalies => anomalies.map(a => ({
        date: (a as any).date || '-',
        metric: (a as any).metric || 'Sales',
        actualValue: (a as any).actualValue || 0,
        expectedValue: (a as any).expectedValue || 0,
        deviation: (a as any).deviation || 0,
        anomalyType: (a as any).anomalyType || 'UNKNOWN',
        severity: this.getAnomalySeverity((a as any).deviation || 0)
      }))),
      catchError(() => of([]))
    );
  }

  // Get ABC Analysis Data
  getABCReport(): Observable<ABCReportData[]> {
    return this.analyticsService.getABCAnalysis().pipe(
      map(abc => {
        const allProducts: ABCReportData[] = [];
        
        // Process Class A products
        ((abc as any).classA || []).forEach((p: any) => {
          allProducts.push({
            productId: p.productId,
            productName: p.productName || `Product ${p.productId}`,
            category: p.category || '-',
            totalRevenue: p.totalRevenue || 0,
            revenuePercentage: p.revenuePercentage || 0,
            cumulativePercentage: p.cumulativePercentage || 0,
            classification: 'A'
          });
        });
        
        // Process Class B products
        ((abc as any).classB || []).forEach((p: any) => {
          allProducts.push({
            productId: p.productId,
            productName: p.productName || `Product ${p.productId}`,
            category: p.category || '-',
            totalRevenue: p.totalRevenue || 0,
            revenuePercentage: p.revenuePercentage || 0,
            cumulativePercentage: p.cumulativePercentage || 0,
            classification: 'B'
          });
        });
        
        // Process Class C products
        ((abc as any).classC || []).forEach((p: any) => {
          allProducts.push({
            productId: p.productId,
            productName: p.productName || `Product ${p.productId}`,
            category: p.category || '-',
            totalRevenue: p.totalRevenue || 0,
            revenuePercentage: p.revenuePercentage || 0,
            cumulativePercentage: p.cumulativePercentage || 0,
            classification: 'C'
          });
        });
        
        return allProducts;
      }),
      catchError(() => of([]))
    );
  }

  // Get Summary Statistics
  getReportSummary(): Observable<AnalyticsReportSummary> {
    return forkJoin({
      rfm: this.getRFMReport(),
      churn: this.getChurnReport(),
      stockout: this.getStockoutReport(),
      bestsellers: this.getBestsellerReport(),
      forecast: this.getForecastReport(7),
      sentiment: this.getSentimentReport(),
      anomalies: this.getAnomalyReport()
    }).pipe(
      map(data => {
        const atRiskCustomers = data.churn.filter(c => c.churnProbability > 0.5).length;
        const lowStockProducts = data.stockout.filter(s => s.daysUntilStockout < 14).length;
        const forecastedRevenue = data.forecast.reduce((sum, f) => sum + f.predictedRevenue, 0);
        const positiveReviews = data.sentiment.filter(s => s.overallSentiment === 'POSITIVE').length;

        return {
          totalCustomers: data.rfm.length,
          atRiskCustomers,
          churnRate: data.rfm.length > 0 ? (atRiskCustomers / data.rfm.length) * 100 : 0,
          totalProducts: data.stockout.length,
          lowStockProducts,
          potentialBestsellers: data.bestsellers.filter(b => b.potentialScore > 70).length,
          forecastedRevenue,
          avgSentiment: data.sentiment.length > 0 ? (positiveReviews / data.sentiment.length) * 100 : 0,
          anomaliesDetected: data.anomalies.length
        };
      }),
      catchError(() => of({
        totalCustomers: 0,
        atRiskCustomers: 0,
        churnRate: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        potentialBestsellers: 0,
        forecastedRevenue: 0,
        avgSentiment: 0,
        anomaliesDetected: 0
      }))
    );
  }

  // Helper methods
  private getAnomalySeverity(deviation: number): string {
    const absDeviation = Math.abs(deviation);
    if (absDeviation >= 50) return 'CRITICAL';
    if (absDeviation >= 30) return 'HIGH';
    if (absDeviation >= 15) return 'MEDIUM';
    return 'LOW';
  }
}
