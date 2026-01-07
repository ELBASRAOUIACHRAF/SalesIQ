import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ChurnAnalysisDto, defaultChurnAnalysis } from '../../../../core/models/churnAnalysis.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-churn-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './churn-analysis.html',
  styleUrls: ['./churn-analysis.css']
})
export class ChurnAnalysisComponent implements OnInit, OnDestroy {

  // Data from backend
  churnData: ChurnAnalysisDto = defaultChurnAnalysis;

  // UI States
  isLoading = false;
  errorMessage = '';
  hasAnalyzed = false;

  // Form inputs
  startDate: string = '';
  endDate: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Set default dates (last 3 months)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    
    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);
    
    // Auto-load on init
    this.onAnalyzeClick();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAnalyzeClick(): void {
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Please select both dates';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasAnalyzed = true;

    const startISO = new Date(this.startDate).toISOString();
    const endISO = new Date(this.endDate).toISOString();

    this.analyticsService.getChurnAnalysis(startISO, endISO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.churnData = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Churn analysis error:', err);
          this.errorMessage = 'Failed to load churn analysis';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Determine churn severity
  get churnSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    const rate = this.churnData.churnRate || 0;
    if (rate < 5) return 'low';
    if (rate < 15) return 'medium';
    if (rate < 30) return 'high';
    return 'critical';
  }

  // Retention rate (inverse of churn)
  get retentionRate(): number {
    return 100 - (this.churnData.churnRate || 0);
  }

  // Progress bar width for churn rate
  get churnBarWidth(): string {
    return `${Math.min(this.churnData.churnRate || 0, 100)}%`;
  }
}
