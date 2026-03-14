import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceiptService } from './services/receipt.service';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receipts-list.component.html',
})
export class ReceiptsListComponent {
  receiptService = inject(ReceiptService);
  searchQuery = signal('');
  viewMode = signal<'list' | 'kanban'>('list');

  get filteredReceipts() {
    const q = this.searchQuery().toLowerCase();
    const all = this.receiptService.receipts();
    if (!q) return all;
    return all.filter(r => 
      r.reference.toLowerCase().includes(q) || 
      r.contact.toLowerCase().includes(q)
    );
  }

  get kanbanColumns() {
    const all = this.filteredReceipts;
    return {
      draft: all.filter(r => r.status === 'Draft'),
      ready: all.filter(r => r.status === 'Ready'),
      done: all.filter(r => r.status === 'Done')
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
