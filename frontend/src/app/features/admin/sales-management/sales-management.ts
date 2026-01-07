import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SaleService, SaleDto } from '../../../core/services/sale.service';
import { CsvService } from '../../../core/services/csv.service';
import { HttpClient } from '@angular/common/http';
import { SystemSettingsService } from '../../../core/services/system-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sales-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './sales-management.html',
  styleUrls: ['./sales-management.css']
})
export class SalesManagement implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8080/sales';

  sales: SaleDto[] = [];
  filteredSales: SaleDto[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';
  selectedPayment = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;

  // Modal state
  showModal = false;
  modalMode: 'view' | 'edit' = 'view';
  selectedSale: SaleDto | null = null;

  // Form data
  formData: Partial<SaleDto> = {};

  // Stats
  totalRevenue = 0;
  totalSales = 0;
  avgOrderValue = 0;
  statusCounts: { status: string; count: number; color: string }[] = [];

  // Options
  statuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
  paymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'CASH', 'BANK_TRANSFER'];

  constructor(
    private saleService: SaleService,
    private csvService: CsvService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private settingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.syncItemsPerPage();
    this.loadSales();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSales(): void {
    this.loading = true;
    this.saleService.getSales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sales) => {
          this.sales = sales;
          this.calculateStats();
          this.applyFilters();
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        },
        error: (err) => {
          console.error('Failed to load sales:', err);
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        }
      });
  }

  calculateStats(): void {
    this.totalSales = this.sales.length;
    
    const completedSales = this.sales.filter(s => s.status === 'COMPLETED');
    this.totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
    this.avgOrderValue = completedSales.length > 0 ? this.totalRevenue / completedSales.length : 0;

    // Status counts
    const statusColors: Record<string, string> = {
      'COMPLETED': '#10b981',
      'PENDING': '#f59e0b',
      'CANCELLED': '#ef4444',
      'REFUNDED': '#6366f1'
    };

    this.statusCounts = this.statuses.map(status => ({
      status,
      count: this.sales.filter(s => s.status === status).length,
      color: statusColors[status] || '#64748b'
    }));
  }

  applyFilters(): void {
    let filtered = [...this.sales];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.id.toString().includes(term) ||
        s.userId.toString().includes(term) ||
        s.paymentMethod?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(s => s.status === this.selectedStatus);
    }

    // Payment method filter
    if (this.selectedPayment) {
      filtered = filtered.filter(s => s.paymentMethod === this.selectedPayment);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.dateOfSale).getTime() - new Date(a.dateOfSale).getTime());

    this.filteredSales = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedSales(): SaleDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSales.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  private syncItemsPerPage(): void {
    const current = this.settingsService.getSetting('itemsPerPage');
    if (current) {
      this.itemsPerPage = current;
    }

    this.settingsService.settingsChanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        if (settings.itemsPerPage && settings.itemsPerPage !== this.itemsPerPage) {
          this.itemsPerPage = settings.itemsPerPage;
          this.applyFilters();
          this.cdr.detectChanges();
        }
      });
  }

  // Modal operations
  openViewModal(sale: SaleDto): void {
    this.modalMode = 'view';
    this.selectedSale = sale;
    this.showModal = true;
  }

  openEditModal(sale: SaleDto): void {
    this.modalMode = 'edit';
    this.selectedSale = sale;
    this.formData = { ...sale };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSale = null;
    this.formData = {};
  }

  saveSale(): void {
    if (this.selectedSale) {
      // Use /sales/updatesale/{saleId} endpoint
      this.http.put<SaleDto>(`${this.apiUrl}/updatesale/${this.selectedSale.id}`, this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSales();
            this.closeModal();
            alert('Sale updated successfully!');
          },
          error: (err) => {
            console.error('Failed to update sale:', err);
            alert('Failed to update sale. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  deleteSale(sale: SaleDto): void {
    if (confirm(`Are you sure you want to delete sale #${sale.id}?\n\nNote: This action cannot be undone.`)) {
      // Use /sales/deletesale/{saleId} endpoint
      this.http.delete(`${this.apiUrl}/deletesale/${sale.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSales();
            alert('Sale deleted successfully!');
          },
          error: (err) => {
            console.error('Failed to delete sale:', err);
            alert('Failed to delete sale. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  exportSales(): void {
    this.csvService.exportSales().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'sales_export.csv');
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'COMPLETED': 'status-completed',
      'PENDING': 'status-pending',
      'CANCELLED': 'status-cancelled',
      'REFUNDED': 'status-refunded'
    };
    return classes[status] || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPaymentMethod(method: string): string {
    return method?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
  }
}
