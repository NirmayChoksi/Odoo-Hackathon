import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/overview/overview.component').then(
            (m) => m.OverviewComponent
          ),
      },
      {
        path: 'move-history',
        loadComponent: () =>
          import('./pages/move-history/move-history.component').then(
            (m) => m.MoveHistoryComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./pages/stock/stock.component').then(
            (m) => m.StockComponent
          ),
      },
    ],
  },
];
