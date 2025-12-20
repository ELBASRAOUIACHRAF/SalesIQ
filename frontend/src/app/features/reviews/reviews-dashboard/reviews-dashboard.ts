import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { ChartKpiCardComponent } from '../../analytics/components/chart-kpi-card/chart-kpi-card';
import { KpiPieChartComponent } from '../../analytics/components/kpi-pie-chart/kpi-pie-chart';
import { KpiBarChartComponent } from '../../analytics/components/kpi-bar-chart/kpi-bar-chart';
import { BigCardComponent } from '../../analytics/components/big-kpi-card/big-kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';

@Component({
  selector: 'app-reviews-dashboard',
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
  templateUrl: './reviews-dashboard.html',
  styleUrls: ['./reviews-dashboard.css'],
})
export class ReviewsDashboard implements OnInit {
  ngOnInit(): void {}

  kpis = [
    { title: 'Total Reviews', value: 12345, subtitle: 'All time', change: 12.8, sparkline: [10000, 10500, 11000, 11500, 12000, 12200, 12345], accentColor: '#6366f1' },
    { title: 'Average Rating', value: 4.6, subtitle: 'Out of 5', change: 0.2, sparkline: [4.4, 4.5, 4.5, 4.6, 4.6, 4.6, 4.6], accentColor: '#f59e0b' },
    { title: 'New Reviews', value: 234, subtitle: 'This week', change: 18.5, sparkline: [180, 190, 200, 210, 220, 230, 234], accentColor: '#10b981' },
    { title: 'Response Rate', value: 87.5, subtitle: '% answered', change: 5.2, sparkline: [80, 82, 84, 85, 86, 87, 87.5], accentColor: '#8b5cf6' },
  ];

  chartCards = [
    { title: 'Review Trends', value: 12345, subtitle: 'Total reviews', color: '#6366f1', data: [10000, 10500, 11000, 11500, 12000, 12200, 12345] },
    { title: 'Rating Distribution', value: 4.6, subtitle: 'Average', color: '#f59e0b', data: [4.4, 4.5, 4.5, 4.6, 4.6, 4.6, 4.6] }
  ];

  barCards = [
    { title: 'Reviews by Day', value: 234, subtitle: 'This week', color: '#6366f1', bars: [30, 35, 32, 38, 40, 35, 24] },
    { title: 'Rating Trends', value: 4.6, subtitle: 'Average', color: '#f59e0b', bars: [4.2, 4.3, 4.4, 4.5, 4.6, 4.6, 4.6] }
  ];

  pieData = [
    { label: '5 Stars', value: 45, color: '#10b981' },
    { label: '4 Stars', value: 30, color: '#6366f1' },
    { label: '3 Stars', value: 15, color: '#f59e0b' },
    { label: '1-2 Stars', value: 10, color: '#ef4444' }
  ];

  get pieTotal(): number {
    return this.pieData.reduce((sum, p) => sum + (p.value || 0), 0);
  }
}

