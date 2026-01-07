import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-bar.html',
  styleUrls: ['./profile-bar.css']
})
export class ProfileBarComponent {
  @Input() notifications = 0;
  @Input() userName = 'User';
  @Input() compact = false; // compact variant for small cards

  constructor(private router: Router) {}

  navigateToProfile(): void {
    this.router.navigate(['/analytics/profile']);
  }
  
}
