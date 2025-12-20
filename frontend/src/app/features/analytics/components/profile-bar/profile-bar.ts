import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
}
