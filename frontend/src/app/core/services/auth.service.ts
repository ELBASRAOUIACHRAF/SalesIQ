import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { RegisterModel } from '../models/register.model';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private apiUrl = 'http://localhost:8080/auth'; 
  
  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
     * Envoie la requête de connexion au backend.
     * Si succès, le token est automatiquement sauvegardé via .pipe(tap(...))
     */
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap(response => {
        
        this.saveToken(response.token);
      })
    );
  }

  /**
   * Sauvegarde le token dans le stockage local du navigateur
   */
  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Récupère le token (utile pour l'Interceptor)
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null; // Sur le serveur, on n'a pas de token, c'est normal
  }


  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token; // Retourne true si le token existe, false sinon
  }


  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
  }


  signUp(registrationInfo: RegisterModel): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, registrationInfo);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.role; // On lit la clé "role" définie dans ton Spring Boot
    } catch (error) {
      console.error('Erreur de décodage du token', error);
      return null;
    }
  }

  hasRole(expectedRole: string): boolean {
    const userRole = this.getUserRole();
    return userRole === expectedRole;
  }

}
