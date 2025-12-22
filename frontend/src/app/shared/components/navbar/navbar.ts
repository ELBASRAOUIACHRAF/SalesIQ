import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BasketService } from '../../../core/services/basket.service';
import { SearchHistory } from '../../../core/models/searchHistory.model';
import { SearchHistoryService } from '../../../core/services/search-history.service';


interface NavLink {
  label: string;
  route: string;
  hasDropdown?: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule, 
    RouterLink,
    FormsModule,
    MatIconModule 
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  searchQuery: string = '';
  isMegamenuOpen: boolean = false;
  searchHistory!: SearchHistory[];
  // searchData!: SearchHistory;
  
  topNavLinks: NavLink[] = [
    { label: 'Home', route: '/' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  mainNavLinks: NavLink[] = [
    { label: 'Products', route: '/products' },
    { label: 'Categories', route: '/categories' },
    { label: 'Trending', route: '/trending' },
    { label: 'Megamenu', route: '#', hasDropdown: true },
  ];

  constructor(
    private cd: ChangeDetectorRef, 
    private basketService :BasketService,
    private searchHistoryService: SearchHistoryService,
    private router: Router
  ) { }

  cartCount: number = 0;

  ngOnInit(): void {

    this.basketService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cd.detectChanges();
    });

    // Initialisation au chargement (ex: basketId = 1)
    this.basketService.updateCartCount(1);
  }

  // Méthode pour basculer l'état du Megamenu
  toggleMegamenu(event: Event): void {
    event.preventDefault(); // Empêche la navigation
    this.isMegamenuOpen = !this.isMegamenuOpen;
  }

  onSearch() {
    
    if (this.searchQuery.trim().length > 0) {

      this.searchHistoryService.addUserSearchQuery(1, this.searchQuery).subscribe({
        next: (response) => {
          console.log('Recherche enregistrée avec succès', response);
          
          this.router.navigate(['/products'], { queryParams: { q: this.searchQuery } });
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde de la recherche', error);
        }
      });

    }
  }
  
}
