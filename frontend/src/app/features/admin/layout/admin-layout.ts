import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  template: `
    <div class="admin-shell">
      <app-admin-sidebar class="admin-nav"></app-admin-sidebar>
      <div class="admin-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: #0f172a;
      position: relative;
    }

    .admin-nav {
      flex-shrink: 0;
      z-index: 50;
    }

    .admin-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 1024px) {
      .admin-shell {
        display: block;
      }

      .admin-main {
        padding-top: 0;
      }
    }
  `]
})
export class AdminLayout {}
