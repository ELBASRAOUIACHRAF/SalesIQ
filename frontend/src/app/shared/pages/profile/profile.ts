import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Account } from '../../components/account/account';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-profile',
  imports: [Navbar,Account, Footer ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

}
