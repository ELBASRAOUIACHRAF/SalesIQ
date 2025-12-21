import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngFor, *ngIf, pipe number, etc.
import { RouterLink } from '@angular/router'; 

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number; // Optionnel pour calculer la promo
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  discount?: number;
}

@Component({
  selector: 'app-home',
  standalone: true, // Confirmation que c'est un standalone component
  imports: [CommonModule, RouterLink], 
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  protected readonly Math = Math;
 

  heroTitle = "Technology for Your Everyday Life";
  heroSubtitle = "Discover the latest innovations: unparalleled performance and exceptional design at unbeatable prices.";
  heroButtonText = "Shop Now";
  heroLink = "/products";

  // Features / Services (Barre d'info sous le hero)
  features = [
    { icon: 'local_shipping', title: 'Free Shipping', text: 'Orders over $50' },
    { icon: 'support_agent', title: '24/7 Support', text: 'Dedicated tech support' },
    { icon: 'verified_user', title: 'Secure Payment', text: '100% safe & encrypted' },
    { icon: 'inventory_2', title: 'Easy Returns', text: 'Within 30 days' },
  ];

  // Catégories avec des images plus "tech"
  featuredCategories = [
    { 
      name: 'Laptops', 
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      link: '/category/laptops' 
    },
    { 
      name: 'Audio & Sound', 
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      link: '/category/audio' 
    },
    { 
      name: 'Accessories', 
      imageUrl: 'https://images.unsplash.com/3/www.madebyvadim.com.jpg?q=80&w=2082&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
      link: '/category/accessories' 
    },
    { 
      name: 'Gaming', 
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      link: '/category/gaming' 
    },
    { 
      name: 'Gaming', 
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      link: '/category/gaming' 
    },
  ];

  // Produits simulés pour ressembler à votre screenshot
  featuredProducts: Product[] = [
    { 
      id: 101, 
      name: 'Dell XPS 15 - Édition 2025', 
      category: 'Ordinateur Portable',
      price: 8500.00, 
      originalPrice: 9444.44,
      discount: 10,
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      rating: 4.5, 
      reviewsCount: 12,
      stock: 15
    },
    { 
      id: 102, 
      name: 'Sony WH-1000XM5', 
      category: 'Audio',
      price: 349.00, 
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      rating: 5, 
      reviewsCount: 85,
      stock: 5 // Low stock
    },
    { 
      id: 103, 
      name: 'Apple Watch Series 9', 
      category: 'Wearable',
      price: 399.00, 
      originalPrice: 450.00,
      discount: 11,
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      rating: 4.8, 
      reviewsCount: 210,
      stock: 0 // Out of stock
    },
    { 
      id: 104, 
      name: 'Logitech MX Master 3S', 
      category: 'Accessoires',
      price: 99.00, 
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 
      rating: 4.9, 
      reviewsCount: 340,
      stock: 50
    },
  ];

  constructor() { }

  ngOnInit(): void {}

}