import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { KpiPieChartComponent } from '../../analytics/components/kpi-pie-chart/kpi-pie-chart';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { ReviewsAnalyticsComponent } from '../../analytics/components/reviews-analytics/reviews-analytics';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ReviewsSentimentAnalysisDto } from '../../../core/models/reviewsSentiment.model';

@Component({
  selector: 'app-reviews-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    KpiCardComponent,
    KpiPieChartComponent,
    ReviewsAnalyticsComponent
  ],
  templateUrl: './reviews-dashboard.html',
  styleUrls: ['./reviews-dashboard.css'],
})
export class ReviewsDashboard implements OnInit, OnDestroy, AfterViewInit {
  
  private destroy$ = new Subject<void>();
  isLoading = true;
  
  // Sentiment data from API
  sentimentData: ReviewsSentimentAnalysisDto[] = [];
  
  // Computed KPIs
  totalReviews = 0;
  positiveReviews = 0;
  neutralReviews = 0;
  negativeReviews = 0;
  positivePercentage = 0;
  averageSentimentScore = 0;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.analyticsService.getReviewsSentiment()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.sentimentData = data || [];
          this.calculateKPIs();
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        },
        error: (err) => {
          console.error('Reviews dashboard error:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  calculateKPIs(): void {
    this.totalReviews = this.sentimentData.reduce((sum, s) => sum + s.totalReviews, 0);
    this.positiveReviews = this.sentimentData.reduce((sum, s) => sum + s.positiveCount, 0);
    this.neutralReviews = this.sentimentData.reduce((sum, s) => sum + s.neutralCount, 0);
    this.negativeReviews = this.sentimentData.reduce((sum, s) => sum + s.negativeCount, 0);
    
    this.positivePercentage = this.totalReviews > 0 
      ? (this.positiveReviews / this.totalReviews) * 100 
      : 0;
    
    this.averageSentimentScore = this.totalReviews > 0
      ? ((this.positiveReviews - this.negativeReviews) / this.totalReviews) * 100
      : 0;
  }

  get kpis() {
    return [
      { 
        title: 'Total Reviews', 
        value: this.totalReviews, 
        subtitle: 'All products', 
        change: 0, 
        sparkline: [0], 
        accentColor: '#6366f1' 
      },
      { 
        title: 'Positive Reviews', 
        value: this.positiveReviews, 
        subtitle: `${this.positivePercentage.toFixed(1)}% of total`, 
        change: 0, 
        sparkline: [0], 
        accentColor: '#10b981' 
      },
      { 
        title: 'Neutral Reviews', 
        value: this.neutralReviews, 
        subtitle: `${this.totalReviews > 0 ? ((this.neutralReviews / this.totalReviews) * 100).toFixed(1) : 0}% of total`, 
        change: 0, 
        sparkline: [0], 
        accentColor: '#f59e0b' 
      },
      { 
        title: 'Negative Reviews', 
        value: this.negativeReviews, 
        subtitle: `${this.totalReviews > 0 ? ((this.negativeReviews / this.totalReviews) * 100).toFixed(1) : 0}% of total`, 
        change: 0, 
        sparkline: [0], 
        accentColor: '#ef4444' 
      },
    ];
  }

  get pieData() {
    return [
      { label: 'Positive', value: this.positiveReviews, color: '#10b981' },
      { label: 'Neutral', value: this.neutralReviews, color: '#f59e0b' },
      { label: 'Negative', value: this.negativeReviews, color: '#ef4444' }
    ];
  }

  get pieTotal(): number {
    return this.totalReviews;
  }

  get productsWithReviews(): number {
    return this.sentimentData.filter(s => s.totalReviews > 0).length;
  }
}

