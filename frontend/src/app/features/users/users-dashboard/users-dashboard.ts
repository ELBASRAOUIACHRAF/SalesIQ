import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { PurchaseFrequencyComponent } from '../components/purchase-frequency/purchase-frequency.component';

// Customer Analytics Components
import { RfmAnalysisComponent } from '../../analytics/components/rfm-analysis/rfm-analysis';
import { ChurnAnalysisComponent } from '../../analytics/components/churn-analysis/churn-analysis';
import { ChurnPredictionComponent } from '../../analytics/components/churn-prediction/churn-prediction';
import { ExecutiveDashboardComponent } from '../../analytics/components/executive-dashboard/executive-dashboard';

// Services
import { CsvService } from '../../../core/services/csv.service';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    TopBarComponent, 
    PurchaseFrequencyComponent,
    // Customer Analytics
    RfmAnalysisComponent,
    ChurnAnalysisComponent,
    ChurnPredictionComponent,
    ExecutiveDashboardComponent
  ],
  template: `
    <div class="dashboard-layout">
      <div class="dashboard-content">
        <div class="dashboard-header">
          <app-top-bar
            [title]="'Users & Customers'"
            [tabs]="['Overview','Segmentation','Retention']"
            [activeTab]="activeTab"
            [dateText]="'Customer Analytics'"
            [buttonLabel]="''"
            [showSettings]="false"
            [showProfileBar]="false"
            (tabChange)="onTabChange($event)"
          ></app-top-bar>
          
          <!-- Import/Export Actions -->
          <div class="action-bar">
            <button class="action-btn import-btn" (click)="triggerImport()">
              <span class="icon">📥</span> Import Users
            </button>
            <button class="action-btn export-btn" (click)="onExportUsers()">
              <span class="icon">📤</span> Export Users
            </button>
            <input 
              #fileInput 
              type="file" 
              accept=".csv" 
              style="display: none;" 
              (change)="onFileSelected($event)"
            />
          </div>
          
          <!-- Import Status Message -->
          <div *ngIf="importMessage" class="import-message" [class.success]="importSuccess" [class.error]="!importSuccess">
            {{ importMessage }}
          </div>
        </div>

        <!-- OVERVIEW TAB -->
        <ng-container *ngIf="activeTab === 'Overview'">
          <!-- Executive Overview -->
          <section class="analytics-section">
            <h2 class="section-title">📊 Executive Overview</h2>
            <app-executive-dashboard></app-executive-dashboard>
          </section>

          <!-- Purchase Frequency -->
          <section class="analytics-section">
            <h2 class="section-title">🛒 Purchase Frequency</h2>
            <app-purchase-frequency
              [highFreqThreshold]="5"
              [lowFreqThreshold]="1"
            ></app-purchase-frequency>
          </section>
        </ng-container>

        <!-- SEGMENTATION TAB -->
        <ng-container *ngIf="activeTab === 'Segmentation'">
          <!-- Customer Segmentation -->
          <section class="analytics-section">
            <h2 class="section-title">👥 Customer Segmentation (RFM Analysis)</h2>
            <p class="section-description">Segment customers by Recency, Frequency, and Monetary value</p>
            <div class="analytics-grid">
              <app-rfm-analysis></app-rfm-analysis>
            </div>
          </section>
        </ng-container>

        <!-- RETENTION TAB -->
        <ng-container *ngIf="activeTab === 'Retention'">
          <!-- Retention Analytics -->
          <section class="analytics-section">
            <h2 class="section-title">📉 Retention & Churn Analysis</h2>
            <p class="section-description">Monitor customer retention rates and predict churn risk</p>
            <div class="analytics-grid two-cols">
              <app-churn-analysis></app-churn-analysis>
              <app-churn-prediction></app-churn-prediction>
            </div>
          </section>
        </ng-container>

      </div>
    </div>
  `,
  styleUrls: ['./users-dashboard.css']
})
export class UsersDashboard {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  activeTab = 'Overview';
  importMessage = '';
  importSuccess = false;
  isExporting = false;
  isImporting = false;

  constructor(private csvService: CsvService) {}

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }

  onExportUsers(): void {
    if (this.isExporting) return;
    
    this.isExporting = true;
    this.importMessage = '';

    this.csvService.exportUsers().subscribe({
      next: (blob) => {
        this.csvService.downloadBlob(blob, 'users.csv');
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Export error:', err);
        this.importMessage = 'Failed to export users. Is the backend running?';
        this.importSuccess = false;
        this.isExporting = false;
        setTimeout(() => this.importMessage = '', 5000);
      }
    });
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      this.importMessage = 'Please select a CSV file';
      this.importSuccess = false;
      setTimeout(() => this.importMessage = '', 3000);
      return;
    }

    this.isImporting = true;
    this.importMessage = 'Importing users...';
    this.importSuccess = true;

    this.csvService.importUsers(file).subscribe({
      next: (response) => {
        this.importMessage = response.message || `Successfully imported ${response.count} users`;
        this.importSuccess = response.success;
        this.isImporting = false;
        // Reset the input so same file can be selected again
        input.value = '';
        setTimeout(() => this.importMessage = '', 5000);
      },
      error: (err) => {
        console.error('Import error:', err);
        this.importMessage = 'Failed to import users. Check file format.';
        this.importSuccess = false;
        this.isImporting = false;
        input.value = '';
        setTimeout(() => this.importMessage = '', 5000);
      }
    });
  }
}
