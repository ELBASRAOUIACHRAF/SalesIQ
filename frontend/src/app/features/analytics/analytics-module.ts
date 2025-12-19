import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { AnalyticsDashboard } from './analytics-dashboard/analytics-dashboard';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: AnalyticsDashboard }
    ])
  ]
})
export class AnalyticsModule { }
