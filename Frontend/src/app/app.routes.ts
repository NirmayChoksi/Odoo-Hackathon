import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'auth/login' },
];
