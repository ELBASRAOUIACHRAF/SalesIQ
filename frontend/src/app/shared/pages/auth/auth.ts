import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
  errorMessage: string = '';

  constructor(private fb: FormBuilder,
             private router: Router,
             private authService: AuthService
            ) {}

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


  onLogin(): void {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';

    if (this.loginForm.valid) {
      
      // 2. Appel du service
      this.authService.login(this.loginForm.value).subscribe({
        
        // Cas de succès (Code 200 OK)
        next: (response) => {
          console.log('Login réussi !', response);
          // La redirection suffit. Le token est déjà stocké par le service (via le tap).
          this.router.navigate(['/']); 
        },
        
        // Cas d'erreur (Code 401, 403, 500...)
        error: (err) => {
          console.error('Erreur de login', err);
          if (err.status === 401) {
            this.errorMessage = "Email ou mot de passe incorrect.";
          } else {
            this.errorMessage = "Une erreur technique est survenue.";
          }
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      
      this.authService.signUp(registerData).subscribe({
        next: (response) => {
          console.log('Inscription réussie !', response);
                    
          // this.router.navigate(['/auth']); 
          this.toggleForm();
        },
        error: (err) => {
          console.error('Erreur lors de l\'inscription :', err);
          // ex: this.errorMessage = "Cet email est déjà utilisé.";
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
