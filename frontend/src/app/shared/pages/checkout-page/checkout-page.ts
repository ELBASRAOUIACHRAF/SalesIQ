import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Checkout } from '../../components/checkout/checkout';

@Component({
  selector: 'app-checkout-page',
  imports: [Navbar, Footer, Checkout],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage {

}
