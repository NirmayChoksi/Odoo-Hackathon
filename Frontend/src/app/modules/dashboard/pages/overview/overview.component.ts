import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KpiCard {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string; // SVG path data
  iconBg: string;
  iconColor: string;
  badge?: { label: string; color: string };
  trend?: { value: string; positive: boolean };
  detail?: { label: string; value: number; color: string }[];
  action: string;
  actionRoute: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  kpis: KpiCard[] = [
    {
      title: 'Total Products in Stock',
      value: 1_248,
      subtitle: 'Distinct SKUs across all warehouses',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      trend: { value: '+3.2% this week', positive: true },
      action: 'View Stock',
      actionRoute: '/stock',
    },
    {
      title: 'Low Stock / Out of Stock',
      value: 34,
      subtitle: 'Items requiring reorder attention',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      iconBg: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      detail: [
        { label: 'Low Stock', value: 27, color: 'text-amber-500' },
        { label: 'Out of Stock', value: 7, color: 'text-rose-500' },
      ],
      action: 'View Alerts',
      actionRoute: '/stock/alerts',
    },
    {
      title: 'Pending Receipts',
      value: 12,
      subtitle: 'Incoming shipments awaiting receipt',
      icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20',
      iconBg: 'bg-sky-50 dark:bg-sky-900/20',
      iconColor: 'text-sky-600 dark:text-sky-400',
      detail: [
        { label: 'Late', value: 3, color: 'text-rose-500' },
        { label: 'On Schedule', value: 9, color: 'text-emerald-500' },
      ],
      action: 'View Receipts',
      actionRoute: '/operations/receipt',
    },
    {
      title: 'Pending Deliveries',
      value: 8,
      subtitle: 'Outgoing orders ready to dispatch',
      icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
      iconBg: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      detail: [
        { label: 'Late', value: 1, color: 'text-rose-500' },
        { label: 'Waiting', value: 2, color: 'text-amber-500' },
        { label: 'Ready', value: 5, color: 'text-emerald-500' },
      ],
      action: 'View Deliveries',
      actionRoute: '/operations/delivery',
    },
    {
      title: 'Internal Transfers',
      value: 5,
      subtitle: 'Scheduled inter-warehouse movements',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      iconBg: 'bg-teal-50 dark:bg-teal-900/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: { value: '3 today', positive: true },
      action: 'View Transfers',
      actionRoute: '/operations/adjustment',
    },
  ];
}
