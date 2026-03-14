import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './modules/auth/auth.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    children: AUTH_ROUTES
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadChildren: () => 
      import('./modules/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES) 
  },
  { 
    path: 'operations', 
    canActivate: [authGuard],
    loadChildren: () => 
      import('./modules/operations/operations.routes').then((m) => m.OPERATIONS_ROUTES) 
  },
  { path: '**', redirectTo: 'dashboard' },
];
