import { Component, Input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SystemSettingsService } from '../../../../core/services/system-settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css']
})
export class AdminSidebar implements OnInit, OnDestroy {
  @Input() width = '280px';
  @Input() collapsedWidth = '72px';

  closed = signal(false);
  siteName = signal('SalesIQ');
  private destroy$ = new Subject<void>();

  constructor(private settingsService: SystemSettingsService) {}

  ngOnInit(): void {
    this.siteName.set(this.settingsService.getSetting('siteName'));
    this.settingsService.settingsChanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.siteName.set(settings.siteName);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle() {
    this.closed.update(v => !v);
  }

  open() {
    this.closed.set(false);
  }

  close() {
    this.closed.set(true);
  }

  handleNavClick() {
    if (this.isNarrow()) {
      this.close();
    }
  }

  private isNarrow(): boolean {
    try {
      return window.innerWidth <= 1024;
    } catch {
      return false;
    }
  }
}
