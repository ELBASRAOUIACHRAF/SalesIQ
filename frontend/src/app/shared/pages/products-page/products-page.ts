import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Productcard } from '../../components/productcard/productcard';
import { ProductFilterSidebar, FilterState } from '../../components/product-filter-sidebar/product-filter-sidebar';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-products-page',
  imports: [
    CommonModule, 
    Navbar, 
    Footer, 
    Productcard, 
    ProductFilterSidebar
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage {
// Cette variable stocke l'état actuel des filtres
currentFilters: FilterState | null = null;

// Cette méthode est appelée chaque fois que l'utilisateur change un filtre
onFiltersChanged(newFilters: FilterState): void {
  console.log('Nouveaux filtres reçus dans la page:', newFilters);
  this.currentFilters = { ...newFilters }; // On crée une copie pour déclencher le ngOnChanges de la carte
}
}
