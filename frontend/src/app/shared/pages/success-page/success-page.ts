import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-page',
  imports: [],
  templateUrl: './success-page.html',
  styleUrl: './success-page.css',
})
export class SuccessPage {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
