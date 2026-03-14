import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DeliveryService, Delivery } from './services/delivery.service';
import { ContactsService } from '../../core/services/contacts.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-deliveries-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './deliveries-list.component.html',
})
export class DeliveriesListComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private contactsService = inject(ContactsService);
  private settingsService = inject(SettingsService);

  deliveries = signal<Delivery[]>([]);
  loading = signal(true);
  error = signal('');
  searchQuery = signal('');
  viewMode = signal<'list' | 'kanban'>('list');

  ngOnInit(): void {
    forkJoin({
      deliveries: this.deliveryService.list(),
      customers: this.contactsService.getCustomers(),
      warehouses: this.settingsService.getWarehouses(),
    }).subscribe({
      next: ({ deliveries, customers, warehouses }) => {
        const custs: any[] = customers?.data ?? [];
        const ware: any[] = warehouses?.data ?? [];
        const raw: any[] = deliveries?.data ?? [];
        this.deliveries.set(raw.map((d) => this.deliveryService.mapToFrontend(d, custs, ware)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load deliveries.');
        this.loading.set(false);
      },
    });
  }

  get filteredDeliveries(): Delivery[] {
    const q = this.searchQuery().toLowerCase();
    const all = this.deliveries();
    if (!q) return all;
    return all.filter(
      (d) =>
        d.reference.toLowerCase().includes(q) ||
        d.contact.toLowerCase().includes(q),
    );
  }

  get kanbanColumns() {
    const all = this.filteredDeliveries;
    return {
      draft: all.filter((d) => d.status === 'Draft'),
      waiting: all.filter((d) => d.status === 'Waiting'),
      ready: all.filter((d) => d.status === 'Ready'),
      done: all.filter((d) => d.status === 'Done' || d.status === 'Cancelled'),
    };
  }

  updateSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setViewMode(mode: 'list' | 'kanban') {
    this.viewMode.set(mode);
  }
}
