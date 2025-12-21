/**
 * SALES TREND CHART COMPONENT
 * ============================
 * This component demonstrates how to connect Angular frontend to Spring Boot backend.
 * 
 * FLOW EXPLANATION:
 * 1. User fills in: startDate, endDate, granularity (inputs bound via [(ngModel)])
 * 2. User clicks "Analyze" button
 * 3. Button click triggers: (click)="onAnalyzeClick()"
 * 4. onAnalyzeClick() calls: this.analyticsService.getSalesTrend(...)
 * 5. Service makes HTTP GET to: http://localhost:8080/api/v1/analytics/sales-trend
 * 6. Backend Controller receives request, calls Service, returns DTO as JSON
 * 7. Angular receives JSON, maps to TypeScript interface
 * 8. Component updates UI with the data
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { SalesTrendAnalysisDto, TimeGranularity } from '../../../../core/models/salesTrend.model';

@Component({
  selector: 'app-sales-trend-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-trend-chart.html',
  styleUrls: ['./sales-trend-chart.css']
})
export class SalesTrendChartComponent implements OnInit, OnDestroy {
  
  // ==========================================
  // COMPONENT STATE
  // ==========================================
  
  /** Data received from the backend API */
  salesTrendData: SalesTrendAnalysisDto | null = null;
  
  /** Loading state - shows spinner while waiting for API response */
  isLoading = false;
  
  /** Error message to display if API call fails */
  errorMessage = '';
  
  /** Flag to track if user has made at least one request */
  hasSearched = false;

  // ==========================================
  // FORM INPUTS (bound to template via ngModel)
  // ==========================================
  
  /** Selected time granularity - bound to <select> via [(ngModel)] */
  selectedGranularity: TimeGranularity = 'DAILY';
  
  /** Start date string - bound to <input type="date"> via [(ngModel)] */
  startDate: string = '';
  
  /** End date string - bound to <input type="date"> via [(ngModel)] */
  endDate: string = '';
  
  /** Options for the granularity dropdown */
  granularityOptions: TimeGranularity[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
  
  // ==========================================
  // LIFECYCLE
  // ==========================================
  
  private destroy$ = new Subject<void>();

  /**
   * Inject the AnalyticsService via constructor
   * Angular's DI system provides the singleton instance
   */
  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    // Set default date range (last 30 days) when component loads
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);
    
    // NOTE: We do NOT auto-load data anymore
    // User must click the button to trigger the API call
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // BUTTON CLICK HANDLER - THE MAIN ACTION
  // ==========================================

  /**
   * THIS IS THE KEY METHOD!
   * Called when user clicks the "Analyze Sales Trend" button.
   * 
   * FLOW:
   * 1. Validate inputs
   * 2. Set loading state
   * 3. Convert dates to ISO format (backend expects ISO strings)
   * 4. Call analyticsService.getSalesTrend() - this makes the HTTP request
   * 5. Subscribe to the Observable to handle response/error
   */
  onAnalyzeClick(): void {
    // Step 1: Validate inputs
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Please select both start and end dates.';
      return;
    }

    if (new Date(this.startDate) > new Date(this.endDate)) {
      this.errorMessage = 'Start date must be before end date.';
      return;
    }

    // Step 2: Set loading state (shows spinner in UI)
    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    // Step 3: Convert date strings to ISO format for backend
    // Backend expects: "2024-01-01T00:00:00.000Z"
    const startISO = new Date(this.startDate).toISOString();
    const endISO = new Date(this.endDate).toISOString();

    console.log('🚀 Making API call with:', {
      startDate: startISO,
      endDate: endISO,
      granularity: this.selectedGranularity
    });

    // Step 4 & 5: Call the service and subscribe to the response
    // 
    // What happens inside getSalesTrend():
    //   - HttpClient.get() creates an HTTP GET request
    //   - Request goes to: http://localhost:8080/api/v1/analytics/sales-trend
    //   - Query params: ?startDate=...&endDate=...&granularity=...
    //   - Backend processes and returns JSON
    //   - Angular deserializes JSON to SalesTrendAnalysisDto
    //
    this.analyticsService.getSalesTrend(startISO, endISO, this.selectedGranularity)
      .pipe(takeUntil(this.destroy$))  // Auto-unsubscribe when component is destroyed
      .subscribe({
        // SUCCESS: Backend returned data
        next: (data: SalesTrendAnalysisDto) => {
          console.log('✅ API Response received:', data);
          this.salesTrendData = data;  // Store data for template to display
          this.isLoading = false;       // Hide spinner
        },
        // ERROR: Something went wrong
        error: (err) => {
          console.error('❌ API Error:', err);
          this.errorMessage = 'Failed to load sales trend data. Make sure the backend is running.';
          this.isLoading = false;
          this.salesTrendData = null;
        }
      });
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /** Format Date object to 'YYYY-MM-DD' for input[type="date"] */
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /** Calculate total revenue from all data points */
  get totalRevenue(): number {
    if (!this.salesTrendData?.points) return 0;
    return this.salesTrendData.points.reduce((sum, p) => sum + (p.revenue || 0), 0);
  }

  /** Calculate total sales count from all data points */
  get totalSalesCount(): number {
    if (!this.salesTrendData?.points) return 0;
    return this.salesTrendData.points.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  }

  /** Get formatted labels for the chart X-axis */
  get chartLabels(): string[] {
    if (!this.salesTrendData?.points) return [];
    return this.salesTrendData.points.map(p => 
      new Date(p.periodStart).toLocaleDateString()
    );
  }

  /** Get revenue values for chart visualization */
  get chartValues(): number[] {
    if (!this.salesTrendData?.points) return [];
    return this.salesTrendData.points.map(p => p.revenue);
  }
}
