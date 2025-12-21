import { Component, Input, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-recommended-products',
  imports: [CommonModule],
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
    // this.currentProductId = 23;
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

  goToProduct(id: number) {
    this.router.navigate(['/product', id]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
 