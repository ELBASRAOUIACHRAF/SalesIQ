import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { SearchResults } from '../../components/search-results/search-results';

@Component({
  selector: 'app-search-results-page',
  imports: [Navbar, Footer, SearchResults],
  templateUrl: './search-results-page.html',
  styleUrl: './search-results-page.css',
})
export class SearchResultsPage {

}
