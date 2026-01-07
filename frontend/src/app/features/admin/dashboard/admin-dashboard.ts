import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { SaleService, SaleDto } from '../../../core/services/sale.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  change?: number;
  link: string;
}

interface RecentActivity {
  type: 'sale' | 'user' | 'product' | 'review';
  message: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  currentDate = '';
  lastUpdated = '';

  // Stats
  stats: StatCard[] = [];
  
  // Recent sales
  recentSales: SaleDto[] = [];
  
  // Quick actions
  quickActions = [
    { label: 'Add Product', icon: '📦', link: '/admin/products', action: 'add' },
    { label: 'Add Category', icon: '🏷️', link: '/admin/categories', action: 'add' },
    { label: 'Export Data', icon: '📤', link: '/admin/data', action: 'export' },
    { label: 'Import Data', icon: '📥', link: '/admin/data', action: 'import' },
    { label: 'View Analytics', icon: '📊', link: '/analytics', action: 'view' },
    { label: 'Manage Users', icon: '👥', link: '/admin/users', action: 'manage' }
  ];

  // System health
  systemHealth = {
    database: 'Healthy',
    api: 'Operational',
    storage: '45%'
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private saleService: SaleService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.updateDateText();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateDateText(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      weekday: 'long'
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories(),
      sales: this.saleService.getSales()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ products, categories, sales }) => {
        // Calculate stats
        const totalRevenue = sales
          .filter(s => s.status === 'COMPLETED')
          .reduce((sum, s) => sum + s.totalAmount, 0);

        this.stats = [
          {
            title: 'Total Products',
            value: products.length,
            icon: '📦',
            color: '#6366f1',
            link: '/admin/products'
          },
          {
            title: 'Categories',
            value: categories.length,
            icon: '🏷️',
            color: '#8b5cf6',
            link: '/admin/categories'
          },
          {
            title: 'Total Sales',
            value: sales.length,
            icon: '💰',
            color: '#10b981',
            link: '/admin/sales'
          },
          {
            title: 'Revenue',
            value: this.formatCurrency(totalRevenue),
            icon: '💵',
            color: '#f59e0b',
            link: '/admin/sales'
          },
          {
            title: 'Pending Orders',
            value: sales.filter(s => s.status === 'PENDING').length,
            icon: '⏳',
            color: '#ef4444',
            link: '/admin/sales'
          },
          {
            title: 'Completed Orders',
            value: sales.filter(s => s.status === 'COMPLETED').length,
            icon: '✅',
            color: '#22c55e',
            link: '/admin/sales'
          }
        ];

        // Recent sales
        this.recentSales = sales
          .sort((a, b) => new Date(b.dateOfSale).getTime() - new Date(a.dateOfSale).getTime())
          .slice(0, 5);

        this.lastUpdated = new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        this.loading = false;
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.loading = false;
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'COMPLETED': 'status-completed',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'REFUNDED': 'status-refunded'
    };
    return statusClasses[status] || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
