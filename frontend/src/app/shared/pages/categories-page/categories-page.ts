import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Categories } from '../../components/categories/categories';

@Component({
  selector: 'app-categories-page',
  imports: [Navbar, Footer, Categories],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.css',
})
export class CategoriesPage {

}
