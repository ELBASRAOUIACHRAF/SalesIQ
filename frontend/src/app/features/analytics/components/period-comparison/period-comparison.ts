import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { PeriodComparisonDto } from '../../../../core/models/periodComparison.model';

@Component({
  selector: 'app-period-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './period-comparison.html',
  styleUrls: ['./period-comparison.css']
})
export class PeriodComparisonComponent implements OnInit, OnDestroy {

  comparison: PeriodComparisonDto | null = null;
  isLoading = false;
  errorMessage = '';

  // Period Configuration
  periods = {
    current: { start: '', end: '' },
    previous: { start: '', end: '' }
  };

  // Quick Presets
  presets = [
    { label: 'This Month vs Last Month', value: 'month' },
    { label: 'This Quarter vs Last Quarter', value: 'quarter' },
    { label: 'This Year vs Last Year', value: 'year' },
    { label: 'Last 7 Days vs Previous 7', value: 'week' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.applyPreset('month');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyPreset(preset: string): void {
    const today = new Date();
    
    switch (preset) {
      case 'week':
        const weekEnd = new Date(today);
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 6);
        this.periods.current.start = weekStart.toISOString().split('T')[0];
        this.periods.current.end = weekEnd.toISOString().split('T')[0];
        
        const prevWeekEnd = new Date(weekStart);
        prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
        const prevWeekStart = new Date(prevWeekEnd);
        prevWeekStart.setDate(prevWeekStart.getDate() - 6);
        this.periods.previous.start = prevWeekStart.toISOString().split('T')[0];
        this.periods.previous.end = prevWeekEnd.toISOString().split('T')[0];
        break;

      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.periods.current.start = monthStart.toISOString().split('T')[0];
        this.periods.current.end = monthEnd.toISOString().split('T')[0];
        
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        this.periods.previous.start = prevMonthStart.toISOString().split('T')[0];
        this.periods.previous.end = prevMonthEnd.toISOString().split('T')[0];
        break;

      case 'quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
        const quarterEnd = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
        this.periods.current.start = quarterStart.toISOString().split('T')[0];
        this.periods.current.end = quarterEnd.toISOString().split('T')[0];

        const prevQuarterStart = new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1);
        const prevQuarterEnd = new Date(today.getFullYear(), currentQuarter * 3, 0);
        this.periods.previous.start = prevQuarterStart.toISOString().split('T')[0];
        this.periods.previous.end = prevQuarterEnd.toISOString().split('T')[0];
        break;

      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        this.periods.current.start = yearStart.toISOString().split('T')[0];
        this.periods.current.end = yearEnd.toISOString().split('T')[0];

        const prevYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const prevYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        this.periods.previous.start = prevYearStart.toISOString().split('T')[0];
        this.periods.previous.end = prevYearEnd.toISOString().split('T')[0];
        break;
    }

    this.loadComparison();
  }

  loadComparison(): void {
    if (!this.isValidDates()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.comparePeriods(
      this.periods.current.start,
      this.periods.current.end,
      this.periods.previous.start,
      this.periods.previous.end
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.comparison = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Period comparison error:', err);
        this.errorMessage = 'Failed to load comparison data';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isValidDates(): boolean {
    return !!(
      this.periods.current.start && 
      this.periods.current.end && 
      this.periods.previous.start && 
      this.periods.previous.end
    );
  }

  getChangeClass(change: number): string {
    if (change > 10) return 'very-positive';
    if (change > 0) return 'positive';
    if (change < -10) return 'very-negative';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  getChangeIcon(change: number): string {
    if (change > 20) return '🚀';
    if (change > 0) return '📈';
    if (change < -20) return '📉';
    if (change < 0) return '↘️';
    return '➡️';
  }

  formatChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  getBarWidth(current: number, previous: number): { current: string; previous: string } {
    const max = Math.max(current, previous);
    if (max === 0) return { current: '0%', previous: '0%' };
    return {
      current: `${(current / max) * 100}%`,
      previous: `${(previous / max) * 100}%`
    };
  }
}
