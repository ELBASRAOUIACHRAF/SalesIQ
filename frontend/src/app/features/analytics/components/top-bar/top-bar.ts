import { Component, Input, Output, EventEmitter, HostListener, OnInit, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileBarComponent } from '../profile-bar/profile-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, ProfileBarComponent, MatIconModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.css']
})
export class TopBarComponent implements OnInit, AfterViewInit {
  /** Title shown on the left */
  @Input() title = 'Dashboard';

  /** Tabs to show in the center */
  @Input() tabs: string[] = ['Today', 'This Week', 'This Month', 'This Year'];

  /** Currently active tab */
  @Input() activeTab = 'Today';

  /** Human readable date text */
  @Input() dateText = '05 Feb 2024, Monday';

  /** Label for the main CTA on the right */
  @Input() buttonLabel = 'LATEST REPORTS';

  /** Whether to show the settings gear */
  @Input() showSettings = true;
  /** When viewport width is <= compactAt, show compact select instead of full tabs */
  @Input() compactAt = 520;

  /** Show/hide profile bar and notifications */
  @Input() showProfileBar = true;

  /** User ID for profile API call */
  @Input() userId = 1;

  compactTabs = false;
  profileMenuOpen = signal(false);

  @Output() tabChange = new EventEmitter<string>();
  @Output() buttonClick = new EventEmitter<void>();

  ngOnInit() {
    this.updateCompact();
  }

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

  @HostListener('window:resize')
  onResize() {
    this.updateCompact();
  }

  updateCompact() {
    try {
      this.compactTabs = window.innerWidth <= (this.compactAt || 520);
    } catch {
      this.compactTabs = false;
    }
  }

  selectTab(t: string) {
    this.activeTab = t;
    this.tabChange.emit(t);
  }

  selectFromEvent(e: Event) {
    const target = e.target as HTMLSelectElement | null;
    if (!target) return;
    const v = target.value;
    this.selectTab(v);
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update(v => !v);
  }
}
