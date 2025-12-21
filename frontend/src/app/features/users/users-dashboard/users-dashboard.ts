import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../analytics/components/top-bar/top-bar';
import { PurchaseFrequencyComponent } from '../components/purchase-frequency/purchase-frequency.component';

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

        <!-- Component now self-loads data from backend -->
        <app-purchase-frequency
          [highFreqThreshold]="5"
          [lowFreqThreshold]="1"
        ></app-purchase-frequency>
      </div>
    </div>
  `,
  styleUrls: ['./users-dashboard.css']
})
export class UsersDashboard {
  // Component now fetches data directly from backend
}
