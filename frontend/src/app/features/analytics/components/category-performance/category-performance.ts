import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { CategoryPerformanceDto } from '../../../../core/models/categoryPerformance.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './category-performance.html',
  styleUrls: ['./category-performance.css']
})
export class CategoryPerformanceComponent implements OnInit, OnDestroy {

  categories: CategoryPerformanceDto[] = [];
  isLoading = true;
  errorMessage = '';
  
  // View options
  sortBy: 'revenue' | 'quantity' | 'sales' | 'name' = 'revenue';
  sortDirection: 'asc' | 'desc' = 'desc';
  viewMode: 'chart' | 'table' = 'chart';

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Default to last 365 days if no date range specified
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    this.analyticsService.getCategoryPerformance(startStr, endStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data || [];
          this.sortCategories();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Category Performance error:', err);
          this.errorMessage = 'Failed to load category performance data';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  sortCategories(): void {
    this.categories.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'revenue':
          comparison = a.totalRevenue - b.totalRevenue;
          break;
        case 'quantity':
          comparison = a.totalQuantitySold - b.totalQuantitySold;
          break;
        case 'sales':
          comparison = a.totalSales - b.totalSales;
          break;
        case 'name':
          comparison = a.categoryName.localeCompare(b.categoryName);
          break;
      }
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  setSortBy(field: 'revenue' | 'quantity' | 'sales' | 'name'): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.sortCategories();
  }

  // Computed values
  get totalRevenue(): number {
    return this.categories.reduce((sum, c) => sum + c.totalRevenue, 0);
  }

  get totalQuantity(): number {
    return this.categories.reduce((sum, c) => sum + c.totalQuantitySold, 0);
  }

  get totalSales(): number {
    return this.categories.reduce((sum, c) => sum + c.totalSales, 0);
  }

  get maxRevenue(): number {
    return Math.max(...this.categories.map(c => c.totalRevenue), 1);
  }

  get maxQuantity(): number {
    return Math.max(...this.categories.map(c => c.totalQuantitySold), 1);
  }

  // Helper methods
  getRevenuePercentage(revenue: number): number {
    return (revenue / this.maxRevenue) * 100;
  }

  getQuantityPercentage(quantity: number): number {
    return (quantity / this.maxQuantity) * 100;
  }

  getRevenueShare(revenue: number): number {
    return this.totalRevenue > 0 ? (revenue / this.totalRevenue) * 100 : 0;
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }

  getCategoryColor(index: number): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e', '#f97316', '#eab308',
      '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'
    ];
    return colors[index % colors.length];
  }
}
