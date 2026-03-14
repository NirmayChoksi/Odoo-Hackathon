import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../dashboard/layout/dashboard-layout.component';

export const OPERATIONS_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'receipt',
        loadComponent: () =>
          import('./receipts-list.component').then(
            (m) => m.ReceiptsListComponent
          ),
      },
      {
        path: 'receipt/:id',
        loadComponent: () =>
          import('./receipt-detail.component').then(
            (m) => m.ReceiptDetailComponent
          ),
      },
      {
        path: 'delivery',
        loadComponent: () =>
          import('./deliveries-list.component').then(
            (m) => m.DeliveriesListComponent
          ),
      },
      {
        path: 'delivery/:id',
        loadComponent: () =>
          import('./delivery-detail.component').then(
            (m) => m.DeliveryDetailComponent
          ),
      },
    ],
  },
];
