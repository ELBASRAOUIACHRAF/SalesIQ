import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, of, finalize, forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { CategoryPerformanceComponent } from '../../analytics/components/category-performance/category-performance';
import { ApiService, CategoryDetailsDto, CategoryPerformanceDto } from '../../../core/services/app.service';

interface CategoryKpi {
  title: string;
  value: number | string;
  subtitle: string;
  change: number;
  sparkline: number[];
  accentColor: string;
}

interface CategoryWithPerformance extends CategoryDetailsDto {
  revenue?: number;
  quantitySold?: number;
  salesCount?: number;
}

@Component({
  selector: 'app-categories-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    KpiCardComponent,
    CategoryPerformanceComponent
  ],
  templateUrl: './categories-dashboard.html',
  styleUrls: ['./categories-dashboard.css'],
})
export class CategoriesDashboard implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // State
  loading = false;
  error: string | null = null;
  categories: CategoryWithPerformance[] = [];
  categoryPerformance: CategoryPerformanceDto[] = [];
  kpis: CategoryKpi[] = [];

  // View state
  searchTerm = '';
  sortBy: 'name' | 'products' | 'revenue' | 'status' = 'revenue';
  sortDirection: 'asc' | 'desc' = 'desc';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  loadData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      categories: this.apiService.getCategoriesDetails().pipe(catchError(() => of([]))),
      performance: this.apiService.getCategoryPerformance().pipe(catchError(() => of([])))
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    )
    .subscribe({
      next: ({ categories, performance }) => {
        this.categoryPerformance = performance;
        
        // Merge category details with performance data
        this.categories = categories.map(cat => {
          const perf = performance.find(p => p.categoryId === cat.id);
          return {
            ...cat,
            revenue: perf?.totalRevenue || 0,
            quantitySold: perf?.totalQuantitySold || 0,
            salesCount: perf?.totalSales || 0
          };
        });

        this.calculateKpis();
        
        // Force change detection and trigger resize for components
        this.ngZone.run(() => {
          this.cdr.detectChanges();
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            this.cdr.detectChanges();
          }, 100);
        });
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.error = err?.message || 'Failed to load categories';
      }
    });
  }

  private calculateKpis(): void {
    const cats = this.categories;
    const totalCategories = cats.length;
    const activeCategories = cats.filter(c => c.isActive).length;
    const totalProducts = cats.reduce((sum, c) => sum + (c.productCount || 0), 0);
    const avgProductsPerCategory = totalCategories > 0 ? Math.round(totalProducts / totalCategories) : 0;
    const totalRevenue = cats.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const topCategory = cats.reduce((max, c) => (c.revenue || 0) > (max?.revenue || 0) ? c : max, cats[0]);

    const generateSparkline = (baseValue: number): number[] => {
      const variation = baseValue * 0.1;
      return Array.from({ length: 7 }, (_, i) => {
        const progress = i / 6;
        return Math.round(baseValue * (0.85 + progress * 0.15) + (Math.random() - 0.5) * variation);
      });
    };

    this.kpis = [
      {
        title: 'Total Categories',
        value: totalCategories,
        subtitle: `${activeCategories} Active`,
        change: activeCategories > 0 ? (activeCategories / totalCategories) * 100 : 0,
        sparkline: generateSparkline(totalCategories),
        accentColor: '#6366f1'
      },
      {
        title: 'Total Products',
        value: totalProducts,
        subtitle: 'Across categories',
        change: 5.2,
        sparkline: generateSparkline(totalProducts),
        accentColor: '#8b5cf6'
      },
      {
        title: 'Avg Products/Category',
        value: avgProductsPerCategory,
        subtitle: 'Per category',
        change: 3.1,
        sparkline: generateSparkline(avgProductsPerCategory || 1),
        accentColor: '#10b981'
      },
      {
        title: 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        subtitle: topCategory?.name || 'N/A',
        change: 12.5,
        sparkline: generateSparkline(totalRevenue || 1),
        accentColor: '#f59e0b'
      }
    ];
  }

  // Filtered and sorted categories
  get filteredCategories(): CategoryWithPerformance[] {
    let result = [...this.categories];

    // Filter by search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.description?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      result = result.filter(c => 
        this.filterStatus === 'active' ? c.isActive : !c.isActive
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'products':
          comparison = (a.productCount || 0) - (b.productCount || 0);
          break;
        case 'revenue':
          comparison = (a.revenue || 0) - (b.revenue || 0);
          break;
        case 'status':
          comparison = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
          break;
      }
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }

  // Sort handler
  setSortBy(field: 'name' | 'products' | 'revenue' | 'status'): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
  }

  // Helpers
  formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }

  getRevenuePercentage(revenue: number): number {
    const maxRevenue = Math.max(...this.categories.map(c => c.revenue || 0), 1);
    return (revenue / maxRevenue) * 100;
  }
}

