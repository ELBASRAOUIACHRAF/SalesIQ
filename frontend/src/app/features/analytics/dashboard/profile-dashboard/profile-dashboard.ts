import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../../components/top-bar/top-bar';
import { Account } from '../../../../shared/components/account/account';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    Account
  ],
  templateUrl: './profile-dashboard.html',
  styleUrls: ['./profile-dashboard.css'],
})
export class ProfileDashboard {
}

