import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class Productcard implements OnInit, OnChanges {
  @Input() filters: FilterState | null = null;
  
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  currentPage = 1;
  pageSize = 15;
  isLoading = false;

  constructor(
    private basketService: BasketService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialProducts();
  }

  loadInitialProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      this.allProducts = products;
      this.applyFilters();
      this.cdr.detectChanges(); // Forcer la détection de changement
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

    // Si aucune catégorie n'est sélectionnée, on travaille avec tous les produits
    if (categoryIds.length === 0) {
      
      this.processLocalFiltering(this.allProducts);
      this.cdr.detectChanges(); // Forcer la mise à jour de l'UI
      return;
    }

    // Si des catégories sont sélectionnées, on récupère les produits correspondants
    
    this.isLoading = true;
    this.cdr.detectChanges(); // Afficher le loader immédiatement
    
    this.productService.getProductsByMultipleCategories(categoryIds).subscribe({
      next: (productsFromBackend) => {
        this.isLoading = false;
        this.processLocalFiltering(productsFromBackend);
        this.cdr.detectChanges(); // Forcer la mise à jour de l'UI
      },
      error: (err) => {
        this.isLoading = false;
        this.filteredProducts = [];
        this.cdr.detectChanges(); // Forcer la mise à jour même en cas d'erreur
      }
    });
  }

  private processLocalFiltering(baseProducts: Product[]): void {
    if (!this.filters) {
      this.filteredProducts = baseProducts;
      this.cdr.markForCheck(); // Marquer pour vérification
      return;
    }

    this.filteredProducts = baseProducts.filter(product => {
      // Filtre par marque
      if (this.filters!.brands.length > 0) {
        if (!product.brand || !this.filters!.brands.includes(product.brand)) {
          return false;
        }
      }

      // Filtre par prix
      if (product.price < this.filters!.priceMin || product.price > this.filters!.priceMax) {
        return false;
      }

      // Filtre par note minimale
      if (this.filters!.minRating > 0 && product.rating < this.filters!.minRating) {
        return false;
      }

      return true;
    });

    this.cdr.markForCheck(); // Marquer pour vérification
  }

  // --- MÉTHODES POUR LES ÉTOILES ---
  fullStars(rating: number): number {
    // Retourne la partie entière (ex: 4.5 -> 4)
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    // Si le reste est entre 0.25 et 0.75, on affiche une demi-étoile
    const decimal = rating % 1;
    return decimal >= 0.25 && decimal < 0.75;
  }

  
  onAddToCart(product: Product) {
    
    this.basketService.addToBasket(
      1, 
      product.id
    ).subscribe({
      next: (success) => {
        if (success) {
          // Optionnel : Afficher un message de succès (SnackBar)
          console.log('Produit ajouté au panier !', product.stock);
          this.basketService.updateCartCount();
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout au panier', err);
      }
    });
  }





  // --- Pagination ---
  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onAddToWishlist(product: any) {
    // Inverse l'état local pour l'exemple
    // product.isInWishlist = !product.isInWishlist;
    
    console.log('Produit ajouté aux favoris:', product.name);
    // Ici, appelez votre service API pour sauvegarder le choix
  }
}