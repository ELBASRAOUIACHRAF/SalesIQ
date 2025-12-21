import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Contact } from '../../components/contact/contact';



@Component({
  selector: 'app-contact-page',
  imports: [Navbar, Footer, Contact],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {

}
