import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ChurnPredictionDto } from '../../../../core/models/churnPrediction.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-churn-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './churn-prediction.html',
  styleUrls: ['./churn-prediction.css']
})
export class ChurnPredictionComponent implements OnInit, OnDestroy {

  predictions: ChurnPredictionDto[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Sorting & filtering
  sortBy: 'probability' | 'daysSince' | 'spent' = 'probability';
  filterRisk: 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'all';

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPredictions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPredictions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.getChurnPredictions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.predictions = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Churn prediction error:', err);
          this.errorMessage = 'Failed to load churn predictions';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get filteredPredictions(): ChurnPredictionDto[] {
    let result = [...this.predictions];
    
    // Filter by risk level
    if (this.filterRisk !== 'all') {
      result = result.filter(p => p.riskLevel === this.filterRisk);
    }
    
    // Sort
    switch (this.sortBy) {
      case 'probability':
        result.sort((a, b) => b.churnProbability - a.churnProbability);
        break;
      case 'daysSince':
        result.sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase);
        break;
      case 'spent':
        result.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
    }
    
    return result;
  }

  // Stats
  get totalAtRisk(): number {
    return this.predictions.filter(p => 
      p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL'
    ).length;
  }

  get criticalCount(): number {
    return this.predictions.filter(p => p.riskLevel === 'CRITICAL').length;
  }

  get highCount(): number {
    return this.predictions.filter(p => p.riskLevel === 'HIGH').length;
  }

  get mediumCount(): number {
    return this.predictions.filter(p => p.riskLevel === 'MEDIUM').length;
  }

  get lowCount(): number {
    return this.predictions.filter(p => p.riskLevel === 'LOW').length;
  }

  get avgChurnProbability(): number {
    if (!this.predictions.length) return 0;
    return this.predictions.reduce((sum, p) => sum + p.churnProbability, 0) / this.predictions.length;
  }

  getRiskClass(risk: string): string {
    return `risk-${risk.toLowerCase()}`;
  }

  getRiskIcon(risk: string): string {
    switch (risk) {
      case 'CRITICAL': return 'dangerous';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'check_circle';
      default: return 'help_outline';
    }
  }

  setFilter(risk: 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): void {
    this.filterRisk = risk;
  }

  setSort(sort: 'probability' | 'daysSince' | 'spent'): void {
    this.sortBy = sort;
  }
}
