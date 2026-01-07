import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { MatIconModule } from '@angular/material/icon';

interface ForecastData {
  date: string;
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

@Component({
  selector: 'app-sales-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './sales-forecast.html',
  styleUrls: ['./sales-forecast.css']
})
export class SalesForecastComponent implements OnInit, OnDestroy {

  forecastData: ForecastData[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Expose Math for template
  Math = Math;

  // Configuration
  forecastPeriod: number = 30;
  periodOptions = [7, 14, 30, 60, 90];

  // Summary Stats
  totalPredicted: number = 0;
  avgDailySales: number = 0;
  peakDay: ForecastData | null = null;
  avgConfidence: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadForecast();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadForecast(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.forecastSales(this.forecastPeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.forecastData = this.transformForecastData(data);
          this.calculateStats();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          console.error('Forecast error:', err);
          this.errorMessage = 'Failed to load sales forecast';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  transformForecastData(rawData: any): ForecastData[] {
    if (Array.isArray(rawData)) {
      return rawData.map(item => ({
        date: item.date || item.forecastDate,
        predictedSales: item.predictedSales || item.forecastedValue || 0,
        lowerBound: item.lowerBound || item.lowerConfidenceBound || 0,
        upperBound: item.upperBound || item.upperConfidenceBound || 0,
        confidence: item.confidence || item.confidenceLevel || 85
      }));
    }
    return [];
  }

  calculateStats(): void {
    if (!this.forecastData.length) return;

    this.totalPredicted = this.forecastData.reduce((sum, d) => sum + d.predictedSales, 0);
    this.avgDailySales = this.totalPredicted / this.forecastData.length;
    this.peakDay = this.forecastData.reduce((max, d) => d.predictedSales > max.predictedSales ? d : max, this.forecastData[0]);
    this.avgConfidence = this.forecastData.reduce((sum, d) => sum + d.confidence, 0) / this.forecastData.length;
  }

  onPeriodChange(): void {
    this.loadForecast();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateLong(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getBarHeight(value: number): string {
    if (!this.peakDay) return '0%';
    const maxValue = this.peakDay.predictedSales;
    return `${(value / maxValue) * 100}%`;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  }

  getTrendIcon(index: number): string {
    if (index === 0) return '';
    const current = this.forecastData[index].predictedSales;
    const previous = this.forecastData[index - 1].predictedSales;
    const change = ((current - previous) / previous) * 100;
    
    if (change > 5) return 'trending_up';      
    if (change < -5) return 'trending_down';   
    return 'trending_flat';                    
  }
}
