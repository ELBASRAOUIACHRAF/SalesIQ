import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { ProductImages } from '../../components/product-images/product-images';
import { ProductDetails } from '../../components/product-details/product-details';
import { ProductBuyCard } from '../../components/product-buy-card/product-buy-card';
import { RatingDetails } from '../../components/rating-details/rating-details';
import { Review } from '../../components/review/review';
import { RecommendedProducts } from '../../components/recommended-products/recommended-products';
@Component({
  selector: 'app-details-product-page',
  imports: [
    CommonModule,
    Navbar,
    Footer,
    ProductImages,
    ProductDetails,
    ProductBuyCard,
    RatingDetails,
    Review,
    RecommendedProducts
  ],
  templateUrl: './details-product-page.html',
  styleUrl: './details-product-page.css',
})
export class DetailsProductPage {

}
