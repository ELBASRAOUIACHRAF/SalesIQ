import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../components/top-bar/top-bar';
import { Account } from '../../../../shared/components/account/account';
import { SideMenu } from '../../components/side-menu/side-menu';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TopBarComponent,
    Account,
    SideMenu
  ],
  templateUrl: './profile-dashboard.html',
  styleUrls: ['./profile-dashboard.css'],
})
export class ProfileDashboard {
}

