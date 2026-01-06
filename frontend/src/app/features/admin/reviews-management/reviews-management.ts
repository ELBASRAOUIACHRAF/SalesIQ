import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, map } from 'rxjs';
import { CsvService } from '../../../core/services/csv.service';
import { HttpClient } from '@angular/common/http';
import { SystemSettingsService } from '../../../core/services/system-settings.service';

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewDate: string;
  productId?: number;
  productName?: string;
  userId?: number;
  userEmail?: string;
}

@Component({
  selector: 'app-reviews-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews-management.html',
  styleUrls: ['./reviews-management.css']
})
export class ReviewsManagement implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8080/';

  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  loading = true;
  searchTerm = '';
  selectedRating = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Modal state
  showModal = false;
  modalMode: 'view' | 'edit' = 'view';
  selectedReview: Review | null = null;

  // Form data
  formData: Partial<Review> = {};

  // Stats
  averageRating = 0;
  totalReviews = 0;
  ratingDistribution: { rating: number; count: number; percentage: number }[] = [];

  constructor(
    private csvService: CsvService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private settingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.syncItemsPerPage();
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.loading = true;
    // Use CSV export since there's no getAll endpoint
    this.http.get(`${this.apiUrl}api/csv/reviews/export`, { responseType: 'text' })
      .pipe(
        takeUntil(this.destroy$),
        map(csv => this.parseCsvToReviews(csv))
      )
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews || [];
          this.calculateStats();
          this.applyFilters();
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        },
        error: (err) => {
          console.error('Failed to load reviews:', err);
          this.reviews = [];
          this.filteredReviews = [];
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        }
      });
  }

  private parseCsvToReviews(csv: string): Review[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const reviews: Review[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const review: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        switch (header) {
          case 'ID': review.id = parseInt(value) || i; break;
          case 'COMMENT': review.comment = value; break;
          case 'RATING': review.rating = parseFloat(value) || 0; break;
          case 'REVIEW_DATE': review.reviewDate = value; break;
          case 'PRODUCT_NAME': review.productName = value; break;
          case 'USER_EMAIL': review.userEmail = value; break;
        }
      });
      
      if (review.id || review.comment) reviews.push(review as Review);
    }
    
    return reviews;
  }

  calculateStats(): void {
    this.totalReviews = this.reviews.length;
    
    if (this.totalReviews > 0) {
      const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
      this.averageRating = sum / this.totalReviews;
    }

    // Calculate distribution
    const distribution = [5, 4, 3, 2, 1].map(rating => {
      const count = this.reviews.filter(r => Math.round(r.rating) === rating).length;
      return {
        rating,
        count,
        percentage: this.totalReviews > 0 ? (count / this.totalReviews) * 100 : 0
      };
    });
    this.ratingDistribution = distribution;
  }

  applyFilters(): void {
    let filtered = [...this.reviews];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.comment?.toLowerCase().includes(term) ||
        r.productName?.toLowerCase().includes(term) ||
        r.userEmail?.toLowerCase().includes(term)
      );
    }

    // Rating filter
    if (this.selectedRating) {
      const rating = parseInt(this.selectedRating);
      filtered = filtered.filter(r => Math.round(r.rating) === rating);
    }

    this.filteredReviews = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedReviews(): Review[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReviews.slice(start, start + this.itemsPerPage);
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
  openViewModal(review: Review): void {
    this.modalMode = 'view';
    this.selectedReview = review;
    this.showModal = true;
  }

  openEditModal(review: Review): void {
    this.modalMode = 'edit';
    this.selectedReview = review;
    this.formData = { ...review };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReview = null;
    this.formData = {};
  }

  saveReview(): void {
    if (this.selectedReview) {
      // Use /reviews/updatereview/{reviewId} endpoint
      this.http.put<Review>(`${this.apiUrl}reviews/updatereview/${this.selectedReview.id}`, this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadReviews();
            this.closeModal();
            alert('Review updated successfully!');
          },
          error: (err) => {
            console.error('Failed to update review:', err);
            alert('Failed to update review. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  deleteReview(review: Review): void {
    if (confirm('Are you sure you want to delete this review?\n\nNote: This action cannot be undone.')) {
      // Use /reviews/deletereview/{reviewId} endpoint
      this.http.delete(`${this.apiUrl}reviews/deletereview/${review.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadReviews();
            alert('Review deleted successfully!');
          },
          error: (err) => {
            console.error('Failed to delete review:', err);
            alert('Failed to delete review. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  exportReviews(): void {
    this.csvService.exportReviews().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'reviews_export.csv');
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  getRatingClass(rating: number): string {
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-average';
    return 'rating-poor';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
