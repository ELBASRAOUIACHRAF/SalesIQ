import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of, finalize } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { FilterState } from '../product-filter-sidebar/product-filter-sidebar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BasketService } from '../../../core/services/basket.service';

@Component({
  selector: 'app-productcard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './productcard.html',
  styleUrl: './productcard.css',
})
export class Productcard implements OnInit, OnChanges, OnDestroy {
  @Input() filters: FilterState | null = null;
  @Output() filteredCountChange = new EventEmitter<number>();
  
  private destroy$ = new Subject<void>();
  
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  currentPage = 1;
  pageSize = 12;
  isLoading = false;
  loadError = false;
  errorMessage = '';
  
  // Track added items for animation
  addedToCart: Set<number> = new Set();
  addingToCart: Set<number> = new Set();

  constructor(
    private basketService: BasketService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialProducts(): void {
    this.isLoading = true;
    this.loadError = false;

    this.productService.getProducts()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load products:', error);
          this.loadError = true;
          this.errorMessage = 'Failed to load products. Please try again.';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(products => {
        this.allProducts = products;
        this.applyFilters();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.currentPage = 1;
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const categoryIds = this.filters?.categories?.map(c => c.id) ?? [];

    if (categoryIds.length === 0) {
      this.processLocalFiltering(this.allProducts);
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.loadError = false;
    this.cdr.detectChanges();
    
    this.productService.getProductsByMultipleCategories(categoryIds)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Filter error:', error);
          this.loadError = true;
          this.errorMessage = 'Failed to filter products.';
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(productsFromBackend => {
        this.processLocalFiltering(productsFromBackend);
      });
  }

  private processLocalFiltering(baseProducts: Product[]): void {
    if (!this.filters) {
      this.filteredProducts = baseProducts;
    } else {
      this.filteredProducts = baseProducts.filter(product => {
        // Filter by brand
        if (this.filters!.brands.length > 0) {
          if (!product.brand || !this.filters!.brands.includes(product.brand)) {
            return false;
          }
        }

        // Filter by price
        if (product.price < this.filters!.priceMin || product.price > this.filters!.priceMax) {
          return false;
        }

        // Filter by minimum rating
        if (this.filters!.minRating > 0 && product.rating < this.filters!.minRating) {
          return false;
        }

        return true;
      });
    }

    this.filteredCountChange.emit(this.filteredProducts.length);
    this.cdr.markForCheck();
  }

  // Star rating helpers
  fullStars(rating: number): number {
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    const decimal = rating % 1;
    return decimal >= 0.25 && decimal < 0.75;
  }
  // onAddToCart(product: Product) {
    
  //   this.basketService.addToBasket(
  //     1, 
  //     product.id
  //   ).subscribe({
  //     next: (success) => {
  //       if (success) {
  //         // Optionnel : Afficher un message de succès (SnackBar)
  //         console.log('Produit ajouté au panier !', product.stock);
  //         this.basketService.updateCartCount();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Erreur lors de l\'ajout au panier', err);
  //     }
  //   });

  emptyStars(rating: number): number {
    return 5 - this.fullStars(rating) - (this.hasHalfStar(rating) ? 1 : 0);
  }

  // Cart actions
  onAddToCart(product: Product): void {
    if (this.addingToCart.has(product.id)) return;
    
    this.addingToCart.add(product.id);
    this.cdr.detectChanges();
    
    this.basketService.addToBasket(1, product.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Add to cart error:', error);
          return of(false);
        }),
        finalize(() => {
          this.addingToCart.delete(product.id);
          this.cdr.detectChanges();
        })
      )
      .subscribe(success => {
        if (success) {
          this.addedToCart.add(product.id);
          this.basketService.updateCartCount();
          
          // Clear the "added" state after 2 seconds
          setTimeout(() => {
            this.addedToCart.delete(product.id);
            this.cdr.detectChanges();
          }, 2000);
        }
      });
  }

  isAddingToCart(productId: number): boolean {
    return this.addingToCart.has(productId);
  }

  wasAddedToCart(productId: number): boolean {
    return this.addedToCart.has(productId);
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, 5);
      else start = Math.max(1, total - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // Scroll to top of product grid
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }

  onAddToWishlist(product: Product): void {
    console.log('Added to wishlist:', product.name);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}