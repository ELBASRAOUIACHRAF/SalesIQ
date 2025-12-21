import { Component, Input, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-recommended-products',
  imports: [CommonModule, MatIconModule],
  templateUrl: './recommended-products.html',
  styleUrl: './recommended-products.css',
})
export class RecommendedProducts implements OnInit {

  currentProductId!: number;
  recommendedProducts: Product[] = [];
  loading = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.currentProductId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRecommendations();
    this.cdr.detectChanges();
  }

  loadRecommendations() {
    this.loading = true;
    this.productService.getSimilarProducts(this.currentProductId).subscribe({
      next: (data) => {
        this.recommendedProducts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement recommandations', err);
        this.loading = false;
      }
    });
  }

  fullStars(rating: number): number {
    return Math.floor(rating);
  }
  
  addProductToBasket(productId: number) {
    // this.basketService.addProductToBasket(productId);
    console.log('addProductToBasket', productId);
  }

  hasHalfStar(rating: number): boolean {
    // Affiche une demi-étoile si la décimale est >= 0.25 et < 0.75
    const decimal = rating - Math.floor(rating);
    return decimal >= 0.25 && decimal < 0.75;
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
 