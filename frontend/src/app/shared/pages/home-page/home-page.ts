import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Home } from '../../components/home/home';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home-page',
  imports: [Navbar, Home, Footer],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
