import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService, DeliveryStatus, DeliveryProductLine } from './services/delivery.service';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './delivery-detail.component.html',
})
export class DeliveryDetailComponent {
  deliveryService = inject(DeliveryService);

  deliveryId = signal<string>('new');
  reference = signal<string>('WH/OUT/0001');
  status = signal<DeliveryStatus>('Draft');
  isNew = signal<boolean>(false);

  // Form fields
  deliveryAddress = signal<string>('');
  scheduleDate = signal<string>('');
  responsible = signal<string>('Unknown');
  operationType = signal<string>('Delivery Orders');

  products = signal<DeliveryProductLine[]>([]);
  newProductSearch = signal<string>('');

  readonly operationTypes = ['Delivery Orders', 'Returns', 'Receipts', 'Internal Transfers'];

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
      const existing = this.deliveryService.getDelivery(id);
      if (existing) {
        this.deliveryId.set(existing.id);
        this.reference.set(existing.reference);
        this.status.set(existing.status);
        this.deliveryAddress.set(existing.deliveryAddress);
        this.scheduleDate.set(existing.scheduleDate);
        this.responsible.set(existing.responsible);
        this.operationType.set(existing.operationType);
        this.products.set(existing.products);
      }
    } else {
      // Generate next reference and ID — do NOT save until user clicks Save
      const newId = this.deliveryService.generateNextId();
      this.deliveryId.set(newId);
      this.reference.set(this.deliveryService.generateNextReference());
      this.products.set([]);
      this.isNew.set(true);
    }
  }

  saveState() {
    this.deliveryService.saveDelivery({
      id: this.deliveryId(),
      reference: this.reference(),
      from: 'WH/Stock',
      to: 'Vendor',
      contact: this.deliveryAddress() || 'Customer',
      deliveryAddress: this.deliveryAddress(),
      scheduleDate: this.scheduleDate(),
      responsible: this.responsible(),
      operationType: this.operationType(),
      status: this.status(),
      products: this.products()
    });
  }

  /** Called when user explicitly clicks Save on a new delivery */
  save() {
    this.saveState();
    this.isNew.set(false);
    this.router.navigate(['/operations/delivery', this.deliveryId()]);
  }

  markAsWaiting() {
    if (this.status() === 'Draft') {
      this.status.set('Waiting');
      this.saveState();
    }
  }

  markAsReady() {
    if (this.status() === 'Waiting') {
      this.status.set('Ready');
      this.saveState();
    }
  }

  validate() {
    // Check for out-of-stock items
    const hasOutOfStock = this.products().some(p => !p.inStock);
    if (hasOutOfStock) {
      alert('Warning: Some products are out of stock. Please resolve before validating.');
      return;
    }
    if (this.status() === 'Ready') {
      this.status.set('Done');
      this.saveState();
    }
  }

  printDelivery() {
    window.print();
  }

  cancel() {
    this.router.navigate(['/operations/delivery']);
  }

  addProduct() {
    if (this.newProductSearch().trim()) {
      const newLine: DeliveryProductLine = {
        id: Date.now(),
        product: `[PRD${Math.floor(Math.random() * 1000)}] ${this.newProductSearch()}`,
        quantity: 1,
        inStock: Math.random() > 0.3 // Random stock for demo; 70% chance in stock
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

  hasOutOfStockItems(): boolean {
    return this.products().some(p => !p.inStock);
  }
}
