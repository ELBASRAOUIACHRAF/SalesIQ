/**
 * SALES GROWTH RATE COMPONENT
 * ============================
 * Calculates and displays the growth rate between two time periods.
 * 
 * FLOW:
 * 1. User selects Period 1 (baseline) dates
 * 2. User selects Period 2 (comparison) dates
 * 3. User clicks "Calculate Growth Rate" button
 * 4. Component calls analyticsService.getSalesGrowthRate()
 * 5. Service makes HTTP GET to backend
 * 6. Backend calculates: ((period2Revenue - period1Revenue) / period1Revenue) * 100
 * 7. Returns percentage value
 */
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-growth-rate-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './growth-rate-card.html',
  styleUrls: ['./growth-rate-card.css']
})
export class GrowthRateCardComponent implements OnInit, OnDestroy {

  // ==========================================
  // RESULT DATA
  // ==========================================
  
  /** The calculated growth rate percentage */
  growthRate: number | null = null;

  // ==========================================
  // UI STATE
  // ==========================================
  
  isLoading = false;
  errorMessage = '';
  hasCalculated = false;

  // ==========================================
  // FORM INPUTS - Period 1 (Baseline)
  // ==========================================
  
  period1Start: string = '';
  period1End: string = '';

  // ==========================================
  // FORM INPUTS - Period 2 (Comparison)
  // ==========================================
  
  period2Start: string = '';
  period2End: string = '';

  // ==========================================
  // LIFECYCLE
  // ==========================================

  private destroy$ = new Subject<void>();

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Set default dates for easy testing
    // Period 1: Previous month
    const now = new Date();
    const period1End = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    const period1Start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of previous month
    
    // Period 2: Current month
    const period2Start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    const period2End = now; // Today

    this.period1Start = this.formatDateForInput(period1Start);
    this.period1End = this.formatDateForInput(period1End);
    this.period2Start = this.formatDateForInput(period2Start);
    this.period2End = this.formatDateForInput(period2End);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // BUTTON CLICK HANDLER
  // ==========================================

  /**
   * Called when user clicks "Calculate Growth Rate" button
   * 
   * FLOW:
   * 1. Validate all 4 date inputs
   * 2. Convert dates to ISO format
   * 3. Call service method
   * 4. Handle response
   */
  onCalculateClick(): void {
    // Step 1: Validate
    if (!this.period1Start || !this.period1End || !this.period2Start || !this.period2End) {
      this.errorMessage = 'Please fill in all date fields.';
      return;
    }

    if (new Date(this.period1Start) > new Date(this.period1End)) {
      this.errorMessage = 'Period 1: Start date must be before end date.';
      return;
    }

    if (new Date(this.period2Start) > new Date(this.period2End)) {
      this.errorMessage = 'Period 2: Start date must be before end date.';
      return;
    }

    // Step 2: Set loading state
    this.isLoading = true;
    this.errorMessage = '';
    this.hasCalculated = true;

    // Step 3: Convert to ISO format
    const p1Start = new Date(this.period1Start).toISOString();
    const p1End = new Date(this.period1End).toISOString();
    const p2Start = new Date(this.period2Start).toISOString();
    const p2End = new Date(this.period2End).toISOString();

    console.log('🚀 Calculating growth rate:', { p1Start, p1End, p2Start, p2End });

    // Step 4: Call service
    this.analyticsService.getSalesGrowthRate(p1Start, p1End, p2Start, p2End)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rate: number) => {
          console.log('✅ Growth rate received:', rate);
          this.growthRate = rate;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error calculating growth rate:', err);
          this.errorMessage = 'Failed to calculate growth rate. Is the backend running?';
          this.isLoading = false;
          this.growthRate = null;
          this.cdr.detectChanges();
        }
      });
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /** Determine if growth is positive, negative, or neutral */
  get growthStatus(): 'positive' | 'negative' | 'neutral' {
    if (this.growthRate === null) return 'neutral';
    if (this.growthRate > 0) return 'positive';
    if (this.growthRate < 0) return 'negative';
    return 'neutral';
  }

  /** Get icon based on growth status */
  get growthIcon(): string {
    switch (this.growthStatus) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➡️';
    }
  }
}
