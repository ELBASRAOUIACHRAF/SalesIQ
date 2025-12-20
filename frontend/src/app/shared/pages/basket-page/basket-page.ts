import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Basket } from '../../components/basket/basket';
import { RecommendationsSidebar } from '../../components/recommendations-sidebar/recommendations-sidebar';
@Component({
  selector: 'app-basket-page',
  imports: [
    CommonModule,
    Navbar,
    Footer,
    Basket,
    RecommendationsSidebar
  ],
  templateUrl: './basket-page.html',
  styleUrl: './basket-page.css',
})
export class BasketPage {

}
