import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.html',
  styleUrls: [ './auth.css']
})
export class Auth {
  isSignUpActive = false;

  toggleForm() {
    this.isSignUpActive = !this.isSignUpActive;
  }
}
