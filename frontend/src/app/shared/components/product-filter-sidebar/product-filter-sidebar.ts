import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';

export interface FilterState {
  categories: Category[];
  priceMin: number;
  priceMax: number;
  priceRanges: string[];
  minRating: number;
  brands: string[];
}

@Component({
  selector: 'app-product-filter-sidebar',
  imports: [
    FormsModule,
    CommonModule,
    MatSliderModule,
  ],
  templateUrl: './product-filter-sidebar.html',
  styleUrl: './product-filter-sidebar.css',
})
export class ProductFilterSidebar implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cd: ChangeDetectorRef
  ) {}

  @Output() filtersChanged = new EventEmitter<FilterState>();

  categories: Category[] = [];
  brands: string[] = [];
  
  // Loading states
  isLoadingCategories = true;
  isLoadingBrands = true;
  categoriesError = false;
  brandsError = false;

  showAllBrands = false;
  showAllCategories = false;
  visibleBrandsLimit = 5;
  visibleCategoriesLimit = 5;

  get visibleBrands(): string[] {
    return this.showAllBrands
      ? this.brands
      : this.brands.slice(0, this.visibleBrandsLimit);
  }

  get visibleCategories(): Category[] {
    return this.showAllCategories
      ? this.categories
      : this.categories.slice(0, this.visibleCategoriesLimit);
  }

  get shouldShowBrandsSeeMore(): boolean {
    return this.brands.length > this.visibleBrandsLimit;
  }

  get shouldShowCategoriesSeeMore(): boolean {
    return this.categories.length > this.visibleCategoriesLimit;
  }

  toggleBrandsVisibility(): void {
    this.showAllBrands = !this.showAllBrands;
  }

  toggleCategoriesVisibility(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 to $100', min: 50, max: 100 },
    { label: '$100 to $200', min: 100, max: 200 },
    { label: '$200 & above', min: 200, max: 10000 }
  ];

  filterState: FilterState = {
    categories: [],
    priceMin: 0,
    priceMax: 10000,
    priceRanges: [],
    minRating: 0,
    brands: []
  };

  ngOnInit(): void {
    this.loadFiltersData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFiltersData(): void {
    // Load categories
    this.categoryService.getCategories()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load categories:', error);
          this.categoriesError = true;
          return of([]);
        })
      )
      .subscribe(data => {
        this.categories = data;
        this.isLoadingCategories = false;
        this.cd.detectChanges();
      });

    // Load brands
    this.productService.getBrands()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.warn('Brands endpoint not available:', error);
          this.brandsError = true;
          return of([]);
        })
      )
      .subscribe(data => {
        this.brands = data;
        this.isLoadingBrands = false;
        this.cd.detectChanges();
      });
  }

  /**
   * Gère les changements sur les cases à cocher (Catégorie, Marque)
   */
  toggleArrayFilter(
    key: 'brands' | 'categories',
    value: string | Category,
    event: Event
  ): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (key === 'categories') {
      const category = value as Category;
      if (checked) {
        this.filterState.categories = [...this.filterState.categories, category];
      } else {
        this.filterState.categories = this.filterState.categories.filter(c => c.id !== category.id);
      }
    } else {
      const brand = value as string;
      if (checked) {
        this.filterState.brands = [...this.filterState.brands, brand];
      } else {
        this.filterState.brands = this.filterState.brands.filter(b => b !== brand);
      }
    }
    
    // Émettre immédiatement les changements
    this.applyFilters();
  }

  /**
   * Gère les changements sur les inputs de prix
   */
  onPriceChange(): void {
    this.applyFilters();
  }

  /**
   * Applique les filtres en émettant l'état actuel au parent
   * IMPORTANT: Crée une NOUVELLE référence d'objet pour forcer la détection de changement
   */
  applyFilters(): void {
    // Créer un nouvel objet avec de nouvelles références pour forcer ngOnChanges
    const filtersCopy: FilterState = {
      categories: [...this.filterState.categories],
      brands: [...this.filterState.brands],
      priceRanges: [...this.filterState.priceRanges],
      priceMin: this.filterState.priceMin,
      priceMax: this.filterState.priceMax,
      minRating: this.filterState.minRating
    };
    
    this.filtersChanged.emit(filtersCopy);
  }

  selectPriceRange(range: any): void {
    this.filterState.priceMin = range.min;
    this.filterState.priceMax = range.max;
    this.applyFilters();
  }

  availableRatings = [4, 3, 2, 1];

  setRating(rating: number): void {
    // Si le même rating est cliqué, désélectionner (remettre à 0)
    if (this.filterState.minRating === rating) {
      this.filterState.minRating = 0;
    } else {
      this.filterState.minRating = rating;
    }
    this.applyFilters();
  }

  getStarsForRating(rating: number): string {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return fullStars + emptyStars;
  }

  isRatingSelected(rating: number): boolean {
    return this.filterState.minRating === rating;
  }

  /**
   * Vérifie si une catégorie est sélectionnée
   */
  isCategorySelected(category: Category): boolean {
    return this.filterState.categories.some(c => c.id === category.id);
  }

  /**
   * Vérifie si une marque est sélectionnée
   */
  isBrandSelected(brand: string): boolean {
    return this.filterState.brands.includes(brand);
  }

  /**
   * Réinitialise tous les filtres à leur état initial
   */
  resetFilters(): void {
    this.filterState = {
      categories: [],
      priceMin: 0,
      priceMax: 10000,
      priceRanges: [],
      minRating: 0,
      brands: []
    };
    
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.filterState.categories.length > 0 ||
           this.filterState.brands.length > 0 ||
           this.filterState.minRating > 0 ||
           this.filterState.priceMin > 0 ||
           this.filterState.priceMax < 10000;
  }
}