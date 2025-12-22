import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
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
export class ProductFilterSidebar implements OnInit {

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cd: ChangeDetectorRef
  ) {}

  @Output() filtersChanged = new EventEmitter<FilterState>();

  categories : Category[] = [];
  brands : string[] = [];

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
    { label: 'Up to $45', min: 0, max: 45 },
    { label: '$45 to $90', min: 45, max: 90 },
    { label: '$90 to $150', min: 90, max: 150 },
    { label: '$150 & above', min: 150, max: 10000 }
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
    this.categoryService.getCategories().subscribe((data) => {
      this.categories = data;
      this.cd.detectChanges();
    });
    // Décommenter si vous avez un endpoint pour les marques
    // this.productService.getBrands().subscribe((data: string[]) => {
    //   this.brands = data;
    // });
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
    
    
    // Émettre les filtres réinitialisés
    this.applyFilters();
  }
}