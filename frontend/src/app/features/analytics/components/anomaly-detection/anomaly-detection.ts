import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { AnomalyDetectionDto } from '../../../../core/models/anomalyDetection.model';

@Component({
  selector: 'app-anomaly-detection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anomaly-detection.html',
  styleUrls: ['./anomaly-detection.css']
})
export class AnomalyDetectionComponent implements OnInit, OnDestroy {

  anomalies: AnomalyDetectionDto[] = [];
  filteredAnomalies: AnomalyDetectionDto[] = [];
  
  // Expose Math for template
  Math = Math;
  isLoading = true;
  errorMessage = '';

  // Filters
  typeFilter: string = 'ALL';
  severityFilter: string = 'ALL';
  dateRange = { start: '', end: '' };

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initDefaultDates();
    this.loadAnomalies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initDefaultDates(): void {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    this.dateRange.start = start.toISOString().split('T')[0];
    this.dateRange.end = end.toISOString().split('T')[0];
  }

  loadAnomalies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.detectAnomalies(this.dateRange.start, this.dateRange.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AnomalyDetectionDto[]) => {
          this.anomalies = data.sort((a: AnomalyDetectionDto, b: AnomalyDetectionDto) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          console.error('Anomaly detection error:', err);
          this.errorMessage = 'Failed to detect anomalies';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.anomalies];

    if (this.typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.anomalyType === this.typeFilter);
    }

    if (this.severityFilter !== 'ALL') {
      filtered = filtered.filter(a => a.severity === this.severityFilter);
    }

    this.filteredAnomalies = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onDateChange(): void {
    if (this.dateRange.start && this.dateRange.end) {
      this.loadAnomalies();
    }
  }

  get spikeCount(): number {
    return this.anomalies.filter(a => a.anomalyType === 'SPIKE').length;
  }

  get dropCount(): number {
    return this.anomalies.filter(a => a.anomalyType === 'DROP').length;
  }

  get criticalCount(): number {
    return this.anomalies.filter(a => a.severity === 'CRITICAL').length;
  }

  get avgDeviation(): number {
    if (!this.anomalies.length) return 0;
    return this.anomalies.reduce((sum, a) => sum + Math.abs(a.deviation), 0) / this.anomalies.length;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'SPIKE': return '📈';
      case 'DROP': return '📉';
      case 'OUTLIER': return '⚡';
      default: return '📊';
    }
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity.toLowerCase()}`;
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⏳';
      case 'LOW': return '📌';
      default: return '📊';
    }
  }

  getDeviationDisplay(deviation: number): string {
    const sign = deviation > 0 ? '+' : '';
    return `${sign}${deviation.toFixed(1)}%`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
