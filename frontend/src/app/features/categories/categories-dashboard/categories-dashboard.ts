import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { ChartKpiCardComponent } from '../../analytics/components/chart-kpi-card/chart-kpi-card';
import { KpiPieChartComponent } from '../../analytics/components/kpi-pie-chart/kpi-pie-chart';
import { KpiBarChartComponent } from '../../analytics/components/kpi-bar-chart/kpi-bar-chart';
import { BigCardComponent } from '../../analytics/components/big-kpi-card/big-kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';

@Component({
  selector: 'app-categories-dashboard',
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
  templateUrl: './categories-dashboard.html',
  styleUrls: ['./categories-dashboard.css'],
})
export class CategoriesDashboard implements OnInit {
  ngOnInit(): void {}

  kpis = [
    { title: 'Total Categories', value: 24, subtitle: 'Active', change: 8.3, sparkline: [20, 21, 22, 23, 23, 24, 24], accentColor: '#6366f1' },
    { title: 'Products per Category', value: 52, subtitle: 'Average', change: 3.2, sparkline: [48, 49, 50, 51, 51, 52, 52], accentColor: '#8b5cf6' },
    { title: 'Top Category Sales', value: 45678, subtitle: 'This month', change: 15.6, sparkline: [38000, 40000, 42000, 43000, 44000, 45000, 45678], accentColor: '#10b981' },
    { title: 'Category Growth', value: 12.5, subtitle: '% increase', change: 2.4, sparkline: [10, 10.5, 11, 11.5, 12, 12.3, 12.5], accentColor: '#f59e0b' },
  ];

  chartCards = [
    { title: 'Category Performance', value: 234567, subtitle: 'Total revenue', color: '#6366f1', data: [200000, 210000, 205000, 220000, 230000, 225000, 234567] },
    { title: 'Category Distribution', value: 1247, subtitle: 'Total products', color: '#8b5cf6', data: [1100, 1150, 1180, 1200, 1220, 1235, 1247] }
  ];

  barCards = [
    { title: 'Category Sales', value: 18, subtitle: 'Top categories', color: '#6366f1', bars: [20, 18, 15, 12, 10, 8, 6] },
    { title: 'New Products', value: 89, subtitle: 'By category', color: '#10b981', bars: [10, 12, 15, 14, 16, 15, 18] }
  ];

  pieData = [
    { label: 'Electronics', value: 35, color: '#6366f1' },
    { label: 'Clothing', value: 28, color: '#8b5cf6' },
    { label: 'Home & Garden', value: 22, color: '#10b981' },
    { label: 'Other', value: 15, color: '#f59e0b' }
  ];

  get pieTotal(): number {
    return this.pieData.reduce((sum, p) => sum + (p.value || 0), 0);
  }
}

