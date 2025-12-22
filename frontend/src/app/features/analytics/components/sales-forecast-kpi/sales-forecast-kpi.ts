import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { SalesForecastDto, ForecastPointDto } from '../../../../core/models/salesForecast.model';

type Trend = 'up' | 'down' | 'flat';

type Point = { x: number; y: number };

@Component({
  selector: 'app-sales-forecast-kpi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-forecast-kpi.html',
  styleUrls: ['./sales-forecast-kpi.css']
})
export class SalesForecastKpiComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title = 'Sales Forecast';
  @Input() defaultHorizonDays = 7;
  @Input() currencySymbol = '$';
  @Input() total = 0;
  @Input() percentChange = 0;
  @Input() trend: Trend = 'up';
  @Input() model = 'ARIMA';
  @Input() lastUpdated = '';
  @Input() insight = 'Growth expected';
  @Input() historical: number[] = [];
  @Input() forecast: number[] = [];

  @Output() requestForecast = new EventEmitter<number>();

  horizonDays = this.defaultHorizonDays;

  // ==========================================
  // NEW: State for API calls
  // ==========================================
  isLoading = false;
  errorMessage = '';
  forecastData: SalesForecastDto | null = null;

  private destroy$ = new Subject<void>();

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.horizonDays = this.defaultHorizonDays;
    // Auto-load forecast on component initialization
    this.fetchForecast();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  readonly viewBoxWidth = 180;
  readonly viewBoxHeight = 64;

  get trendIcon(): string {
    switch (this.trend) {
      case 'down':
        return '▼';
      case 'flat':
        return '▬';
      default:
        return '▲';
    }
  }

  get changeLabel(): string {
    const sign = this.percentChange > 0 ? '+' : '';
    return `${sign}${this.percentChange}%`;
  }

  get horizonLabel(): string {
    return `Next ${this.horizonDays} Days`;
  }

  get forecastHorizonLabel(): string {
    return `${this.horizonDays} days`;
  }

  get historicalPath(): string {
    const points = this.buildPoints();
    const stop = Math.max(this.historical.length, 0);
    return this.pointsToPath(points.slice(0, stop));
  }

  get forecastPath(): string {
    if (!this.forecast.length) return '';
    const points = this.buildPoints();
    const start = Math.max(this.historical.length - 1, 0);
    return this.pointsToPath(points.slice(start));
  }

  get forecastStartX(): number {
    const points = this.buildPoints();
    const idx = Math.max(this.historical.length - 1, 0);
    return points[idx]?.x ?? 0;
  }

  get lastPoint(): Point | null {
    const points = this.buildPoints();
    return points.length ? points[points.length - 1] : null;
  }

  get histPoint(): Point | null {
    const points = this.buildPoints();
    const idx = Math.max(this.historical.length - 1, 0);
    return points[idx] ?? null;
  }

  get forecastEntries() {
    // Use API data if available, otherwise fall back to @Input
    if (this.forecastData?.forecast?.length) {
      return this.forecastData.forecast.map((point, idx) => ({
        day: idx + 1,
        date: point.date,
        value: point.predictedSales
      }));
    }
    return this.forecast.map((value, idx) => ({ day: idx + 1, date: '', value }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultHorizonDays'] && typeof this.defaultHorizonDays === 'number') {
      this.horizonDays = this.defaultHorizonDays;
    }
  }

  updateHorizon(val: string) {
    const parsed = Number(val);
    if (!Number.isNaN(parsed) && parsed > 0) {
      this.horizonDays = parsed;
    }
  }

  /**
   * BUTTON CLICK HANDLER
   * Calls the backend API to get sales forecast
   */
  triggerRequest() {
    // Emit event for parent components that want to handle it
    this.requestForecast.emit(this.horizonDays);

    // Also call the backend directly
    this.fetchForecast();
  }

  /**
   * Fetch forecast from backend API
   */
  fetchForecast(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('🚀 Fetching sales forecast for', this.horizonDays, 'days');

    this.analyticsService.forecastSales(this.horizonDays)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SalesForecastDto) => {
          console.log('✅ Forecast received:', data);
          this.forecastData = data;
          
          // Update component properties from API response
          this.model = data.model || 'N/A';
          this.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Convert forecast points to array for chart
          if (data.forecast?.length) {
            this.forecast = data.forecast.map(p => p.predictedSales);
            
            // Calculate total and trend
            const totalPredicted = data.forecast.reduce((sum, p) => sum + p.predictedSales, 0);
            this.total = Math.round(totalPredicted);
            
            // Calculate trend based on first vs last prediction
            const first = data.forecast[0]?.predictedSales || 0;
            const last = data.forecast[data.forecast.length - 1]?.predictedSales || 0;
            if (last > first) {
              this.trend = 'up';
              this.percentChange = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
              this.insight = 'Growth expected';
            } else if (last < first) {
              this.trend = 'down';
              this.percentChange = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
              this.insight = 'Decline expected';
            } else {
              this.trend = 'flat';
              this.percentChange = 0;
              this.insight = 'Stable forecast';
            }
          }
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Forecast error:', err);
          this.errorMessage = 'Failed to fetch forecast. Is the backend running?';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private buildPoints(): Point[] {
    const series = [...this.historical, ...this.forecast];
    if (!series.length) return [];

    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const usableHeight = this.viewBoxHeight - 8; // small padding top/bottom
    const step = series.length <= 1 ? this.viewBoxWidth : this.viewBoxWidth / (series.length - 1);

    return series.map((v, i) => {
      const normalized = (v - min) / range;
      const y = this.viewBoxHeight - 4 - normalized * usableHeight;
      return { x: i * step, y };
    });
  }

  private pointsToPath(points: Point[]): string {
    if (!points.length) return '';
    const [first, ...rest] = points;
    return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ` +
      rest.map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  }
}
