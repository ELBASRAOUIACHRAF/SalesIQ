import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartKpiCardComponent } from '../components/chart-kpi-card/chart-kpi-card';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CohortAnalysisDto, defaultCohortAnalysis } from '../../../core/models/cohort.model';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-cohort-card',
  standalone: true,
  imports: [CommonModule, ChartKpiCardComponent],
  templateUrl: './cohort-card.html',
  styleUrls: ['./cohort-card.css']
})
export class CohortCardComponent implements OnInit {

  // Cohort data from backend
  public cohortData: CohortAnalysisDto = defaultCohortAnalysis;

  // Loading & error states
  public loading: boolean = true;
  public error?: string;

  // Chart data for the in-project chart component
  public barChartLabels: string[] = [];
  public cohortSeries: number[] = [];

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    // Example period (adjust as needed)
    const start = '2025-01-01T00:00:00';
    const end = '2025-12-31T23:59:59';

    this.analyticsService.getCohortAnalysis(start, end)
      .subscribe({
        next: data => {
          this.cohortData = data ?? defaultCohortAnalysis;
          this.loading = false;
          this.buildChartFromData(this.cohortData);
        },
        error: err => {
          console.error(err);
          // Backend may be offline during local testing — show a sample dataset so UX can be demonstrated
          this.cohortData = { totalUsers: 150, totalCohorts: 3, activeUsers: 120, avgUsersPerCohort: 50 };
          this.buildChartFromData(this.cohortData);
          this.error = 'Using sample data (backend unreachable)';
          this.loading = false;
        }
      });
  }

  private buildChartFromData(data: CohortAnalysisDto) {
    this.barChartLabels = Array.from({length: Math.max(1, data.totalCohorts)}, (_, i) => `Cohort ${i + 1}`);
    this.cohortSeries = Array.from({length: Math.max(1, data.totalCohorts)}, () => Math.floor(data.avgUsersPerCohort));
  }
}
