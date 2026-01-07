import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { RFMSegmentDto } from '../../../../core/models/rfmAnalysis.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rfm-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './rfm-analysis.html',
  styleUrls: ['./rfm-analysis.css']
})
export class RfmAnalysisComponent implements OnInit, OnDestroy {

  customers: RFMSegmentDto[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filter by segment
  selectedSegment: string = 'all';
  
  private destroy$ = new Subject<void>();

  // Segment colors mapping
  segmentColors: { [key: string]: string } = {
    'Champions': '#10b981',
    'Loyal Customers': '#3b82f6',
    'Potential Loyalists': '#6366f1',
    'Recent Customers': '#8b5cf6',
    'Promising': '#a855f7',
    'Need Attention': '#f59e0b',
    'About to Sleep': '#f97316',
    'At Risk': '#ef4444',
    'Cannot Lose Them': '#dc2626',
    'Hibernating': '#6b7280',
    'Lost': '#374151'
  };

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRFMAnalysis();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRFMAnalysis(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log(' RFM Component: Calling getRFMAnalysis()...');

    this.analyticsService.getRFMAnalysis()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log(' RFM Component: Received data:', data);
          this.customers = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('RFM Analysis error:', err);
          this.errorMessage = 'Failed to load RFM Analysis';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get filteredCustomers(): RFMSegmentDto[] {
    if (this.selectedSegment === 'all') {
      return this.customers;
    }
    return this.customers.filter(c => c.segment === this.selectedSegment);
  }

  get uniqueSegments(): string[] {
    return [...new Set(this.customers.map(c => c.segment))];
  }

  get segmentStats(): { segment: string; count: number; avgMonetary: number; color: string }[] {
    const stats: { [key: string]: { count: number; totalMonetary: number } } = {};
    
    this.customers.forEach(c => {
      if (!stats[c.segment]) {
        stats[c.segment] = { count: 0, totalMonetary: 0 };
      }
      stats[c.segment].count++;
      stats[c.segment].totalMonetary += c.monetary;
    });
    
    return Object.entries(stats).map(([segment, data]) => ({
      segment,
      count: data.count,
      avgMonetary: data.totalMonetary / data.count,
      color: this.segmentColors[segment] || '#6b7280'
    })).sort((a, b) => b.count - a.count);
  }

  get totalCustomers(): number {
    return this.customers.length;
  }

  get avgRecency(): number {
    if (!this.customers.length) return 0;
    return this.customers.reduce((sum, c) => sum + c.recency, 0) / this.customers.length;
  }

  get avgFrequency(): number {
    if (!this.customers.length) return 0;
    return this.customers.reduce((sum, c) => sum + c.frequency, 0) / this.customers.length;
  }

  get avgMonetary(): number {
    if (!this.customers.length) return 0;
    return this.customers.reduce((sum, c) => sum + c.monetary, 0) / this.customers.length;
  }

  getSegmentColor(segment: string): string {
    return this.segmentColors[segment] || '#6b7280';
  }

  getScoreWidth(score: number): string {
    return `${(score / 5) * 100}%`;
  }

  setSegmentFilter(segment: string): void {
    this.selectedSegment = segment;
  }
}
