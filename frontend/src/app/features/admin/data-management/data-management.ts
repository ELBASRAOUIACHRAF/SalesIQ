import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvService } from '../../../core/services/csv.service';

interface DataEntity {
  name: string;
  icon: string;
  description: string;
  exportFn: () => void;
  importFn: (file: File) => void;
  color: string;
}

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-management.html',
  styleUrls: ['./data-management.css']
})
export class DataManagement implements OnInit {
  entities: DataEntity[] = [];
  selectedEntity: DataEntity | null = null;
  showImportModal = false;
  selectedFile: File | null = null;
  importing = false;
  exportingEntity: string | null = null;

  constructor(
    private csvService: CsvService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initializeEntities();
  }

  initializeEntities(): void {
    this.entities = [
      {
        name: 'Users',
        icon: '👥',
        description: 'User accounts with profiles, roles and preferences',
        exportFn: () => this.exportUsers(),
        importFn: (file) => this.importUsers(file),
        color: '#6366f1'
      },
      {
        name: 'Products',
        icon: '📦',
        description: 'Product catalog with prices, stock and descriptions',
        exportFn: () => this.exportProducts(),
        importFn: (file) => this.importProducts(file),
        color: '#8b5cf6'
      },
      {
        name: 'Categories',
        icon: '📁',
        description: 'Product categories and organization structure',
        exportFn: () => this.exportCategories(),
        importFn: (file) => this.importCategories(file),
        color: '#ec4899'
      },
      {
        name: 'Sales',
        icon: '💰',
        description: 'Sales transactions and order history',
        exportFn: () => this.exportSales(),
        importFn: (file) => this.importSales(file),
        color: '#10b981'
      },
      {
        name: 'Reviews',
        icon: '⭐',
        description: 'Product reviews and customer feedback',
        exportFn: () => this.exportReviews(),
        importFn: (file) => this.importReviews(file),
        color: '#f59e0b'
      },
      {
        name: 'Sold Products',
        icon: '🛒',
        description: 'Individual items sold in each transaction',
        exportFn: () => this.exportSoldProducts(),
        importFn: (file) => this.importSoldProducts(file),
        color: '#ef4444'
      },
      {
        name: 'Baskets',
        icon: '🧺',
        description: 'Shopping baskets and cart items',
        exportFn: () => this.exportBaskets(),
        importFn: (file) => this.importBaskets(file),
        color: '#14b8a6'
      },
      {
        name: 'Search History',
        icon: '🔍',
        description: 'User search queries and history',
        exportFn: () => this.exportSearchHistory(),
        importFn: (file) => this.importSearchHistory(file),
        color: '#64748b'
      }
    ];
  }

  private stopExporting(): void {
    this.ngZone.run(() => {
      this.exportingEntity = null;
      this.cdr.detectChanges();
    });
  }

  // Export Functions
  exportUsers(): void {
    this.exportingEntity = 'Users';
    this.csvService.exportUsers().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'users.csv');
        console.log('Users exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export users:', err);
        this.stopExporting();
      }
    });
  }

  exportProducts(): void {
    this.exportingEntity = 'Products';
    this.csvService.exportProducts().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'products.csv');
        console.log('Products exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export products:', err);
        this.stopExporting();
      }
    });
  }

  exportCategories(): void {
    this.exportingEntity = 'Categories';
    this.csvService.exportCategories().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'categories.csv');
        console.log('Categories exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export categories:', err);
        this.stopExporting();
      }
    });
  }

  exportSales(): void {
    this.exportingEntity = 'Sales';
    this.csvService.exportSales().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'sales.csv');
        console.log('Sales exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export sales:', err);
        this.stopExporting();
      }
    });
  }

  exportReviews(): void {
    this.exportingEntity = 'Reviews';
    this.csvService.exportReviews().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'reviews.csv');
        console.log('Reviews exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export reviews:', err);
        this.stopExporting();
      }
    });
  }

  exportSoldProducts(): void {
    this.exportingEntity = 'Sold Products';
    this.csvService.exportSoldProducts().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'sold_products.csv');
        console.log('Sold products exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export sold products:', err);
        this.stopExporting();
      }
    });
  }

  exportBaskets(): void {
    this.exportingEntity = 'Baskets';
    this.csvService.exportBaskets().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'baskets.csv');
        console.log('Baskets exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export baskets:', err);
        this.stopExporting();
      }
    });
  }

  exportSearchHistory(): void {
    this.exportingEntity = 'Search History';
    this.csvService.exportSearchHistory().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'search_history.csv');
        console.log('Search history exported successfully');
        this.stopExporting();
      },
      error: (err) => {
        console.error('Failed to export search history:', err);
        this.stopExporting();
      }
    });
  }

  // Import Functions
  openImportModal(entity: DataEntity): void {
    this.selectedEntity = entity;
    this.selectedFile = null;
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.selectedEntity = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  importData(): void {
    if (!this.selectedFile || !this.selectedEntity) return;
    
    this.importing = true;
    this.selectedEntity.importFn(this.selectedFile);
  }

  importUsers(file: File): void {
    this.csvService.importUsers(file).subscribe({
      next: () => {
        console.log('Users imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import users:', err);
        this.importing = false;
      }
    });
  }

  importProducts(file: File): void {
    this.csvService.importProducts(file).subscribe({
      next: () => {
        console.log('Products imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import products:', err);
        this.importing = false;
      }
    });
  }

  importCategories(file: File): void {
    this.csvService.importCategories(file).subscribe({
      next: () => {
        console.log('Categories imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import categories:', err);
        this.importing = false;
      }
    });
  }

  importSales(file: File): void {
    this.csvService.importSales(file).subscribe({
      next: () => {
        console.log('Sales imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import sales:', err);
        this.importing = false;
      }
    });
  }

  importReviews(file: File): void {
    this.csvService.importReviews(file).subscribe({
      next: () => {
        console.log('Reviews imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import reviews:', err);
        this.importing = false;
      }
    });
  }

  importSoldProducts(file: File): void {
    this.csvService.importSoldProducts(file).subscribe({
      next: () => {
        console.log('Sold products imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import sold products:', err);
        this.importing = false;
      }
    });
  }

  importBaskets(file: File): void {
    this.csvService.importBaskets(file).subscribe({
      next: () => {
        console.log('Baskets imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import baskets:', err);
        this.importing = false;
      }
    });
  }

  importSearchHistory(file: File): void {
    this.csvService.importSearchHistory(file).subscribe({
      next: () => {
        console.log('Search history imported successfully');
        this.importing = false;
        this.closeImportModal();
      },
      error: (err) => {
        console.error('Failed to import search history:', err);
        this.importing = false;
      }
    });
  }

  exportAll(): void {
    this.entities.forEach(entity => entity.exportFn());
  }
}
