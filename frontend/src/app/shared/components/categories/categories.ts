import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryInfo } from '../../../core/models/categoryInfo.model';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common'; 



@Component({
  selector: 'app-categories',
  imports: [MatIconModule, CommonModule ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
// Données simulées (basées sur votre modèle)
categories: CategoryInfo[] = [
  {
    id: 1,
    name: 'Laptops & Computers',
    description: 'Découvrez nos ordinateurs portables haute performance pour le travail et le jeu.',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    productCount: 45
  },
  {
    id: 2,
    name: 'Smartphones',
    description: 'Les derniers modèles Android et iOS avec les meilleures caméras.',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    productCount: 120
  },
  {
    id: 3,
    name: 'Audio & Sound',
    description: 'Casques, écouteurs et enceintes pour une expérience sonore immersive.',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    productCount: 32
  },
  {
    id: 4,
    name: 'Gaming',
    description: 'Consoles, manettes et accessoires pour les gamers exigeants.',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    productCount: 18
  },
  {
    id: 5,
    name: 'Accessories',
    description: 'Câbles, chargeurs, et tout ce dont vous avez besoin au quotidien.',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    productCount: 85
  },
  {
    id: 6,
    name: 'Smart Home',
    description: 'Automatisez votre maison avec nos solutions connectées.',
    isActive: false, // Exemple d'une catégorie inactive (ne sera pas affichée)
    imageUrl: '',
    productCount: 0
  }
];

constructor(private router: Router) {}

// Filtrer pour ne montrer que les catégories actives
get activeCategories() {
  return this.categories.filter(c => c.isActive);
}

navigateToCategory(categoryName: string) {
  // Navigation vers le composant CategoryProducts que nous avons créé précédemment
  this.router.navigate(['/category', categoryName]);
}
}
