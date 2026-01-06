import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ProductService } from '../../../../core/services/product.service';
import { ReviewsSentimentAnalysisDto } from '../../../../core/models/reviewsSentiment.model';
import { TopicDto } from '../../../../core/models/topic.model';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-reviews-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews-analytics.html',
  styleUrls: ['./reviews-analytics.css']
})
export class ReviewsAnalyticsComponent implements OnInit, OnDestroy {

  // Sentiment Analysis Data
  sentimentData: ReviewsSentimentAnalysisDto[] = [];
  isLoadingSentiment = true;
  sentimentError = '';

  // Topic Extraction Data
  products: Product[] = [];
  selectedProductId: number | null = null;
  topics: TopicDto[] = [];
  isLoadingTopics = false;
  topicsError = '';

  // View Options
  viewMode: 'overview' | 'details' = 'overview';
  sortBy: 'reviews' | 'positive' | 'negative' | 'sentiment' = 'reviews';
  sortDirection: 'asc' | 'desc' = 'desc';

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData(): void {
    this.isLoadingSentiment = true;
    this.sentimentError = '';

    forkJoin({
      sentiment: this.analyticsService.getReviewsSentiment(),
      products: this.productService.getProducts()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ sentiment, products }) => {
        this.sentimentData = sentiment || [];
        this.products = products || [];
        this.sortSentimentData();
        this.isLoadingSentiment = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Reviews analytics error:', err);
        this.sentimentError = 'Failed to load reviews sentiment data';
        this.isLoadingSentiment = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTopics(): void {
    if (!this.selectedProductId) {
      this.topics = [];
      return;
    }

    this.isLoadingTopics = true;
    this.topicsError = '';

    this.analyticsService.getReviewTopics(this.selectedProductId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topics = data || [];
          this.isLoadingTopics = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Topics extraction error:', err);
          this.topicsError = 'Failed to extract topics for this product';
          this.isLoadingTopics = false;
          this.cdr.detectChanges();
        }
      });
  }

  onProductSelect(): void {
    this.loadTopics();
  }

  sortSentimentData(): void {
    this.sentimentData.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'reviews':
          comparison = a.totalReviews - b.totalReviews;
          break;
        case 'positive':
          comparison = a.positiveCount - b.positiveCount;
          break;
        case 'negative':
          comparison = a.negativeCount - b.negativeCount;
          break;
        case 'sentiment':
          comparison = this.getSentimentScore(a) - this.getSentimentScore(b);
          break;
      }
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  setSortBy(field: 'reviews' | 'positive' | 'negative' | 'sentiment'): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.sortSentimentData();
  }

  // Computed values
  get totalReviews(): number {
    return this.sentimentData.reduce((sum, s) => sum + s.totalReviews, 0);
  }

  get totalPositive(): number {
    return this.sentimentData.reduce((sum, s) => sum + s.positiveCount, 0);
  }

  get totalNeutral(): number {
    return this.sentimentData.reduce((sum, s) => sum + s.neutralCount, 0);
  }

  get totalNegative(): number {
    return this.sentimentData.reduce((sum, s) => sum + s.negativeCount, 0);
  }

  get overallSentimentScore(): number {
    if (this.totalReviews === 0) return 0;
    return ((this.totalPositive - this.totalNegative) / this.totalReviews) * 100;
  }

  get positivePercentage(): number {
    return this.totalReviews > 0 ? (this.totalPositive / this.totalReviews) * 100 : 0;
  }

  get neutralPercentage(): number {
    return this.totalReviews > 0 ? (this.totalNeutral / this.totalReviews) * 100 : 0;
  }

  get negativePercentage(): number {
    return this.totalReviews > 0 ? (this.totalNegative / this.totalReviews) * 100 : 0;
  }

  get productsWithReviews(): number {
    return this.sentimentData.filter(s => s.totalReviews > 0).length;
  }

  // Helper methods
  getSentimentScore(item: ReviewsSentimentAnalysisDto): number {
    if (item.totalReviews === 0) return 0;
    return ((item.positiveCount - item.negativeCount) / item.totalReviews) * 100;
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.name || `Product #${productId}`;
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIVE': return 'sentiment-positive';
      case 'NEUTRAL': return 'sentiment-neutral';
      case 'NEGATIVE': return 'sentiment-negative';
      default: return '';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIVE': return '😊';
      case 'NEUTRAL': return '😐';
      case 'NEGATIVE': return '😞';
      default: return '❓';
    }
  }

  getTopicSentimentClass(avgSentiment: number): string {
    if (avgSentiment >= 0.3) return 'topic-positive';
    if (avgSentiment <= -0.3) return 'topic-negative';
    return 'topic-neutral';
  }

  getBarWidth(count: number, max: number): number {
    return max > 0 ? (count / max) * 100 : 0;
  }

  get maxReviews(): number {
    return Math.max(...this.sentimentData.map(s => s.totalReviews), 1);
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getSelectedProduct(): Product | undefined {
    return this.products.find(p => p.id === this.selectedProductId);
  }
}
