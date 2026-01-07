import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { StockoutPredictionDto } from '../../../../core/models/stockoutPrediction.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stockout-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './stockout-prediction.html',
  styleUrls: ['./stockout-prediction.css']
})
export class StockoutPredictionComponent implements OnInit, OnDestroy {

  predictions: StockoutPredictionDto[] = [];
  filteredPredictions: StockoutPredictionDto[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Expose Math for template
  Math = Math;

  // Filters
  riskFilter: string = 'ALL';
  searchTerm: string = '';
  sortBy: string = 'daysUntilStockout';

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

    this.analyticsService.getStockoutPredictions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.predictions = data;
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Stockout prediction error:', err);
          this.errorMessage = 'Failed to load stockout predictions';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.predictions];

    // Risk filter
    if (this.riskFilter !== 'ALL') {
      filtered = filtered.filter(p => p.riskLevel === this.riskFilter);
    }

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'daysUntilStockout':
          return a.daysUntilStockout - b.daysUntilStockout;
        case 'stockoutProbability':
          return b.stockoutProbability - a.stockoutProbability;
        case 'currentStock':
          return a.currentStock - b.currentStock;
        default:
          return 0;
      }
    });

    this.filteredPredictions = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
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

  getRiskClass(level: string): string {
    return `risk-${level.toLowerCase()}`;
  }

  getRiskIcon(level: string): string {
    switch (level) {
      case 'CRITICAL': return 'report_problem';  
      case 'HIGH': return 'warning';             
      case 'MEDIUM': return 'hourglass_empty';   
      case 'LOW': return 'check_circle';         
      default: return 'inventory_2';             
    }
  }

  getDaysLabel(days: number): string {
    if (days <= 0) return 'Out of Stock';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${days >= 60 ? 's' : ''}`;
  }

  getStockPercentage(current: number, reorder: number): number {
    if (reorder <= 0) return 100;
    return Math.min(100, (current / reorder) * 100);
  }

  getStockBarClass(current: number, reorder: number): string {
    const percent = this.getStockPercentage(current, reorder);
    if (percent <= 25) return 'critical';
    if (percent <= 50) return 'warning';
    if (percent <= 75) return 'moderate';
    return 'healthy';
  }
}
