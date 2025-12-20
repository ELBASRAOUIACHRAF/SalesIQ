import { Component, Input, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.css']
})
export class AppHeaderComponent implements OnInit, AfterViewInit {
  @Input() userName = 'John Doe';
  @Input() userEmail = 'john.doe@example.com';
  @Input() userRole = 'Administrator';
  @Input() notificationCount = 3;
  @Input() logoText = 'SIQ';

  profileMenuOpen = signal(false);

  get userInitials(): string {
    const names = this.userName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // Close profile menu when clicking outside
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.profile-wrapper')) {
          this.profileMenuOpen.set(false);
        }
      });
    }
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update(v => !v);
  }
}

