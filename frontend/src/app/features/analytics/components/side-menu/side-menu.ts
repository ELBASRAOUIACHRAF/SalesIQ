import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-menu.html',
  styleUrls: ['./side-menu.css']
})
export class SideMenu {
  /** Widths are configurable via inputs */
  @Input() width = '260px';
  @Input() collapsedWidth = '72px';

  closed = signal(false);

  toggle() {
    this.closed.update(v => !v);
  }

  open() {
    this.closed.set(false);
  }

  close() {
    this.closed.set(true);
  }

  /** Auto-close on navigation for narrow viewports so content can take full width */
  handleNavClick() {
    if (this.isNarrow()) {
      this.close();
    }
  }

  private isNarrow(): boolean {
    try {
      return window.innerWidth <= 960;
    } catch {
      return false;
    }
  }
}
