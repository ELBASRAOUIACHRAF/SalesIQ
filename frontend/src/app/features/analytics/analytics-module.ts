import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsDashboard } from './dashboard/analytics-dashboard/analytics-dashboard';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    KpiCardComponent,
    AnalyticsDashboard,
    RouterModule.forChild([
      { path: '', component: AnalyticsDashboard }
    ])
  ]
})
export class AnalyticsModule { }
