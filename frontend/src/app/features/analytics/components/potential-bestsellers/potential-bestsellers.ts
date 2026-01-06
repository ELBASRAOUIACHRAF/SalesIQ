import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { PotentialBestSellerDto } from '../../../../core/models/potentialBestseller.model';

@Component({
  selector: 'app-potential-bestsellers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './potential-bestsellers.html',
  styleUrls: ['./potential-bestsellers.css']
})
export class PotentialBestsellersComponent implements OnInit, OnDestroy {

  products: PotentialBestSellerDto[] = [];
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBestsellers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBestsellers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.getPotentialBestsellers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.products = data.sort((a, b) => b.potentialScore - a.potentialScore);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Bestsellers error:', err);
          this.errorMessage = 'Failed to load potential bestsellers';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get veryHighPotential(): PotentialBestSellerDto[] {
    return this.products.filter(p => p.potentialLevel === 'VERY_HIGH');
  }

  get highPotential(): PotentialBestSellerDto[] {
    return this.products.filter(p => p.potentialLevel === 'HIGH');
  }

  get avgGrowthRate(): number {
    if (!this.products.length) return 0;
    return this.products.reduce((sum, p) => sum + p.salesGrowthRate, 0) / this.products.length;
  }

  getPotentialClass(level: string): string {
    return `potential-${level.toLowerCase().replace('_', '-')}`;
  }

  getPotentialIcon(level: string): string {
    switch (level) {
      case 'VERY_HIGH': return '🚀';
      case 'HIGH': return '⭐';
      case 'MEDIUM': return '📈';
      case 'LOW': return '📊';
      default: return '📦';
    }
  }

  getScoreBarWidth(score: number): string {
    return `${Math.min(score, 100)}%`;
  }

  getGrowthIcon(rate: number): string {
    if (rate > 50) return '🔥';
    if (rate > 20) return '📈';
    if (rate > 0) return '↗️';
    return '↘️';
  }
}
