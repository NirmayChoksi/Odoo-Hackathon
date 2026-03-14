import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from './services/delivery.service';

@Component({
  selector: 'app-deliveries-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './deliveries-list.component.html',
})
export class DeliveriesListComponent {
  deliveryService = inject(DeliveryService);
  searchQuery = signal('');
  viewMode = signal<'list' | 'kanban'>('list');

  get filteredDeliveries() {
    const q = this.searchQuery().toLowerCase();
    const all = this.deliveryService.deliveries();
    if (!q) return all;
    return all.filter(d =>
      d.reference.toLowerCase().includes(q) ||
      d.contact.toLowerCase().includes(q)
    );
  }

  get kanbanColumns() {
    const all = this.filteredDeliveries;
    return {
      draft: all.filter(d => d.status === 'Draft'),
      waiting: all.filter(d => d.status === 'Waiting'),
      ready: all.filter(d => d.status === 'Ready'),
      done: all.filter(d => d.status === 'Done')
    };
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setViewMode(mode: 'list' | 'kanban') {
    this.viewMode.set(mode);
  }
}
