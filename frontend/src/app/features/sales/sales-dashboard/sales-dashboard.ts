import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { CsvService } from '../../../core/services/csv.service';

// Sales Analytics Components
import { SalesTrendChartComponent } from '../../analytics/components/sales-trend-chart/sales-trend-chart';
import { SalesForecastComponent } from '../../analytics/components/sales-forecast/sales-forecast';
import { PeriodComparisonComponent } from '../../analytics/components/period-comparison/period-comparison';
import { AnomalyDetectionComponent } from '../../analytics/components/anomaly-detection/anomaly-detection';
import { GrowthRateCardComponent } from '../../analytics/components/growth-rate-card/growth-rate-card';
import { SeasonalityAnalysisComponent } from '../../analytics/components/seasonality-chart/seasonality-chart';
import { CohortCardComponent } from '../../analytics/cohort-card/cohort-card';
import { PurchaseFrequencyComponent } from '../../users/components/purchase-frequency/purchase-frequency.component';

// Services
import { AnalyticsService } from '../../../core/services/analytics.service';
import { SaleService } from '../../../core/services/sale.service';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    KpiCardComponent,
    // Sales Analytics
    SalesTrendChartComponent,
    SalesForecastComponent,
    PeriodComparisonComponent,
    AnomalyDetectionComponent,
    GrowthRateCardComponent,
    SeasonalityAnalysisComponent,
    CohortCardComponent,
    PurchaseFrequencyComponent
  ],
  templateUrl: './sales-dashboard.html',
  styleUrls: ['./sales-dashboard.css'],
})
export class SalesDashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private destroy$ = new Subject<void>();
  isLoading = true;
  activeTab = 'Overview';

  // CSV Import/Export state
  importMessage = '';
  importSuccess = false;
  isExporting = false;
  isImporting = false;
  currentImportType: 'sales' | 'sold-products' | 'baskets' = 'sales';

  // KPI Data
  totalSales = 0;
  totalOrders = 0;
  avgOrderValue = 0;
  totalRevenue = 0;
  
  // Previous period for comparison
  previousSales = 0;
  previousOrders = 0;
  previousAvgOrder = 0;

  constructor(
    private analyticsService: AnalyticsService,
    private saleService: SaleService,
    private csvService: CsvService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadKPIs(): void {
    this.isLoading = true;
    
    // Get date ranges
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = now;
    
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Call the sale service to get real data
    this.saleService.getSales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sales: any[]) => {
          this.calculateKPIs(sales, currentStart, currentEnd, prevStart, prevEnd);
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        },
        error: (err) => {
          console.error('Sales dashboard error:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  calculateKPIs(sales: any[], currentStart: Date, currentEnd: Date, prevStart: Date, prevEnd: Date): void {
    // Filter completed sales
    const completedSales = sales.filter(s => s.status === 'COMPLETED');
    
    // Current period
    const currentPeriodSales = completedSales.filter(s => {
      const saleDate = new Date(s.dateOfSale);
      return saleDate >= currentStart && saleDate <= currentEnd;
    });
    
    // Previous period
    const prevPeriodSales = completedSales.filter(s => {
      const saleDate = new Date(s.dateOfSale);
      return saleDate >= prevStart && saleDate <= prevEnd;
    });

    // Calculate current metrics
    this.totalOrders = currentPeriodSales.length;
    this.totalRevenue = currentPeriodSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    this.avgOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;
    this.totalSales = completedSales.length;

    // Calculate previous metrics
    this.previousOrders = prevPeriodSales.length;
    this.previousSales = prevPeriodSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    this.previousAvgOrder = this.previousOrders > 0 ? this.previousSales / this.previousOrders : 0;
  }

  get kpis() {
    const revenueChange = this.previousSales > 0 
      ? ((this.totalRevenue - this.previousSales) / this.previousSales) * 100 
      : 0;
    
    const ordersChange = this.previousOrders > 0 
      ? ((this.totalOrders - this.previousOrders) / this.previousOrders) * 100 
      : 0;
    
    const avgChange = this.previousAvgOrder > 0 
      ? ((this.avgOrderValue - this.previousAvgOrder) / this.previousAvgOrder) * 100 
      : 0;

    return [
      { 
        title: 'Total Revenue', 
        value: this.totalRevenue, 
        subtitle: 'This month', 
        change: revenueChange, 
        sparkline: [0], 
        accentColor: '#6366f1',
        isCurrency: true
      },
      { 
        title: 'Orders', 
        value: this.totalOrders, 
        subtitle: 'This month', 
        change: ordersChange, 
        sparkline: [0], 
        accentColor: '#10b981',
        isCurrency: false
      },
      { 
        title: 'Avg Order Value', 
        value: this.avgOrderValue, 
        subtitle: 'Per order', 
        change: avgChange, 
        sparkline: [0], 
        accentColor: '#8b5cf6',
        isCurrency: true
      },
      { 
        title: 'Total Sales', 
        value: this.totalSales, 
        subtitle: 'All time completed', 
        change: 0, 
        sparkline: [0], 
        accentColor: '#f59e0b',
        isCurrency: false
      },
    ];
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }

  // ============ CSV Import/Export Methods ============

  onExport(type: 'sales' | 'sold-products' | 'baskets'): void {
    if (this.isExporting) return;
    
    this.isExporting = true;
    this.importMessage = '';

    const exportFn = type === 'sales' 
      ? this.csvService.exportSales() 
      : type === 'sold-products'
        ? this.csvService.exportSoldProducts()
        : this.csvService.exportBaskets();

    exportFn.subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, `${type}.csv`);
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Export error:', err);
        this.importMessage = `Failed to export ${type}. Is the backend running?`;
        this.importSuccess = false;
        this.isExporting = false;
        setTimeout(() => this.importMessage = '', 5000);
      }
    });
  }

  triggerImport(type: 'sales' | 'sold-products' | 'baskets'): void {
    this.currentImportType = type;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      this.importMessage = 'Please select a CSV file';
      this.importSuccess = false;
      setTimeout(() => this.importMessage = '', 3000);
      return;
    }

    this.isImporting = true;
    this.importMessage = `Importing ${this.currentImportType}...`;
    this.importSuccess = true;

    const importFn = this.currentImportType === 'sales'
      ? this.csvService.importSales(file)
      : this.currentImportType === 'sold-products'
        ? this.csvService.importSoldProducts(file)
        : this.csvService.importBaskets(file);

    importFn.subscribe({
      next: (response) => {
        this.importMessage = response.message || `Successfully imported ${response.count} ${this.currentImportType}`;
        this.importSuccess = response.success;
        this.isImporting = false;
        input.value = '';
        this.loadKPIs(); // Refresh data
        setTimeout(() => this.importMessage = '', 5000);
      },
      error: (err) => {
        console.error('Import error:', err);
        this.importMessage = `Failed to import ${this.currentImportType}. Check file format.`;
        this.importSuccess = false;
        this.isImporting = false;
        input.value = '';
        setTimeout(() => this.importMessage = '', 5000);
      }
    });
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }
}

