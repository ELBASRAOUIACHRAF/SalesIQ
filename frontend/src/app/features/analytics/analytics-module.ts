import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsDashboard } from './dashboard/analytics-dashboard/analytics-dashboard';
import { AnalyticsLayout } from './layout/analytics-layout';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card';
import { ProductsDashboard } from '../products/products-dashboard/products-dashboard';
import { CategoriesDashboard } from '../categories/categories-dashboard/categories-dashboard';
import { ReviewsDashboard } from '../reviews/reviews-dashboard/reviews-dashboard';
import { SalesDashboard } from '../sales/sales-dashboard/sales-dashboard';
import { UsersDashboard } from '../users/users-dashboard/users-dashboard';
import { ProfileDashboard } from './dashboard/profile-dashboard/profile-dashboard';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    KpiCardComponent,
    AnalyticsDashboard,
    AnalyticsLayout,
    RouterModule.forChild([
      {
        path: '',
        component: AnalyticsLayout,
        children: [
          { path: '', component: AnalyticsDashboard },
          { path: 'products', component: ProductsDashboard },
          { path: 'categories', component: CategoriesDashboard },
          { path: 'reviews', component: ReviewsDashboard },
          { path: 'sales', component: SalesDashboard },
          { path: 'users', component: UsersDashboard },
          { path: 'profile', component: ProfileDashboard }
        ]
      }
    ])
  ]
})
export class AnalyticsModule { }
