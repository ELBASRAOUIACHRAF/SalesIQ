import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card';
import { ChartKpiCardComponent } from '../../components/chart-kpi-card/chart-kpi-card';
import { KpiPieChartComponent } from '../../components/kpi-pie-chart/kpi-pie-chart';
import { TopBarComponent } from '../../components/top-bar/top-bar';

import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ExecutiveDashboardDto } from '../../../../core/models/executiveDashboard.model';

interface DashboardKpi {
  title: string;
  value: number | string;
  subtitle: string;
  change: number;
  sparkline: number[];
  accentColor: string;
}

interface Insight {
  icon: string;
  title: string;
  value: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    KpiCardComponent,
    ChartKpiCardComponent,
    KpiPieChartComponent
  ],
  templateUrl: './analytics-dashboard.html',
  styleUrls: ['./analytics-dashboard.css'],
})
export class AnalyticsDashboard implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  loading = true;
  error: string | null = null;
  dashboardData: ExecutiveDashboardDto | null = null;

  // New properties for enhanced UI
  currentDateText = '';
  lastUpdated = '';
  healthStatus = 'Good';
  insights: Insight[] = [];

  // KPI Cards - will be populated from API
  kpis: DashboardKpi[] = [];

  // Chart cards for trends
  chartCards: { title: string; value: number; subtitle: string; color: string; data: number[] }[] = [];

  // Pie chart data
  pieData: { label: string; value: number; color: string }[] = [];

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
    this.currentDateText = now.toLocaleDateString('en-US', options);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Get ALL data - use a wide date range to capture everything
    const endDate = new Date();
    const startDate = new Date('2024-01-01'); // Start from 2024 to capture all historical data

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    console.log('🚀 Loading dashboard data:', { startStr, endStr });

    this.analyticsService.getExecutiveDashboard(startStr, endStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('✅ Dashboard data received:', data);
          console.log('📊 KPIs object:', data?.kpis);
          this.ngZone.run(() => {
            this.dashboardData = data;
            this.processKpis(data);
            this.processChartCards(data);
            this.processPieData(data);
            this.processInsights(data);
            this.updateHealthStatus(data);
            this.lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            this.loading = false;
            console.log('📈 Processed KPIs:', this.kpis);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('❌ Failed to load dashboard data:', err);
            this.error = 'Failed to load dashboard data. Please try again.';
            this.setFallbackData();
            this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  private updateHealthStatus(data: ExecutiveDashboardDto): void {
    const score = data?.healthScore || 0;
    if (score >= 80) this.healthStatus = '🟢 Excellent';
    else if (score >= 60) this.healthStatus = '🟡 Good';
    else if (score >= 40) this.healthStatus = '🟠 Fair';
    else this.healthStatus = '🔴 Needs Attention';
  }

  private processInsights(data: ExecutiveDashboardDto): void {
    const kpis = data?.kpis;
    const customers = data?.customerMetrics;
    
    this.insights = [
      {
        icon: '📈',
        title: 'Avg Order Value',
        value: this.formatCurrency(kpis?.averageOrderValue)
      },
      {
        icon: '🔄',
        title: 'Retention Rate',
        value: (customers?.retentionRate || 0).toFixed(1) + '%'
      },
      {
        icon: '⭐',
        title: 'Avg Rating',
        value: (kpis?.averageRating || 0).toFixed(1) + ' / 5.0'
      },
      {
        icon: '📦',
        title: 'Products Sold',
        value: this.safeNumber(kpis?.totalProductsSold).toLocaleString()
      },
      {
        icon: '👤',
        title: 'New Customers',
        value: this.safeNumber(kpis?.newCustomers || customers?.newCustomers).toLocaleString()
      }
    ];
  }

  private processKpis(data: ExecutiveDashboardDto): void {
    const kpis = data?.kpis;
    console.log('Processing KPIs - raw data:', JSON.stringify(kpis));
    console.log('Total Revenue:', kpis?.totalRevenue, 'formatted:', this.formatCurrency(kpis?.totalRevenue));
    
    this.kpis = [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(kpis?.totalRevenue),
        subtitle: 'Last 30 days',
        change: this.calculateChange(kpis?.totalRevenue, data?.periodComparison?.revenueChange),
        sparkline: this.generateSparkline(kpis?.totalRevenue || 0),
        accentColor: '#00C2A8'
      },
      {
        title: 'Total Orders',
        value: this.safeNumber(kpis?.totalOrders),
        subtitle: 'Completed',
        change: this.calculateChange(kpis?.totalOrders, data?.periodComparison?.ordersChange),
        sparkline: this.generateSparkline(kpis?.totalOrders || 0),
        accentColor: '#6C5CE7'
      },
      {
        title: 'Total Customers',
        value: this.safeNumber(kpis?.totalCustomers),
        subtitle: 'Active',
        change: this.calculateChange(kpis?.newCustomers, null),
        sparkline: this.generateSparkline(kpis?.totalCustomers || 0),
        accentColor: '#FF8C42'
      },
      {
        title: 'Avg Order Value',
        value: this.formatCurrency(kpis?.averageOrderValue),
        subtitle: 'Per order',
        change: this.calculateChange(kpis?.averageOrderValue, data?.periodComparison?.avgOrderValueChangePercent),
        sparkline: this.generateSparkline(kpis?.averageOrderValue || 0),
        accentColor: '#10B981'
      }
    ];
  }

  private processChartCards(data: ExecutiveDashboardDto): void {
    const kpis = data?.kpis;
    const breakdown = data?.revenueBreakdown;

    // Create chart data from period breakdown if available
    const periodData = breakdown?.byPeriod ? Object.values(breakdown.byPeriod) : [];
    const chartData = periodData.length > 0 ? periodData.slice(-7) : this.generateSparkline(kpis?.totalRevenue || 0);

    this.chartCards = [
      {
        title: 'Revenue Trend',
        value: this.safeNumber(kpis?.totalRevenue),
        subtitle: 'Last 7 days',
        color: '#00C2A8',
        data: chartData as number[]
      },
      {
        title: 'Products Sold',
        value: this.safeNumber(kpis?.totalProductsSold),
        subtitle: 'Units',
        color: '#6C5CE7',
        data: this.generateSparkline(kpis?.totalProductsSold || 0)
      }
    ];
  }

  private processPieData(data: ExecutiveDashboardDto): void {
    const customers = data?.customerMetrics;
    
    const newCustomers = this.safeNumber(customers?.newCustomers);
    const returningCustomers = this.safeNumber(customers?.returningCustomers);
    const total = newCustomers + returningCustomers;

    if (total > 0) {
      this.pieData = [
        { label: 'New Customers', value: newCustomers, color: '#00C2A8' },
        { label: 'Returning', value: returningCustomers, color: '#6C5CE7' }
      ];
    } else {
      // Fallback pie data
      this.pieData = [
        { label: 'New Customers', value: 0, color: '#00C2A8' },
        { label: 'Returning', value: 0, color: '#6C5CE7' }
      ];
    }
  }

  private setFallbackData(): void {
    this.kpis = [
      { title: 'Total Revenue', value: '$0', subtitle: 'Last 30 days', change: 0, sparkline: [0], accentColor: '#00C2A8' },
      { title: 'Total Orders', value: 0, subtitle: 'Completed', change: 0, sparkline: [0], accentColor: '#6C5CE7' },
      { title: 'Total Customers', value: 0, subtitle: 'Active', change: 0, sparkline: [0], accentColor: '#FF8C42' },
      { title: 'Avg Order Value', value: '$0', subtitle: 'Per order', change: 0, sparkline: [0], accentColor: '#10B981' }
    ];
    this.chartCards = [];
    this.pieData = [];
  }

  // Utility methods for null/zero handling
  private safeNumber(value: number | null | undefined): number {
    return value ?? 0;
  }

  private formatCurrency(value: number | null | undefined): string {
    const num = this.safeNumber(value);
    if (num === 0) return '$0';
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
  }

  private calculateChange(currentValue: number | null | undefined, apiChange: number | null | undefined): number {
    if (apiChange !== null && apiChange !== undefined) {
      return Math.round(apiChange * 10) / 10;
    }
    // If no change data available, return 0
    return 0;
  }

  private generateSparkline(baseValue: number): number[] {
    if (baseValue === 0) return [0, 0, 0, 0, 0, 0, 0];
    // Generate a simple upward trend sparkline
    const variance = baseValue * 0.1;
    return Array.from({ length: 7 }, (_, i) => {
      const progress = i / 6;
      return Math.round(baseValue * (0.85 + progress * 0.15) + (Math.random() - 0.5) * variance);
    });
  }

  get pieTotal(): number {
    return this.pieData.reduce((sum, p) => sum + (p.value || 0), 0);
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
