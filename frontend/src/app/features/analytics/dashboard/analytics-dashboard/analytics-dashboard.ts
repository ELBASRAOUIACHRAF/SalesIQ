import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card';
import {ChartKpiCardComponent } from '../../components/chart-kpi-card/chart-kpi-card';
import { KpiPieChartComponent } from '../../components/kpi-pie-chart/kpi-pie-chart';
import { BigCardComponent } from '../../components/big-kpi-card/big-kpi-card';
import { KpiBarChartComponent } from '../../components/kpi-bar-chart/kpi-bar-chart';
import { SeasonalityAnalysisComponent } from '../../components/seasonality-chart/seasonality-chart';
import { TopBarComponent } from '../../components/top-bar/top-bar';

import { ApiService } from '../../../../core/services/app.service';


@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    KpiCardComponent,
    ChartKpiCardComponent,
    BigCardComponent,
    KpiBarChartComponent,
    KpiPieChartComponent,
    SeasonalityAnalysisComponent
  ],
  templateUrl: './analytics-dashboard.html',
  styleUrls: ['./analytics-dashboard.css'],
})
export class AnalyticsDashboard implements OnInit{

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    }
  kpis = [
    { title: 'Revenue', value: 12345, subtitle: 'Monthly', change: 2.4, sparkline: [2, 3, 5, 4, 6], accentColor: '#00C2A8' },
    { title: 'Active Users', value: 4523, subtitle: 'This week', change: -1.2, sparkline: [5, 4, 6, 5, 3], accentColor: '#6C5CE7' },
    { title: 'Conversion', value: 4.52, subtitle: 'rate (%)', change: 0.8, sparkline: [1, 2, 1.5, 2.5, 3], accentColor: '#FF8C42' },
  ];

  chartCards = [
    { title: 'Net Revenue', value: 98765, subtitle: 'Last 30 days', color: '#00C2A8', data: [120, 160, 140, 200, 240, 220, 260] },
    { title: 'New Signups', value: 2345, subtitle: 'Weekly', color: '#6C5CE7', data: [10, 12, 8, 14, 18, 16, 22] }
  ];

  barCards = [
    { title: 'Transactions', value: 543, subtitle: 'Daily', color: '#EF4444', bars: [5, 8, 6, 12, 9, 10, 14] },
    { title: 'Support Tickets', value: 87, subtitle: 'Weekly', color: '#F59E0B', bars: [2, 3, 1, 4, 2, 5, 3] }
  ];

  pieData = [
    { label: 'Direct', value: 45, color: '#60a5fa' },
    { label: 'Referral', value: 30, color: '#34d399' },
    { label: 'Organic', value: 25, color: '#f59e0b' }
  ];

  get pieTotal(): number {
    return this.pieData.reduce((sum, p) => sum + (p.value || 0), 0);
  }
  
}
