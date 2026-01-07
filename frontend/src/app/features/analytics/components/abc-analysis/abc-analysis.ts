import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ABCAnalysisDto, ABCProductDto, defaultABCAnalysis } from '../../../../core/models/abcAnalysis.model';

@Component({
  selector: 'app-abc-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './abc-analysis.html',
  styleUrls: ['./abc-analysis.css']
})
export class ABCAnalysisComponent implements OnInit {

  // Data from backend
  abcData: ABCAnalysisDto = defaultABCAnalysis;

  // UI States
  isLoading = true;
  errorMessage = '';
  activeTab: 'A' | 'B' | 'C' | 'all' = 'all';

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadABCAnalysis();
  }

  /**
   * Fetch ABC Analysis from backend
   * GET /api/v1/analytics/abc-analysis
   */
  loadABCAnalysis(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.analyticsService.getABCAnalysis().subscribe({
      next: (data) => {
        this.abcData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ABC Analysis error:', err);
        this.errorMessage = 'Failed to load ABC Analysis. Is the backend running?';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Tab switching
  setTab(tab: 'A' | 'B' | 'C' | 'all'): void {
    this.activeTab = tab;
  }

  // Get products based on active tab
  get displayedProducts(): ABCProductDto[] {
    const classA = this.abcData?.classA ?? [];
    const classB = this.abcData?.classB ?? [];
    const classC = this.abcData?.classC ?? [];
    
    switch (this.activeTab) {
      case 'A': return classA;
      case 'B': return classB;
      case 'C': return classC;
      default: return [...classA, ...classB, ...classC];
    }
  }

  // Summary statistics
  get summary() {
    const classA = this.abcData?.classA ?? [];
    const classB = this.abcData?.classB ?? [];
    const classC = this.abcData?.classC ?? [];
    
    return {
      totalProducts: classA.length + classB.length + classC.length,
      classACount: classA.length,
      classBCount: classB.length,
      classCCount: classC.length,
      totalRevenue: this.abcData?.totalRevenue ?? 0,
      classARevenue: classA.reduce((sum, p) => sum + (p.revenue ?? 0), 0),
      classBRevenue: classB.reduce((sum, p) => sum + (p.revenue ?? 0), 0),
      classCRevenue: classC.reduce((sum, p) => sum + (p.revenue ?? 0), 0)
    };
  }

  // CSS class for ABC badge
  getBadgeClass(abcClass: string): string {
    switch (abcClass) {
      case 'A': return 'badge badge-a';
      case 'B': return 'badge badge-b';
      case 'C': return 'badge badge-c';
      default: return 'badge';
    }
  }

  // Revenue bar width (percentage)
  getBarWidth(revenue: number): string {
    const maxRevenue = Math.max(...this.displayedProducts.map(p => p.revenue), 1);
    return `${(revenue / maxRevenue) * 100}%`;
  }
}
