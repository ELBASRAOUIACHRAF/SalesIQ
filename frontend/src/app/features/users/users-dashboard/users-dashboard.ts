import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { PurchaseFrequencyComponent } from '../components/purchase-frequency/purchase-frequency.component';

// Customer Analytics Components
import { RfmAnalysisComponent } from '../../analytics/components/rfm-analysis/rfm-analysis';
import { ChurnAnalysisComponent } from '../../analytics/components/churn-analysis/churn-analysis';
import { ChurnPredictionComponent } from '../../analytics/components/churn-prediction/churn-prediction';
import { ExecutiveDashboardComponent } from '../../analytics/components/executive-dashboard/executive-dashboard';

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
            [activeTab]="'Overview'"
            [dateText]="'Customer Analytics'"
            [buttonLabel]="'EXPORT USERS'"
            [showSettings]="false"
            [showProfileBar]="false"
          ></app-top-bar>
        </div>

        <!-- Executive Overview -->
        <section class="analytics-section">
          <h2 class="section-title">📊 Executive Overview</h2>
          <app-executive-dashboard></app-executive-dashboard>
        </section>

        <!-- Customer Segmentation -->
        <section class="analytics-section">
          <h2 class="section-title">👥 Customer Segmentation (RFM)</h2>
          <div class="analytics-grid">
            <app-rfm-analysis></app-rfm-analysis>
          </div>
        </section>

        <!-- Retention Analytics -->
        <section class="analytics-section">
          <h2 class="section-title">📉 Retention & Churn</h2>
          <div class="analytics-grid two-cols">
            <app-churn-analysis></app-churn-analysis>
            <app-churn-prediction></app-churn-prediction>
          </div>
        </section>

        <!-- Purchase Frequency -->
        <section class="analytics-section">
          <h2 class="section-title">🛒 Purchase Frequency</h2>
          <app-purchase-frequency
            [highFreqThreshold]="5"
            [lowFreqThreshold]="1"
          ></app-purchase-frequency>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./users-dashboard.css']
})
export class UsersDashboard {
  // Component now fetches data directly from backend
}
