import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';
import { AdminDashboard } from './dashboard/admin-dashboard';
import { UsersManagement } from './users-management/users-management';
import { ProductsManagement } from './products-management/products-management';
import { CategoriesManagement } from './categories-management/categories-management';
import { ReviewsManagement } from './reviews-management/reviews-management';
import { SalesManagement } from './sales-management/sales-management';
import { DataManagement } from './data-management/data-management';
import { SystemSettings } from './system-settings/system-settings';
import { ReportsManagement } from './reports-management/reports-management';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminLayout,
    AdminDashboard,
    UsersManagement,
    ProductsManagement,
    CategoriesManagement,
    ReviewsManagement,
    SalesManagement,
    DataManagement,
    SystemSettings,
    ReportsManagement,
    RouterModule.forChild([
      {
        path: '',
        component: AdminLayout,
        children: [
          { path: '', component: AdminDashboard },
          { path: 'users', component: UsersManagement },
          { path: 'products', component: ProductsManagement },
          { path: 'categories', component: CategoriesManagement },
          { path: 'reviews', component: ReviewsManagement },
          { path: 'sales', component: SalesManagement },
          { path: 'data', component: DataManagement },
          { path: 'reports', component: ReportsManagement },
          { path: 'settings', component: SystemSettings }
        ]
      }
    ])
  ]
})
export class AdminModule { }
