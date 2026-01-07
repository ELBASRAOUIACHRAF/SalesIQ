import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { CsvService } from '../../../core/services/csv.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-management.html',
  styleUrls: ['./categories-management.css']
})
export class CategoriesManagement implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:8080/';

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = true;
  searchTerm = '';

  // Modal state
  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedCategory: Category | null = null;

  // Form data
  formData: Partial<Category> = {};

  constructor(
    private categoryService: CategoryService,
    private csvService: CsvService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.applyFilters();
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.loading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.categories];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }

    this.filteredCategories = filtered;
  }

  // Modal operations
  openAddModal(): void {
    this.modalMode = 'add';
    this.formData = {};
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.modalMode = 'edit';
    this.selectedCategory = category;
    this.formData = { ...category };
    this.showModal = true;
  }

  openViewModal(category: Category): void {
    this.modalMode = 'view';
    this.selectedCategory = category;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCategory = null;
    this.formData = {};
  }

  saveCategory(): void {
    if (this.modalMode === 'add') {
      // Use /addCategory endpoint
      this.http.post<Category>(`${this.apiUrl}addCategory`, this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
            alert('Category created successfully!');
          },
          error: (err) => {
            console.error('Failed to create category:', err);
            alert('Failed to create category. ' + (err.error?.message || 'Please try again.'));
          }
        });
    } else if (this.modalMode === 'edit' && this.selectedCategory) {
      // Use /updateCategory/{categoryId} endpoint
      this.http.put<Category>(`${this.apiUrl}updateCategory/${this.selectedCategory.id}`, this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
            alert('Category updated successfully!');
          },
          error: (err) => {
            console.error('Failed to update category:', err);
            alert('Failed to update category. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  deleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete "${category.name}"?\n\nNote: This action cannot be undone.`)) {
      // Use /deleteCat/{categoryId} endpoint
      this.http.delete(`${this.apiUrl}deleteCat/${category.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCategories();
            alert('Category deleted successfully!');
          },
          error: (err) => {
            console.error('Failed to delete category:', err);
            alert('Failed to delete category. ' + (err.error?.message || 'Please try again.'));
          }
        });
    }
  }

  exportCategories(): void {
    this.csvService.exportCategories().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'categories_export.csv');
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  getCategoryIcon(name: string): string {
    const icons: Record<string, string> = {
      'electronics': '🔌',
      'clothing': '👕',
      'food': '🍔',
      'books': '📚',
      'sports': '⚽',
      'home': '🏠',
      'beauty': '💄',
      'toys': '🧸',
      'automotive': '🚗',
      'health': '💊'
    };
    const key = name?.toLowerCase() || '';
    for (const [keyword, icon] of Object.entries(icons)) {
      if (key.includes(keyword)) return icon;
    }
    return '📦';
  }
}
