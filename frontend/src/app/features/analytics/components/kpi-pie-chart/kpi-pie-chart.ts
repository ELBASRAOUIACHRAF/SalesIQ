import { Component, Input, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PieSegment { label: string; value: number; color?: string }

@Component({
  selector: 'app-kpi-pie-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './kpi-pie-chart.html',
  styleUrls: ['./kpi-pie-chart.css']
})
export class KpiPieChartComponent implements OnInit, AfterViewInit {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() segments: PieSegment[] = [];
  @Input() diameter = 120;

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

  get total(): number {
    return this.segments.reduce((s, seg) => s + (seg?.value || 0), 0);
  }

  get radius(): number {
    return (this.diameter - 12) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  getSlices(): { dash: number; gap: number; offset: number; color: string }[] {
    const circ = this.circumference;
    const total = this.total || 1;
    let offset = 0;
    return this.segments.map(seg => {
      const frac = (seg.value || 0) / total;
      const dash = +(circ * frac).toFixed(2);
      const gap = +(circ - dash).toFixed(2);
      const res = { dash, gap, offset: +offset.toFixed(2), color: seg.color || '#60a5fa' };
      offset += dash;
      return res;
    });
  }

  formatValue(): string {
    if (typeof this.animatedValue === 'number') {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(this.animatedValue);
    }
    return String(this.animatedValue || this.value);
  }
}
