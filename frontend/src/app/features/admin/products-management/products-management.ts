import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CsvService } from '../../../core/services/csv.service';
import { HttpClient } from '@angular/common/http';
import { SystemSettingsService } from '../../../core/services/system-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './products-management.html',
  styleUrls: ['./products-management.css']
})
export class ProductsManagement implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8080/';

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = '';
  priceRange = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Modal state
  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedProduct: Product | null = null;

  // Form data
  formData: Partial<Product> = {};

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private csvService: CsvService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private settingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.syncItemsPerPage();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ products, categories }) => {
        this.products = products;
        this.categories = categories;
        this.applyFilters();
        this.loading = false;
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.loading = false;
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.optionsText?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(p => 
        p.categoryId?.toString() === this.selectedCategory
      );
    }

    // Price range filter
    if (this.priceRange) {
      const [min, max] = this.priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max;
        }
        return p.price >= min;
      });
    }

    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
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
  openAddModal(): void {
    this.modalMode = 'add';
    this.formData = {
      price: 0,
      stock: 0,
      rating: 0
    };
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.modalMode = 'edit';
    this.selectedProduct = product;
    this.formData = { ...product };
    this.showModal = true;
  }

  openViewModal(product: Product): void {
    this.modalMode = 'view';
    this.selectedProduct = product;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
    this.formData = {};
  }

  saveProduct(): void {
    if (this.modalMode === 'add') {
      // Use /products/addOne?categoryId=X endpoint
      const categoryId = this.formData.categoryId || 1;
      this.http.post<Product>(`${this.apiUrl}products/addOne?categoryId=${categoryId}`, this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            alert('Product created successfully!');
          },
          error: (err) => {
            console.error('Failed to create product:', err);
            alert('Failed to create product. ' + (err.error?.message || 'Please try again.'));
          }
        });
    } else if (this.modalMode === 'edit' && this.selectedProduct) {
      // Use /products/updateproduct endpoint
      const updateData = { ...this.formData, id: this.selectedProduct.id };
      this.http.put<Product>(`${this.apiUrl}products/updateproduct`, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            alert('Product updated successfully!');
          },
          error: (err) => {
            console.error('Failed to update product:', err);
            alert('Failed to update product. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?\n\nNote: This action cannot be undone.`)) {
      // Use /products/deleteOne/{productId} endpoint (uses GET)
      this.http.get(`${this.apiUrl}products/deleteOne/${product.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
            alert('Product deleted successfully!');
          },
          error: (err) => {
            console.error('Failed to delete product:', err);
            alert('Failed to delete product. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  exportProducts(): void {
    this.csvService.exportProducts().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'products_export.csv');
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockLabel(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  }
}
