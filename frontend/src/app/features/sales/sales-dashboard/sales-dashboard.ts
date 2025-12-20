import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { ChartKpiCardComponent } from '../../analytics/components/chart-kpi-card/chart-kpi-card';
import { KpiPieChartComponent } from '../../analytics/components/kpi-pie-chart/kpi-pie-chart';
import { KpiBarChartComponent } from '../../analytics/components/kpi-bar-chart/kpi-bar-chart';
import { BigCardComponent } from '../../analytics/components/big-kpi-card/big-kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { SalesForecastKpiComponent } from '../../analytics/components/sales-forecast-kpi/sales-forecast-kpi';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    KpiCardComponent,
    ChartKpiCardComponent,
    BigCardComponent,
    KpiBarChartComponent,
    KpiPieChartComponent,
    SalesForecastKpiComponent
  ],
  templateUrl: './sales-dashboard.html',
  styleUrls: ['./sales-dashboard.css'],
})
export class SalesDashboard implements OnInit {
  ngOnInit(): void {}

  forecastHistory = [98000, 102000, 108500, 112000, 117500, 122000, 125500];
  forecastProjection = [128000, 130500, 133000, 135500, 138200, 141000, 144000];

  onForecastRequest(days: number) {
    // Placeholder: backend hook goes here; keep UI responsive with simple projection
    const base = this.forecastHistory[this.forecastHistory.length - 1] || 100000;
    this.forecastProjection = Array.from({ length: days }, (_, i) => Math.round(base * Math.pow(1.01, i + 1)));
  }

  kpis = [
    { title: 'Total Sales', value: 1234567, subtitle: 'This month', change: 15.8, sparkline: [1000000, 1050000, 1100000, 1150000, 1200000, 1220000, 1234567], accentColor: '#6366f1' },
    { title: 'Orders', value: 8923, subtitle: 'Completed', change: 12.4, sparkline: [7500, 7800, 8000, 8300, 8600, 8800, 8923], accentColor: '#10b981' },
    { title: 'Average Order', value: 138.45, subtitle: 'USD', change: 3.2, sparkline: [130, 132, 134, 136, 137, 138, 138.45], accentColor: '#8b5cf6' },
    { title: 'Conversion Rate', value: 3.45, subtitle: '%', change: 0.8, sparkline: [3.0, 3.1, 3.2, 3.3, 3.4, 3.4, 3.45], accentColor: '#f59e0b' },
  ];

  chartCards = [
    { title: 'Sales Revenue', value: 1234567, subtitle: 'This month', color: '#6366f1', data: [1000000, 1050000, 1100000, 1150000, 1200000, 1220000, 1234567] },
    { title: 'Order Volume', value: 8923, subtitle: 'Total orders', color: '#10b981', data: [7500, 7800, 8000, 8300, 8600, 8800, 8923] }
  ];

  barCards = [
    { title: 'Daily Sales', value: 45678, subtitle: 'Today', color: '#6366f1', bars: [30000, 35000, 40000, 42000, 44000, 45000, 45678] },
    { title: 'Top Products', value: 234, subtitle: 'Best sellers', color: '#8b5cf6', bars: [180, 200, 210, 220, 230, 232, 234] }
  ];

  pieData = [
    { label: 'Online', value: 65, color: '#6366f1' },
    { label: 'In-Store', value: 25, color: '#10b981' },
    { label: 'Mobile', value: 10, color: '#8b5cf6' }
  ];

  get pieTotal(): number {
    return this.pieData.reduce((sum, p) => sum + (p.value || 0), 0);
  }
}

