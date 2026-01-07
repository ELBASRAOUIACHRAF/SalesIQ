import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports: [],
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
})
export class ErrorPage {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
