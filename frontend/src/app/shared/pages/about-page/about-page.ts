import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { About } from '../../components/about/about';

@Component({
  selector: 'app-about-page',
  imports: [Navbar, Footer, About],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage {

}
