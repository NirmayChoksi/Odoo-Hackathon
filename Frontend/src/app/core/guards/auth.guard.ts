import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Directly check localStorage to avoid any signal synchronization issues during initial load
  const token = localStorage.getItem('sf_token');
  const isAuth = !!token;
  
  if (isAuth) {
    return true;
  }

  // Use parseUrl with an absolute path to ensure clean redirection to the login module
  return router.parseUrl('/auth/login');
};
