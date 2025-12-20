import { Component, Input, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './kpi-card.html',
  styleUrls: ['./kpi-card.css'],
})
export class KpiCardComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('valueElement', { static: false }) valueElement?: ElementRef;

  @Input() title = '';
  @Input() value: number | string = '';
  @Input() subtitle?: string;

  @Input() iconUrl?: string;
  @Input() iconClass?: string;

  /** percentage change */
  @Input() change?: number;

  /** sparkline values */
  @Input() sparkline: number[] = [];

  /** accent color */
  @Input() accentColor = '#6C5CE7';

  /** animated value for counting effect */
  animatedValue: number | string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (typeof this.value === 'number') {
      this.animateValue(0, this.value, 1000);
    } else {
      this.animatedValue = this.value;
    }
  }

  ngAfterViewInit() {
    // Trigger sparkline animation - only in browser
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => {
        const svg = document.querySelector('.kpi-spark svg polyline');
        if (svg) {
          svg.classList.add('animated');
        }
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && typeof this.value === 'number') {
      const oldValue = typeof changes['value'].previousValue === 'number' 
        ? changes['value'].previousValue 
        : 0;
      this.animateValue(oldValue, this.value, 800);
    } else if (changes['value']) {
      this.animatedValue = this.value;
    }
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
      
      // Easing function for smooth animation
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
      return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(this.animatedValue);
    }
    return String(this.animatedValue || this.value);
  }

  sparkPoints(): string {
    if (!this.sparkline.length) {
      return '';
    }

    const w = 120;
    const h = 32;
    const min = Math.min(...this.sparkline);
    const max = Math.max(...this.sparkline);
    const range = max - min || 1;

    return this.sparkline
      .map((v, i) => {
        const x = (i / (this.sparkline.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
      })
      .join(' ');
  }
}
