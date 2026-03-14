import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReceiptService, ReceiptStatus, ProductLine } from './services/receipt.service';

@Component({
  selector: 'app-receipt-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receipt-detail.component.html',
})
export class ReceiptDetailComponent {
  receiptService = inject(ReceiptService);

  receiptId = signal<string>('new');
  reference = signal<string>('WH/IN/0001');
  status = signal<ReceiptStatus>('Draft');
  isNew = signal<boolean>(false);
  
  // Form fields
  receiveFrom = signal<string>('');
  scheduleDate = signal<string>('');
  responsible = signal<string>('Unknown');
  
  products = signal<ProductLine[]>([]);
  
  newProductSearch = signal<string>('');

  constructor(private route: ActivatedRoute, private router: Router) {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Auto-fill responsible user from JWT token
    try {
      const token = localStorage.getItem('sf_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.loginId) {
          this.responsible.set(payload.loginId);
        }
      }
    } catch (e) {
      console.error('Failed to parse token for responsible user');
    }

    if (id && id !== 'new') {
      const existing = this.receiptService.getReceipt(id);
      if (existing) {
        this.receiptId.set(existing.id);
        this.reference.set(existing.reference);
        this.status.set(existing.status);
        this.receiveFrom.set(existing.from);
        this.scheduleDate.set(existing.scheduleDate);
        this.responsible.set(existing.responsible);
        this.products.set(existing.products);
      }
    } else {
      // Generate next reference and ID but do NOT save yet — user must click Save
      const newId = this.receiptService.generateNextId();
      this.receiptId.set(newId);
      this.reference.set(this.receiptService.generateNextReference());
      this.products.set([]);
      this.isNew.set(true);
    }
  }

  saveState() {
    this.receiptService.saveReceipt({
      id: this.receiptId(),
      reference: this.reference(),
      from: this.receiveFrom() || 'Vendor',
      to: 'WH/Stock',
      contact: this.receiveFrom() || 'Azure Interior',
      scheduleDate: this.scheduleDate(),
      responsible: this.responsible(),
      status: this.status(),
      products: this.products()
    });
  }

  /** Called when user explicitly clicks Save on a new receipt */
  save() {
    this.saveState();
    this.isNew.set(false);
    this.router.navigate(['/operations/receipt', this.receiptId()]);
  }

  markAsToDo() {
    if (this.status() === 'Draft') {
      this.status.set('Ready');
      this.saveState();
    }
  }

  validate() {
    if (this.status() === 'Ready') {
      this.status.set('Done');
      this.saveState();
    }
  }

  printReceipt() {
    window.print();
  }
  
  cancel() {
    this.router.navigate(['/operations/receipt']);
  }

  addProduct() {
    if (this.newProductSearch().trim()) {
      const newLine: ProductLine = {
        id: Date.now(),
        product: `[PRD${Math.floor(Math.random() * 1000)}] ${this.newProductSearch()}`,
        quantity: 1
      };
      this.products.update(p => [...p, newLine]);
      this.newProductSearch.set('');
      this.saveState();
    }
  }

  updateQuantity(id: number, quantity: number) {
    this.products.update(p => p.map(line => line.id === id ? { ...line, quantity } : line));
    this.saveState();
  }

  removeProduct(id: number) {
    this.products.update(p => p.filter(line => line.id !== id));
    this.saveState();
  }
}
