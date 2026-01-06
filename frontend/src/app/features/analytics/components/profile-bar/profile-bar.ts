import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { UsersService } from '../../../../core/services/users.service';
import { ProfileModel } from '../../../../core/models/profile.model';

@Component({
  selector: 'app-profile-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-bar.html',
  styleUrls: ['./profile-bar.css']
})
export class ProfileBarComponent implements OnInit, OnDestroy {
  @Input() notifications = 0;
  @Input() userId = 1; // Can be passed from parent
  @Input() compact = false;

  private destroy$ = new Subject<void>();
  
  // Profile state
  profile: ProfileModel | null = null;
  isLoading = true;
  loadError = false;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.loadError = false;

    this.usersService.getUsersProfile(this.userId)
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
