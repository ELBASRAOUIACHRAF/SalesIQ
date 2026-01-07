import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of, finalize } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Productcard } from '../../components/productcard/productcard';
import { ProductFilterSidebar, FilterState } from '../../components/product-filter-sidebar/product-filter-sidebar';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-page',
  imports: [
    CommonModule, 
    Navbar, 
    Footer, 
    Productcard, 
    ProductFilterSidebar
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State
  currentFilters: FilterState | null = null;
  products: Product[] = [];
  isLoading = true;
  loadError = false;
  errorMessage = '';

  // Stats
  totalProducts = 0;
  filteredCount = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.loadError = false;

    this.productService.getProducts()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load products:', error);
          this.loadError = true;
          this.errorMessage = error.status === 0 
            ? 'Unable to connect to server. Please check if the backend is running.'
            : `Failed to load products: ${error.message || 'Unknown error'}`;
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(products => {
        this.products = products;
        this.totalProducts = products.length;
        this.filteredCount = products.length;
      });
  }

  onFiltersChanged(newFilters: FilterState): void {
    this.currentFilters = { ...newFilters };
  }

  onFilteredCountChange(count: number): void {
    this.filteredCount = count;
  }

  retryLoad(): void {
    this.loadProducts();
  }
}
