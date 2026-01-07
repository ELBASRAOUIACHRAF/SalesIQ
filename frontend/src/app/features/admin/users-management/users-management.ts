import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Users } from '../../../core/models/users.model';
import { CsvService } from '../../../core/services/csv.service';
import { HttpClient } from '@angular/common/http';
import { SystemSettingsService } from '../../../core/services/system-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './users-management.html',
  styleUrls: ['./users-management.css']
})
export class UsersManagement implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8080/';

  users: Users[] = [];
  filteredUsers: Users[] = [];
  loading = true;
  searchTerm = '';
  selectedRole = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Modal state
  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedUser: Users | null = null;
  
  // Form data
  formData: Partial<Users> = {};
  
  // Available roles (from backend)
  roles = ['CLIENT', 'ADMIN', 'SELLER', 'SUPPLIER', 'ANALYST'];

  constructor(
    private http: HttpClient,
    private csvService: CsvService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private settingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.syncItemsPerPage();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    // Use getUsersList endpoint
    this.http.get<Users[]>(`${this.apiUrl}users/getUsersList`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users || [];
          this.applyFilters();
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        },
        error: (err) => {
          console.error('Failed to load users:', err);
          this.users = [];
          this.filteredUsers = [];
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.users];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term)
      );
    }
    
    // Role filter
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedUsers(): Users[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  private syncItemsPerPage(): void {
    const current = this.settingsService.getSetting('itemsPerPage');
    if (current) {
      this.itemsPerPage = current;
    }

    this.settingsService.settingsChanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        if (settings.itemsPerPage && settings.itemsPerPage !== this.itemsPerPage) {
          this.itemsPerPage = settings.itemsPerPage;
          this.applyFilters();
          this.cdr.detectChanges();
        }
      });
  }

  // Modal operations
  openAddModal(): void {
    this.modalMode = 'add';
    this.formData = {
      role: 'CLIENT',
      active: true
    };
    this.showModal = true;
  }

  openEditModal(user: Users): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.formData = { ...user };
    this.showModal = true;
  }

  openViewModal(user: Users): void {
    this.modalMode = 'view';
    this.selectedUser = user;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.formData = {};
  }

  saveUser(): void {
    if (this.modalMode === 'add') {
      // Create new user using /users/addUser endpoint
      const userData = {
        username: this.formData.username,
        email: this.formData.email,
        firstName: this.formData.firstName || '',
        lastName: this.formData.lastName || '',
        phoneNumber: this.formData.phoneNumber || '',
        role: this.formData.role || 'CLIENT',
        bio: this.formData.bio || '',
        city: this.formData.city || '',
        country: this.formData.country || '',
        postalCode: this.formData.postalCode || '',
        active: this.formData.active !== false
      };
      this.http.post<Users>(`${this.apiUrl}users/addUser`, userData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
            alert('User created successfully!');
          },
          error: (err) => {
            console.error('Failed to create user:', err);
            alert('Failed to create user. ' + (err.error?.message || 'Please try again.'));
          }
        });
    } else if (this.modalMode === 'edit' && this.selectedUser) {
      // Update existing user using /users/updateUser endpoint
      const updateData = {
        id: this.selectedUser.id,
        username: this.formData.username,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        email: this.formData.email,
        phoneNumber: this.formData.phoneNumber,
        role: this.formData.role,
        bio: this.formData.bio,
        city: this.formData.city,
        country: this.formData.country,
        postalCode: this.formData.postalCode
      };
      this.http.put<Users>(`${this.apiUrl}users/updateUser`, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
            alert('User updated successfully!');
          },
          error: (err) => {
            console.error('Failed to update user:', err);
            alert('Failed to update user. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  deleteUser(user: Users): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?\n\nThis action cannot be undone.`)) {
      this.http.delete(`${this.apiUrl}users/deleteUser/${user.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
            alert('User deleted successfully!');
          },
          error: (err) => {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  // Export users to CSV
  exportUsers(): void {
    this.csvService.exportUsers().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'users_export.csv');
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  getRoleClass(role: string): string {
    const classes: Record<string, string> = {
      'ADMIN': 'role-admin',
      'CLIENT': 'role-client',
      'SELLER': 'role-seller',
      'SUPPLIER': 'role-supplier',
      'ANALYST': 'role-analyst'
    };
    return classes[role] || 'role-client';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
