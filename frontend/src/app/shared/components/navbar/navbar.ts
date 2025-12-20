import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BasketService } from '../../../core/services/basket.service';

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
  isMegamenuOpen: boolean = false;
  
  topNavLinks: NavLink[] = [
    { label: 'Home', route: '/home' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  mainNavLinks: NavLink[] = [
    { label: 'Product', route: '/products' },
    { label: 'Collections', route: '/collections', hasDropdown: true },
    { label: 'Trending', route: '/trending' },
    { label: 'Megamenu', route: '#', hasDropdown: true },
  ];

  constructor(private cd: ChangeDetectorRef, private basketService :BasketService) { }

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
  
}
