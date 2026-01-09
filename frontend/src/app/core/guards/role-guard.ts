import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // <--- TRES IMPORTANT
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; 
  }


  // Vérifier si connecté
  if (!authService.isLoggedIn()) {
    console.warn('RoleGuard: Non connecté -> Redirection Auth');
    router.navigate(['/auth']);
    return false;
  }

  const userRole = authService.getUserRole(); 

  const allowedRoles = route.data['roles'] as string[]; 
  const singleRole = route.data['role'] as string;

  let isAuthorized = false;

  if (allowedRoles) {
    isAuthorized = userRole ? allowedRoles.includes(userRole) : false;
  } else if (singleRole) {
    isAuthorized = userRole === singleRole;
  } else {
    isAuthorized = true; 
  }

  if (isAuthorized) {
    return true;
  } else {
    router.navigate(['/error']);
    return false;
  }
};