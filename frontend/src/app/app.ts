import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Product } from './core/models/product.model';
import { Productcard } from './shared/components/productcard/productcard';
import { Navbar } from './shared/components/navbar/navbar';
import { ProductFilterSidebar, FilterState } from './shared/components/product-filter-sidebar/product-filter-sidebar';
import { Footer } from './shared/components/footer/footer';
import { Account } from './shared/components/account/account';
import { Profile } from './shared/pages/profile/profile';
import { BasketPage } from './shared/pages/basket-page/basket-page';
import { ProductsPage } from './shared/pages/products-page/products-page';
import { DetailsProductPage } from './shared/pages/details-product-page/details-product-page';

import { ProductImages } from './shared/components/product-images/product-images';
import { ProductDetails } from './shared/components/product-details/product-details';
import { ProductBuyCard } from './shared/components/product-buy-card/product-buy-card';
import { RatingDetails } from './shared/components/rating-details/rating-details';
import { Review } from './shared/components/review/review';

import { Basket } from './shared/components/basket/basket';
import { RecommendationsSidebar } from './shared/components/recommendations-sidebar/recommendations-sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Productcard, Navbar, ProductFilterSidebar, Footer, Account, Profile, ProductsPage,DetailsProductPage, BasketPage, 
    ProductImages,
    ProductDetails,
    ProductBuyCard,
    RatingDetails,
    Review,

    Basket,
    RecommendationsSidebar,

  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  currentFilters: FilterState = {
    categories: [],
    priceMin: 0,
    priceMax: 10000,
    priceRanges: [],
    minRating: 0,
    brands: []
  };

  onFiltersChanged(filters: FilterState): void {
    this.currentFilters = filters;
  }
}
