import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ExecutiveDashboardDto } from '../../../../core/models/executiveDashboard.model';

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-dashboard.html',
  styleUrls: ['./executive-dashboard.css']
})
export class ExecutiveDashboardComponent implements OnInit, OnDestroy {

  dashboard: ExecutiveDashboardDto | null = null;
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Default date range: last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    this.analyticsService.getExecutiveDashboard(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Executive dashboard error:', err);
          this.errorMessage = 'Failed to load executive dashboard';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getHealthScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'poor';
  }

  getHealthLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  }

  getChangeIcon(value: number): string {
    if (value > 10) return '🚀';
    if (value > 0) return '📈';
    if (value < -10) return '📉';
    if (value < 0) return '↘️';
    return '➡️';
  }

  formatChange(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  getProgressBarStyle(value: number, max: number = 100): { width: string } {
    return { width: `${Math.min((value / max) * 100, 100)}%` };
  }

  get healthScorePercentage(): number {
    return this.dashboard?.healthScore || 0;
  }
}
