import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './auth.html',
  styleUrls: [ './auth.css']
})
export class Auth {
  isSignUpActive: boolean = false;
  
  // Déclaration des deux formulaires
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

    // --- Getters pour le Formulaire d'Inscription (Sign Up) ---
  get fName() { return this.registerForm.get('firstName'); }
  get lName() { return this.registerForm.get('lastName'); }
  get rPhone() { return this.registerForm.get('phoneNumber'); }
  get rEmail() { return this.registerForm.get('email'); }
  get rPassword() { return this.registerForm.get('password'); }

  // --- Getters pour le Formulaire de Connexion (Login) ---
  get lEmail() { return this.loginForm.get('email'); }
  get lPassword() { return this.loginForm.get('password'); }

  ngOnInit(): void {
    this.initForms();
  }

  // Initialisation des formulaires avec validations
  initForms(): void {
    // Formulaire de Connexion
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Formulaire d'Inscription (avec tes nouveaux champs)
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+ ]*$')]], 
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  
  toggleForm(): void {
    this.isSignUpActive = !this.isSignUpActive;
  }

  // Action quand on clique sur "Sign In"
  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
      // Ici: appeler ton AuthService.login(this.loginForm.value)
      this.router.navigate(['/']).then(() => {
        window.location.reload();
      });
    } else {
      this.loginForm.markAllAsTouched(); // Affiche les erreurs si le form est invalide
    }
  }

  // Action quand on clique sur "Sign Up"
  onRegister(): void {
    if (this.registerForm.valid) {
      console.log('Register Data:', this.registerForm.value);
      // Ici: appeler ton AuthService.register(this.registerForm.value)
      this.router.navigate(['/']).then(() => {
        window.location.reload();
      });
      // L'objet envoyé ressemblera à :
      // { firstName: '...', lastName: '...', phoneNumber: '...', email: '...', password: '...' }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
