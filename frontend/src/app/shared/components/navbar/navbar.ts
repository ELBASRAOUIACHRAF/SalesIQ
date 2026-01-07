import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 
import { Router, RouterLinkActive } from '@angular/router';
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
    MatIconModule,
    RouterLinkActive 
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  searchQuery: string = '';
  isMegamenuOpen: boolean = false;
  searchHistory: SearchHistory[] = [];

  isSearchHistoryVisible: boolean = false;
  userId = 1;
  // searchData!: SearchHistory;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchContainer') searchContainer!: ElementRef;
  
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
    private router: Router,
    private eRef: ElementRef
  ) { }

  cartCount: number = 0;

  ngOnInit(): void {

    this.basketService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cd.detectChanges();
    });

    // Initialisation au chargement (ex: basketId = 1)
    this.basketService.updateCartCount();
    this.loadSearchHistory();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    // Si l'historique est visible et que le clic n'est PAS dans le conteneur de recherche
    if (this.isSearchHistoryVisible && this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.isSearchHistoryVisible = false;
    }
  }

  loadSearchHistory(){
    this.searchHistoryService.getRecentSearches().subscribe({
      next: (response: any) => {
        // Spring Boot renvoie un objet Page, la liste est dans 'content'
        this.searchHistory = response.content;
        
        console.log('Historique chargé :', this.searchHistory);
        
        // Force la détection de changement si nécessaire (utile si les données n'apparaissent pas tout de suite)
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique', error);
      }
    });
  }

  

  // Méthode pour basculer l'état du Megamenu
  toggleMegamenu(event: Event): void {
    event.preventDefault(); // Empêche la navigation
    this.isMegamenuOpen = !this.isMegamenuOpen;
  }

  onSearch() {
    const cleanQuery = this.searchQuery.trim();

    if (cleanQuery.length > 0) {
      const exists = this.searchHistory.some(item => 
        item.query.toLowerCase() === cleanQuery.toLowerCase()
      );
      if(!exists){
        this.searchHistoryService.addUserSearchQuery(this.searchQuery).subscribe({
          next: (response) => {
            console.log('Recherche enregistrée avec succès', response);
            
            this.router.navigate(['/productsResults'], { queryParams: { q: this.searchQuery } });
            // this.hideSearchHistory();
          },
          error: (error) => {
            console.error('Erreur lors de la sauvegarde de la recherche', error);
          }
        });
      } else {
        this.router.navigate(['/productsResults'], { queryParams: { q: this.searchQuery } });
      }
    }
  }

  showSearchHistory() {
    this.isSearchHistoryVisible = true;
    // Optionally refresh history here
    this.loadSearchHistory(); 
  }

  deleteHistoryItem(event: Event, id: number) {
    event.stopPropagation(); // Prevent triggering selectHistoryItem
    this.searchHistoryService.deleteFromSearchHistory(id).subscribe({
      next: () => {
        // Remove from local array
        this.searchHistory = this.searchHistory.filter(item => item.id !== id);
        this.cd.detectChanges();
      }
    });
  }

  clearAllHistory() {
    this.searchHistoryService.clearUsersHistory().subscribe({
      next: () => {
        this.searchHistory = [];
      }
    });
  }

  selectHistoryItem(query: string) {
    this.searchQuery = query;
    this.isSearchHistoryVisible = false;
    this.onSearch(); // Trigger search

  }
  // hideSearchHistory() {
  //   // Petit délai pour permettre le clic sur un élément de la liste avant fermeture
  //   setTimeout(() => {
  //     this.isSearchHistoryVisible = false;
  //   }, 200);
  // }
  
}
