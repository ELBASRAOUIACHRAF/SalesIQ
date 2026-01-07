import { Component, Input, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { UsersService } from '../../../../core/services/users.service';
import { ProfileModel } from '../../../../core/models/profile.model';
import { NotificationService, AppNotification } from '../../../../core/services/notification.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './profile-bar.html',
  styleUrls: ['./profile-bar.css']
})
export class ProfileBarComponent implements OnInit, OnDestroy {
  @Input() userId = 1;
  @Input() compact = false;

  private destroy$ = new Subject<void>();
  
  // Profile state
  profile: ProfileModel | null = null;
  isLoading = true;
  loadError = false;

  // Notifications state
  notifications: AppNotification[] = [];
  unreadCount = 0;
  notificationPanelOpen = false;

  constructor(
    private usersService: UsersService,
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.setupNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  navigateToProfile(): void {
    this.router.navigate(['/analytics/profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.notificationPanelOpen = false;
    }
  }

  setupNotifications(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.loadError = false;

    this.usersService.getUsersProfile()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.warn('Profile load failed:', error.status, '- No user found');
          this.loadError = true;
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(profile => {
        this.profile = profile;
        this.isLoading = false;
      });
  }

  toggleNotificationPanel(event: Event): void {
    event.stopPropagation();
    this.notificationPanelOpen = !this.notificationPanelOpen;
  }

  markAsRead(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  refreshNotifications(): void {
    this.notificationService.refreshNotifications();
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return 'report_problem'; 
      case 'warning': return 'warning_amber';  
      default: return 'info';                  
    }
  }
  
  getTypeIcon(type: string): string {
    switch (type) {
      case 'low_stock': return 'inventory_2';   
      case 'high_churn': return 'person_remove';
      case 'sales_anomaly': return 'analytics'; 
      case 'new_review': return 'star';         
      default: return 'notifications';          
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  get displayInitial(): string {
    if (this.isLoading) return '...';
    if (this.loadError || !this.profile) return '?';
    const firstName = this.profile.firstName || '';
    return firstName.charAt(0).toUpperCase() || '?';
  }

  get displayName(): string {
    if (this.isLoading) return 'Loading...';
    if (this.loadError || !this.profile) return 'No User';
    return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim() || 'Unknown';
  }
}
