import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RecommendedProduct } from '../../../core/models/recommendedProduct.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recommendations-sidebar',
  imports: [CommonModule, MatButtonModule, MatIconModule, NgClass, MatDividerModule, RouterLink],
  templateUrl: './recommendations-sidebar.html',
  styleUrl: './recommendations-sidebar.css',
})
export class RecommendationsSidebar {
  recommendedProducts: RecommendedProduct[] = [];

  constructor() { }

  ngOnInit(): void {
    // Simule le chargement de produits recommandés
    this.loadRecommendations();
  }

  loadRecommendations() {
    // En production, vous feriez un appel à un service:
    // this.recommendationService.getRecommendations(currentProductId).subscribe(data => {
    //   this.recommendedProducts = data;
    // });

    // Données de test
    this.recommendedProducts = [
      {
        id: 3,
        name: 'Casque Audio Sony WH-1000XM5',
        price: 349,
        imageUrl: 'https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_UL320_.jpg',
        rating: 4.7,
        discount: 5
      },
      {
        id: 4,
        name: 'Souris Gaming Logitech G502 HERO',
        price: 79,
        imageUrl: 'https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_UL320_.jpg',
        rating: 4.8
      },
      {
        id: 5,
        name: 'Clavier Mécanique HyperX Alloy Origins',
        price: 109,
        imageUrl: 'https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_UL320_.jpg',
        rating: 4.5,
        discount: 15
      }
    ];
  }

  // Pour la navigation vers le détail du produit
  viewProduct(id: number) {
    // Naviguez vers la page de détails du produit
    // this.router.navigate(['/product', id]);
    console.log(`Naviguer vers le produit: ${id}`);
  }

  // Méthode pour le calcul du prix avec remise
  calculatePrice(product: RecommendedProduct): number {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  }
}
