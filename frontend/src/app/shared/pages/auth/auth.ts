import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule],
  templateUrl: './auth.html',
  styleUrls: [ './auth.css']
})
export class Auth {
  isSignUpActive: boolean = false;
  
  // Déclaration des deux formulaires
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

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
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+ ]*$')]], // Validation simple pour tél
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Basculer l'animation du slider
  toggleForm(): void {
    this.isSignUpActive = !this.isSignUpActive;
  }

  // Action quand on clique sur "Sign In"
  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
      // Ici: appeler ton AuthService.login(this.loginForm.value)
    } else {
      this.loginForm.markAllAsTouched(); // Affiche les erreurs si le form est invalide
    }
  }

  // Action quand on clique sur "Sign Up"
  onRegister(): void {
    if (this.registerForm.valid) {
      console.log('Register Data:', this.registerForm.value);
      // Ici: appeler ton AuthService.register(this.registerForm.value)
      
      // L'objet envoyé ressemblera à :
      // { firstName: '...', lastName: '...', phoneNumber: '...', email: '...', password: '...' }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
