import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { PurchaseFrequencyComponent, PurchaseFrequencyAnalysisDto } from '../components/purchase-frequency/purchase-frequency.component';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  imports: [CommonModule, TopBarComponent, PurchaseFrequencyComponent],
  template: `
    <div class="dashboard-layout">
      <div class="dashboard-content">
        <div class="dashboard-header">
          <app-top-bar
            [title]="'Users'"
            [tabs]="['Today','This Week','This Month']"
            [activeTab]="'Today'"
            [dateText]="'05 Feb 2024, Monday'"
            [buttonLabel]="'EXPORT USERS'"
            [showSettings]="false"
            [showProfileBar]="false"
          ></app-top-bar>
        </div>

        <app-purchase-frequency
          [data]="purchaseFrequency"
          [highFreqThreshold]="5"
          [lowFreqThreshold]="1"
        ></app-purchase-frequency>
      </div>
    </div>
  `,
  styleUrls: ['./users-dashboard.css']
})
export class UsersDashboard {
  purchaseFrequency: PurchaseFrequencyAnalysisDto[] = [
    { userId: 1, username: 'Alice', totalSales: 240, averageSalesPerMonth: 20 },
    { userId: 2, username: 'Brian', totalSales: 72, averageSalesPerMonth: 6 },
    { userId: 3, username: 'Carla', totalSales: 30, averageSalesPerMonth: 2.5 },
    { userId: 4, username: 'Daniel', totalSales: 12, averageSalesPerMonth: 1 },
    { userId: 5, username: 'Ella', totalSales: 6, averageSalesPerMonth: 0.5 }
  ];
}
