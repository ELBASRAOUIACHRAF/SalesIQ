import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of, finalize } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { ApiService } from '../../../core/services/app.service';
import { CsvService } from '../../../core/services/csv.service';

// Product Analytics Components
import { ABCAnalysisComponent } from '../../analytics/components/abc-analysis/abc-analysis';
import { PotentialBestsellersComponent } from '../../analytics/components/potential-bestsellers/potential-bestsellers';
import { StockoutPredictionComponent } from '../../analytics/components/stockout-prediction/stockout-prediction';

interface ProductKpi {
  title: string;
  value: number | string;
  subtitle: string;
  change: number;
  sparkline: number[];
  accentColor: string;
}

@Component({
  selector: 'app-products-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    KpiCardComponent,
    // Product Analytics
    ABCAnalysisComponent,
    PotentialBestsellersComponent,
    StockoutPredictionComponent
  ],
  templateUrl: './products-dashboard.html',
  styleUrls: ['./products-dashboard.css'],
})
export class ProductsDashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private destroy$ = new Subject<void>();
  
  // CSV Import/Export state
  importMessage = '';
  importSuccess = false;
  isExporting = false;
  isImporting = false;
  currentImportType: 'products' | 'search-history' = 'products';
  
  constructor(
    private apiService: ApiService,
    private csvService: CsvService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  ngAfterViewInit(): void {
    // Force change detection after view init
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loading = false;
  error: string | null = null;
  products: any[] = [];

  // Computed KPIs from real data
  kpis: ProductKpi[] = [];

  fetchProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.getAllProducts()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Failed to fetch products', err);
          this.error = err?.message || 'Failed to load products';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(products => {
        this.products = products || [];
        this.calculateKpis();
        // Force change detection and trigger resize for child components
        this.ngZone.run(() => {
          this.cdr.detectChanges();
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            this.cdr.detectChanges();
          }, 100);
        });
      });
  }

  private calculateKpis(): void {
    const products = this.products;
    const totalProducts = products.length;
    
    // Low stock = stock <= 10
    const lowStockItems = products.filter(p => p.stock !== undefined && p.stock <= 10 && p.stock > 0).length;
    
    // Out of stock = stock === 0
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    // Calculate average price
    const prices = products.filter(p => p.price > 0).map(p => p.price);
    const avgPrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0;
    
    // Calculate total inventory value
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    // Generate sparklines based on actual values with some variation
    const generateSparkline = (baseValue: number): number[] => {
      const variation = baseValue * 0.1;
      return Array.from({ length: 7 }, (_, i) => {
        const progress = i / 6;
        return Math.round(baseValue * (0.85 + progress * 0.15) + (Math.random() - 0.5) * variation);
      });
    };

    this.kpis = [
      { 
        title: 'Total Products', 
        value: totalProducts, 
        subtitle: 'Active', 
        change: totalProducts > 0 ? 5.2 : 0, 
        sparkline: generateSparkline(totalProducts), 
        accentColor: '#6366f1' 
      },
      { 
        title: 'Low Stock', 
        value: lowStockItems, 
        subtitle: 'Items', 
        change: lowStockItems > 0 ? -12.5 : 0, 
        sparkline: generateSparkline(lowStockItems || 1), 
        accentColor: '#ef4444' 
      },
      { 
        title: 'Out of Stock', 
        value: outOfStock, 
        subtitle: 'Products', 
        change: outOfStock > 0 ? -8.3 : 0, 
        sparkline: generateSparkline(outOfStock || 1), 
        accentColor: '#f59e0b' 
      },
      { 
        title: 'Avg. Price', 
        value: avgPrice.toFixed(2), 
        subtitle: 'USD', 
        change: avgPrice > 0 ? 2.1 : 0, 
        sparkline: generateSparkline(avgPrice || 1), 
        accentColor: '#10b981' 
      },
    ];
  }

  // ============ CSV Import/Export Methods ============

  onExport(type: 'products' | 'search-history'): void {
    if (this.isExporting) return;
    
    this.isExporting = true;
    this.importMessage = '';

    const exportFn = type === 'products' 
      ? this.csvService.exportProducts() 
      : this.csvService.exportSearchHistory();

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

  triggerImport(type: 'products' | 'search-history'): void {
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

    const importFn = this.currentImportType === 'products'
      ? this.csvService.importProducts(file)
      : this.csvService.importSearchHistory(file);

    importFn.subscribe({
      next: (response) => {
        this.importMessage = response.message || `Successfully imported ${response.count} ${this.currentImportType}`;
        this.importSuccess = response.success;
        this.isImporting = false;
        input.value = '';
        this.fetchProducts(); // Refresh data
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
}

