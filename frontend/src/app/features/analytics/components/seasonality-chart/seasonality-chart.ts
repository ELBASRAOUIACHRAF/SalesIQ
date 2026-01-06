import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { SeasonalityAnalysisDto, TimeSeriesPointDto } from '../../../../core/models/seasonality.model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartKpiCardComponent } from '../chart-kpi-card/chart-kpi-card';

@Component({
  selector: 'app-seasonality-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartKpiCardComponent],
  templateUrl: './seasonality-chart.html',
  styleUrls: ['./seasonality-chart.css']
})
export class SeasonalityAnalysisComponent implements OnInit, OnDestroy {

  // ==========================================
  // RESULT DATA
  // ==========================================
  
  seasonalityType: string = 'NONE';
  seasonalityStrength = 0;

  originalValues: number[] = [];
  trendValues: number[] = [];
  seasonalValues: number[] = [];
  residualValues: number[] = [];

  originalLabels: string[] = [];
  trendLabels: string[] = [];
  seasonalLabels: string[] = [];
  residualLabels: string[] = [];

  // ==========================================
  // UI STATE
  // ==========================================
  
  isLoading = false;
  errorMessage = '';
  hasAnalyzed = false;

  // ==========================================
  // FORM INPUTS
  // ==========================================
  
  startDate: string = '';
  endDate: string = '';

  // ==========================================
  // LIFECYCLE
  // ==========================================
  
  private destroy$ = new Subject<void>();

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Set default dates (last 6 months)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    
    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);

    // Auto-load seasonality analysis on component initialization
    this.onAnalyzeClick();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // BUTTON CLICK HANDLER
  // ==========================================

  /**
   * Called when user clicks "Analyze Seasonality" button
   */
  onAnalyzeClick(): void {
    // Validate
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Please select both start and end dates.';
      return;
    }

    if (new Date(this.startDate) > new Date(this.endDate)) {
      this.errorMessage = 'Start date must be before end date.';
      return;
    }

    // Set loading state
    this.isLoading = true;
    this.errorMessage = '';
    this.hasAnalyzed = true;

    // Convert to LocalDateTime format (without milliseconds and timezone)
    // Java expects: 2025-01-01T00:00:00 (not 2025-01-01T00:00:00.000Z)
    const startISO = this.formatToLocalDateTime(new Date(this.startDate));
    const endISO = this.formatToLocalDateTime(new Date(this.endDate));

    console.log('🚀 Analyzing seasonality:', { startISO, endISO });

    // Call service
    this.analyticsService.analyzeSeasonality(startISO, endISO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SeasonalityAnalysisDto) => {
          console.log('✅ Seasonality data received:', data);
          this.seasonalityType = data.seasonalityType;
          this.seasonalityStrength = data.seasonalityStrength;

          this.setSeries('original', data.originalSeries || []);
          this.setSeries('trend', data.trendSeries || []);
          this.setSeries('seasonal', data.seasonalSeries || []);
          this.setSeries('residual', data.residualSeries || []);
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Seasonality analysis error:', err);
          this.errorMessage = 'Failed to analyze seasonality. Is the backend running?';
          this.isLoading = false;
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

  /**
   * Format date to LocalDateTime format expected by Java backend
   * Returns: "2025-01-01T00:00:00" (no milliseconds, no timezone Z)
   */
  private formatToLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private setSeries(name: 'original' | 'trend' | 'seasonal' | 'residual', series: TimeSeriesPointDto[]) {
    const labels = (series || []).map(p => {
      const ts = p?.timestamp ? new Date(p.timestamp) : null;
      return ts ? ts.toISOString().split('T')[0] : '';
    });
    const values = (series || []).map(p => (typeof p?.value === 'number' ? p.value : 0));

    switch (name) {
      case 'original':
        this.originalLabels = labels; this.originalValues = values; break;
      case 'trend':
        this.trendLabels = labels; this.trendValues = values; break;
      case 'seasonal':
        this.seasonalLabels = labels; this.seasonalValues = values; break;
      case 'residual':
        this.residualLabels = labels; this.residualValues = values; break;
    }
  }

  /** Check if we have data to display */
  get hasData(): boolean {
    return this.originalValues.length > 0 || this.trendValues.length > 0;
  }
}
