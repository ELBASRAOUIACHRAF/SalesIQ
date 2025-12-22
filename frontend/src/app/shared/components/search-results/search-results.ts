import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit{
  searchQuery: string = '';
  products: any[] = []; // Remplacez any par Product[]
  isLoading: boolean = true;
  totalResults: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Écoute les changements dans l'URL (ex: ?q=iphone)
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      
      if (this.searchQuery) {
        this.performSearch(this.searchQuery);
      } else {
        this.isLoading = false;
      }
    });
  }

  // Données de test statiques
  mockProducts = [
    {
      id: 1,
      name: 'MacBook Pro 14" M3 Pro',
      category: { name: 'Laptops' },
      price: 1999.00,
      oldPrice: 2199.00,
      discount: 10,
      rating: 4.8,
      reviewsCount: 124,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=500',
      description: 'Le tout nouveau MacBook Pro avec puce M3 Pro.'
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5 Wireless',
      category: { name: 'Audio' },
      price: 349.99,
      oldPrice: null,
      discount: 0,
      rating: 4.9,
      reviewsCount: 850,
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=500',
      description: 'Réduction de bruit leader du marché.'
    },
    {
      id: 3,
      name: 'Samsung Galaxy S24 Ultra',
      category: { name: 'Smartphones' },
      price: 1299.00,
      oldPrice: 1399.00,
      discount: 7,
      rating: 4.7,
      reviewsCount: 45,
      imageUrl: 'https://images.unsplash.com/photo-1610945265078-3858a084d33a?auto=format&fit=crop&q=80&w=500',
      description: 'L\'expérience Android ultime avec IA intégrée.'
    },
    {
      id: 4,
      name: 'Logitech MX Master 3S',
      category: { name: 'Accessories' },
      price: 99.00,
      oldPrice: null,
      discount: 0,
      rating: 4.8,
      reviewsCount: 2300,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=500',
      description: 'La souris de productivité par excellence.'
    },
    {
      id: 5,
      name: 'ASUS ROG Strix G16',
      category: { name: 'Gaming' },
      price: 1450.00,
      oldPrice: 1700.00,
      discount: 15,
      rating: 4.5,
      reviewsCount: 32,
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=500',
      description: 'Puissance de jeu brute pour les gamers exigeants.'
    },
    {
      id: 6,
      name: 'iPad Air 5',
      category: { name: 'Tablets' },
      price: 599.00,
      oldPrice: null,
      discount: 0,
      rating: 4.6,
      reviewsCount: 150,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=500',
      description: 'Léger, puissant et polyvalent.'
    }
  ];


  performSearch(query: string) {
    this.isLoading = true;

    // --- MODE TEST (SANS BACKEND) ---
    // Simule un délai réseau de 1 seconde pour voir le spinner
    // setTimeout(() => {
      
      // Filtrage simple pour simuler la recherche
      if (query) {
        this.products = this.mockProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.category.name.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        this.products = this.mockProducts; // Si vide, on montre tout
      }

      this.totalResults = this.products.length;
      this.isLoading = false;
    // }, 100);

    // --- MODE RÉEL (GARDER COMMENTÉ POUR L'INSTANT) ---
    /*
    this.productService.searchProducts(query).subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : data.content; 
        this.totalResults = this.products.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur recherche', err);
        this.isLoading = false;
      }
    });
    */
  }

  // Helpers pour les étoiles (réutilisés)
  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(0);
  }

  fullStars(rating: number): number {
    return Math.floor(rating || 0);
  }
  
  hasHalfStar(rating: number): boolean {
    const decimal = (rating || 0) - Math.floor(rating || 0);
    return decimal >= 0.25 && decimal < 0.75;
  }
}
 