import { Component, Input, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBarComponent } from '../profile-bar/profile-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-bar-chart',
  standalone: true,
  imports: [CommonModule, ProfileBarComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './kpi-bar-chart.html',
  styleUrls: ['./kpi-bar-chart.css']
})
export class KpiBarChartComponent implements OnInit, AfterViewInit {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() color = '#06b6d4';
  @Input() bars: number[] = [];
  @Input() showAxis = true;
  @Input() xAxisLabels?: string[]; // Optional labels for X-axis

  chartW = 360;
  chartH = 140;
  padding = { top: 10, right: 10, bottom: 30, left: 40 };
  animatedValue: number | string = '';
  barsAnimated = false;

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
      this.barsAnimated = true;
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

  computeBars(): { x: number; y: number; w: number; h: number; originalH: number }[] {
    const data = this.bars || [];
    if (!data.length) return [];
    const w = this.chartW - this.padding.left - this.padding.right;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const usableW = w;
    const barGap = Math.max(8, Math.floor(usableW / (data.length * 6)));
    const barW = Math.max(12, Math.floor((usableW - barGap * (data.length - 1)) / data.length));

    return data.map((v, i) => {
      const x = this.padding.left + i * (barW + barGap);
      const hPx = ((v - min) / range) * h;
      const y = this.padding.top + h - hPx;
      return { 
        x, 
        y, 
        w: barW, 
        h: Math.max(2, Math.round(hPx)),
        originalH: hPx
      };
    });
  }

  getXAxisLabels(): string[] {
    if (this.xAxisLabels && this.xAxisLabels.length === this.bars.length) {
      return this.xAxisLabels;
    }
    // Default: Generate day names for week
    if (this.bars.length === 7) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    // Default: Generate labels based on data length
    return this.bars.map((_, i) => {
      if (this.bars.length <= 7) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[i % 7] || `Day ${i + 1}`;
      } else if (this.bars.length <= 12) {
        return `M${i + 1}`;
      } else {
        return `${i + 1}`;
      }
    });
  }

  getYAxisTicks(): number[] {
    if (!this.bars.length) return [];
    const min = Math.min(...this.bars);
    const max = Math.max(...this.bars);
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
    if (!this.bars.length) return 0;
    const h = this.chartH - this.padding.top - this.padding.bottom;
    const min = Math.min(...this.bars);
    const max = Math.max(...this.bars);
    const range = max - min || 1;
    return this.padding.top + h - ((value - min) / range) * h;
  }

  gradientId(): string {
    return 'bg' + this.color.replace(/[^a-z0-9]/gi, '') + this.bars.length;
  }

  get stats() {
    if (!this.bars.length) return null;
    const min = Math.min(...this.bars);
    const max = Math.max(...this.bars);
    const avg = this.bars.reduce((a, b) => a + b, 0) / this.bars.length;
    const total = this.bars.reduce((a, b) => a + b, 0);
    const first = this.bars[0];
    const last = this.bars[this.bars.length - 1];
    const trend = last > first ? 'up' : last < first ? 'down' : 'neutral';
    const trendPercent = first !== 0 ? ((last - first) / first * 100) : 0;
    
    return {
      min: min,
      max: max,
      avg: avg,
      total: total,
      trend: trend,
      trendPercent: Math.abs(trendPercent),
      count: this.bars.length
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

  getBarValue(index: number): number {
    return this.bars[index] || 0;
  }

  getBarHeight(index: number): number {
    const bar = this.computeBars()[index];
    return bar ? bar.h : 0;
  }
}
