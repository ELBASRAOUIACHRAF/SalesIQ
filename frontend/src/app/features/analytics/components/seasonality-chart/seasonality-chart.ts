import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { SeasonalityAnalysisDto, TimeSeriesPointDto } from '../../../../core/models/seasonality.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartKpiCardComponent } from '../chart-kpi-card/chart-kpi-card';

@Component({
  selector: 'app-seasonality-chart',
  standalone: true,
  imports: [CommonModule, ChartKpiCardComponent],
  templateUrl: './seasonality-chart.html',
  styleUrls: ['./seasonality-chart.css']
})
export class SeasonalityAnalysisComponent implements OnInit, OnDestroy {

  seasonalityType: string = 'NONE';
  seasonalityStrength = 0;

  originalValues: number[] = [];
  trendValues: number[] = [];
  seasonalValues: number[] = [];
  residualValues: number[] = [];

  originalLabels: string[] = [];
  trendLabels: string[] = [];
  seasonalLabels: string[] = [];
  residualLabels: string[] = [];
  private charts: Record<string, any> = {};
  private sub?: Subscription;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.sub = this.analyticsService
      .analyzeSeasonality('2024-01-01', '2024-06-30')
      .subscribe((data: SeasonalityAnalysisDto) => {
        this.seasonalityType = data.seasonalityType;
        this.seasonalityStrength = data.seasonalityStrength;

        this.setSeries('original', data.originalSeries || []);
        this.setSeries('trend', data.trendSeries || []);
        this.setSeries('seasonal', data.seasonalSeries || []);
        this.setSeries('residual', data.residualSeries || []);
      });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    // Destroy charts
    Object.values(this.charts).forEach(c => c.destroy());
  }

  private setSeries(name: 'original' | 'trend' | 'seasonal' | 'residual', series: TimeSeriesPointDto[]) {
    const labels = (series || []).map(p => {
      const ts = p?.timestamp ? new Date(p.timestamp) : null;
      return ts ? ts.toISOString().split('T')[0] : '';
    });
    const values = (series || []).map(p => (typeof p?.value === 'number' ? p.value : 0));

    switch (name) {
      case 'original':
        this.originalLabels = labels; this.originalValues = values; break;
      case 'trend':
        this.trendLabels = labels; this.trendValues = values; break;
      case 'seasonal':
        this.seasonalLabels = labels; this.seasonalValues = values; break;
      case 'residual':
        this.residualLabels = labels; this.residualValues = values; break;
    }
  }
}
