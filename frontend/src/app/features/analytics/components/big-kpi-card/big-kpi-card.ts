import { Component, Input, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-big-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './big-kpi-card.html',
  styleUrls: ['./big-kpi-card.css'],
})
export class BigCardComponent implements OnInit, AfterViewInit {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() value: string | number = '';
  @Input() change?: number;
  @Input() iconUrl?: string;
  @Input() iconClass?: string;
  @Input() chartData: number[] = [];
  @Input() color = '#7C3AED'; // default accent
  @Input() footer?: string;
  @Input() xAxisLabels?: string[]; // Optional labels for X-axis
  @Input() showAxes = true; // Show axes and labels

  chartW = 600;
  chartH = 150;
  padding = { top: 10, right: 10, bottom: 30, left: 50 };
  animatedValue: number | string = '';
  chartAnimated = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (typeof this.value === 'number') {
      this.animateValue(0, this.value, 1200);
    } else {
      this.animatedValue = this.value;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.chartAnimated = true;
      this.cdr.markForCheck();
    }, 300);
  }

  animateValue(start: number, end: number, duration: number) {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      this.animatedValue = end;
      this.cdr.markForCheck();
      return;
    }

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOutCubic;
      this.animatedValue = Math.round(current);
      this.cdr.markForCheck();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animatedValue = end;
        this.cdr.markForCheck();
      }
    };
    requestAnimationFrame(animate);
  }

  formatValue(): string {
    if (typeof this.animatedValue === 'number') {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(this.animatedValue);
    }
    return String(this.animatedValue || this.value);
  }

  chartPoints(): string {
    if (!this.chartData.length) return '';
    const w = this.chartW - this.padding.left - this.padding.right;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const min = Math.min(...this.chartData);
    const max = Math.max(...this.chartData);
    const range = max - min || 1;

    return this.chartData
      .map((v, i) => {
        const x = this.padding.left + (i / (this.chartData.length - 1)) * w;
        const y = this.padding.top + h - ((v - min) / range) * h;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  areaPath(): string {
    const points = this.chartPoints();
    if (!points) return '';
    const w = this.chartW;
    const h = this.chartH;
    return `${points} ${w - this.padding.right},${h - this.padding.bottom} ${this.padding.left},${h - this.padding.bottom}`;
  }

  getXAxisLabels(): string[] {
    if (this.xAxisLabels && this.xAxisLabels.length === this.chartData.length) {
      return this.xAxisLabels;
    }
    // Default: Generate day names for week
    if (this.chartData.length === 7) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    // Default: Generate labels based on data length
    return this.chartData.map((_, i) => {
      if (this.chartData.length <= 7) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[i % 7] || `Day ${i + 1}`;
      } else if (this.chartData.length <= 12) {
        return `M${i + 1}`;
      } else {
        return `${i + 1}`;
      }
    });
  }

  getYAxisTicks(): number[] {
    if (!this.chartData.length) return [];
    const min = Math.min(...this.chartData);
    const max = Math.max(...this.chartData);
    const range = max - min || 1;
    const tickCount = 5;
    const step = range / (tickCount - 1);
    const ticks: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      ticks.push(min + step * i);
    }
    return ticks;
  }

  getYAxisPosition(value: number): number {
    if (!this.chartData.length) return 0;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const min = Math.min(...this.chartData);
    const max = Math.max(...this.chartData);
    const range = max - min || 1;
    return this.padding.top + h - ((value - min) / range) * h;
  }

  gradientId(): string {
    return 'g' + this.color.replace(/[^a-z0-9]/gi, '') + String(this.chartData.length);
  }

  get stats() {
    if (!this.chartData.length) return null;
    const min = Math.min(...this.chartData);
    const max = Math.max(...this.chartData);
    const avg = this.chartData.reduce((a, b) => a + b, 0) / this.chartData.length;
    const first = this.chartData[0];
    const last = this.chartData[this.chartData.length - 1];
    const trend = last > first ? 'up' : last < first ? 'down' : 'neutral';
    const trendPercent = first !== 0 ? ((last - first) / first * 100) : 0;
    
    return {
      min: min,
      max: max,
      avg: avg,
      trend: trend,
      trendPercent: Math.abs(trendPercent),
      first: first,
      last: last,
      range: max - min
    };
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }
}
