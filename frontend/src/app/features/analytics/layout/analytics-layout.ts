import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideMenu } from '../components/side-menu/side-menu';

@Component({
  selector: 'app-analytics-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SideMenu],
  template: `
    <div class="analytics-shell">
      <app-side-menu class="analytics-nav"></app-side-menu>
      <div class="analytics-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .analytics-shell {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
      position: relative;
    }

    .analytics-nav {
      flex-shrink: 0;
      z-index: 50;
    }

    .analytics-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 1024px) {
      .analytics-shell {
        display: block;
      }

      .analytics-main {
        padding-top: 0;
      }
    }
  `]
})
export class AnalyticsLayout {}
