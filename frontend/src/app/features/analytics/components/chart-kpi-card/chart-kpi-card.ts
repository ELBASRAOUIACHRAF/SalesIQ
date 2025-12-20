import { Component, Input, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBarComponent } from '../profile-bar/profile-bar';

@Component({
  selector: 'app-chart-kpi-card',
  standalone: true,
  imports: [CommonModule, ProfileBarComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './chart-kpi-card.html',
  styleUrls: ['./chart-kpi-card.css']
})
export class ChartKpiCardComponent implements OnInit, AfterViewInit {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() iconUrl?: string;
  @Input() iconClass?: string;
  @Input() change?: number;
  @Input() color = '#7C3AED';
  @Input() data: number[] = [];
  @Input() xAxisLabels?: string[]; // Optional labels for X-axis (e.g., ['Mon', 'Tue', 'Wed', ...])
  @Input() showAxes = true; // Show axes and labels

  chartW = 400;
  chartH = 140;
  padding = { top: 10, right: 10, bottom: 30, left: 40 }; // Space for axes
  animatedValue: number | string = '';
  chartAnimated = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (typeof this.value === 'number') {
      this.animateValue(0, this.value, 1000);
    } else {
      this.animatedValue = this.value;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.chartAnimated = true;
      this.cdr.markForCheck();
    }, 200);
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
    if (!this.data.length) return '';
    const w = this.chartW - this.padding.left - this.padding.right;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    return this.data.map((v, i) => {
      const x = this.padding.left + (i / (this.data.length - 1)) * w;
      const y = this.padding.top + h - ((v - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  areaPath(): string {
    const points = this.chartPoints();
    if (!points) return '';
    const w = this.chartW;
    const h = this.chartH;
    return `${points} ${w - this.padding.right},${h - this.padding.bottom} ${this.padding.left},${h - this.padding.bottom}`;
  }

  getXAxisLabels(): string[] {
    if (this.xAxisLabels && this.xAxisLabels.length === this.data.length) {
      return this.xAxisLabels;
    }
    // Default: Generate day names for week
    if (this.data.length === 7) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    // Default: Generate labels based on data length
    return this.data.map((_, i) => {
      if (this.data.length <= 7) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[i % 7] || `Day ${i + 1}`;
      } else if (this.data.length <= 12) {
        return `M${i + 1}`;
      } else {
        return `${i + 1}`;
      }
    });
  }

  getYAxisTicks(): number[] {
    if (!this.data.length) return [];
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
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
    if (!this.data.length) return 0;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;
    return this.padding.top + h - ((value - min) / range) * h;
  }

  gradientId(): string {
    return 'g' + this.color.replace(/[^a-z0-9]/gi, '') + String(this.data.length);
  }

  get stats() {
    if (!this.data.length) return null;
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const avg = this.data.reduce((a, b) => a + b, 0) / this.data.length;
    const first = this.data[0];
    const last = this.data[this.data.length - 1];
    const trend = last > first ? 'up' : last < first ? 'down' : 'neutral';
    const trendPercent = first !== 0 ? ((last - first) / first * 100) : 0;
    
    return {
      min: min,
      max: max,
      avg: avg,
      trend: trend,
      trendPercent: Math.abs(trendPercent),
      first: first,
      last: last
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

  getDataPointPosition(index: number): { x: number; y: number; value: number } {
    if (!this.data.length) return { x: 0, y: 0, value: 0 };
    const w = this.chartW - this.padding.left - this.padding.right;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;
    const value = this.data[index];
    const x = this.padding.left + (index / (this.data.length - 1)) * w;
    const y = this.padding.top + h - ((value - min) / range) * h;
    return { x, y, value };
  }
}
