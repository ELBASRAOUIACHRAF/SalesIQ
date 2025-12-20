import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { ChartKpiCardComponent } from '../../analytics/components/chart-kpi-card/chart-kpi-card';
import { KpiPieChartComponent } from '../../analytics/components/kpi-pie-chart/kpi-pie-chart';
import { KpiBarChartComponent } from '../../analytics/components/kpi-bar-chart/kpi-bar-chart';
import { BigCardComponent } from '../../analytics/components/big-kpi-card/big-kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { ApiService } from '../../../core/services/app.service';

@Component({
  selector: 'app-products-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    KpiCardComponent,
    ChartKpiCardComponent,
    BigCardComponent,
    KpiBarChartComponent,
    KpiPieChartComponent
  ],
  templateUrl: './products-dashboard.html',
  styleUrls: ['./products-dashboard.css'],
})
export class ProductsDashboard implements OnInit {
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  loading = false;
  error: string | null = null;
  products: any[] = [];

  fetchProducts(): void {
    this.loading = true;
    this.error = null;
    this.apiService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products || [];
        console.log('Products from DB:', this.products);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch products', err);
        this.error = err?.message || String(err);
        this.loading = false;
      }
    });
  }

  kpis = [
    { title: 'Total Products', value: 1247, subtitle: 'Active', change: 5.2, sparkline: [1200, 1210, 1220, 1230, 1240, 1245, 1247], accentColor: '#6366f1' },
    { title: 'Low Stock', value: 23, subtitle: 'Items', change: -12.5, sparkline: [30, 28, 26, 25, 24, 23, 23], accentColor: '#ef4444' },
    { title: 'New This Month', value: 89, subtitle: 'Products', change: 15.8, sparkline: [70, 75, 80, 82, 85, 87, 89], accentColor: '#10b981' },
    { title: 'Avg. Price', value: 45.99, subtitle: 'USD', change: 2.1, sparkline: [44, 44.5, 45, 45.5, 45.8, 45.9, 45.99], accentColor: '#f59e0b' },
  ];

  chartCards = [
    { title: 'Product Sales', value: 89234, subtitle: 'Last 30 days', color: '#6366f1', data: [8000, 8500, 8200, 9000, 9500, 9200, 9800] },
    { title: 'Inventory Value', value: 456789, subtitle: 'Total', color: '#10b981', data: [400000, 420000, 410000, 440000, 450000, 455000, 456789] }
  ];

  barCards = [
    { title: 'Top Categories', value: 12, subtitle: 'Active', color: '#6366f1', bars: [15, 12, 10, 8, 6, 5, 4] },
    { title: 'Product Views', value: 34567, subtitle: 'This week', color: '#8b5cf6', bars: [4000, 4500, 5000, 4800, 5200, 5100, 5500] }
  ];

  pieData = [
    { label: 'In Stock', value: 75, color: '#10b981' },
    { label: 'Low Stock', value: 15, color: '#f59e0b' },
    { label: 'Out of Stock', value: 10, color: '#ef4444' }
  ];

  get pieTotal(): number {
    return this.pieData.reduce((sum, p) => sum + (p.value || 0), 0);
  }
}

