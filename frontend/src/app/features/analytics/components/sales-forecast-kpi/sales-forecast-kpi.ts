import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Trend = 'up' | 'down' | 'flat';

type Point = { x: number; y: number };

@Component({
  selector: 'app-sales-forecast-kpi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-forecast-kpi.html',
  styleUrls: ['./sales-forecast-kpi.css']
})
export class SalesForecastKpiComponent implements OnChanges {
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
    return this.forecast.map((value, idx) => ({ day: idx + 1, value }));
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

  triggerRequest() {
    this.requestForecast.emit(this.horizonDays);
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
