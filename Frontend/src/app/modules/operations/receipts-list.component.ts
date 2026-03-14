import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReceiptService, Receipt } from './services/receipt.service';
import { ContactsService } from '../../core/services/contacts.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receipts-list.component.html',
})
export class ReceiptsListComponent implements OnInit {
  private receiptService = inject(ReceiptService);
  private contactsService = inject(ContactsService);
  private settingsService = inject(SettingsService);

  receipts = signal<Receipt[]>([]);
  loading = signal(true);
  error = signal('');
  searchQuery = signal('');
  viewMode = signal<'list' | 'kanban'>('list');

  ngOnInit(): void {
    forkJoin({
      receipts: this.receiptService.list(),
      suppliers: this.contactsService.getSuppliers(),
      warehouses: this.settingsService.getWarehouses(),
    }).subscribe({
      next: ({ receipts, suppliers, warehouses }) => {
        const supp: any[] = suppliers?.data ?? [];
        const ware: any[] = warehouses?.data ?? [];
        const raw: any[] = receipts?.data ?? [];
        this.receipts.set(raw.map((r) => this.receiptService.mapToFrontend(r, supp, ware)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load receipts.');
        this.loading.set(false);
      },
    });
  }

  get filteredReceipts(): Receipt[] {
    const q = this.searchQuery().toLowerCase();
    const all = this.receipts();
    if (!q) return all;
    return all.filter(
      (r) =>
        r.reference.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q),
    );
  }

  get kanbanColumns() {
    const all = this.filteredReceipts;
    return {
      draft: all.filter((r) => r.status === 'Draft' || r.status === 'Waiting'),
      ready: all.filter((r) => r.status === 'Ready'),
      done: all.filter((r) => r.status === 'Done' || r.status === 'Cancelled'),
    };
  }

  updateSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setViewMode(mode: 'list' | 'kanban') {
    this.viewMode.set(mode);
  }
}
