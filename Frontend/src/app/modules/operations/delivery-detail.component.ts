import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DeliveryService, DeliveryStatus, DeliveryProductLine } from './services/delivery.service';
import { ContactsService } from '../../core/services/contacts.service';
import { SettingsService } from '../../core/services/settings.service';
import { StockService } from '../../core/services/stock.service';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './delivery-detail.component.html',
})
export class DeliveryDetailComponent implements OnInit {
  deliveryId = signal<string>('new');
  reference = signal<string>('New Delivery');
  status = signal<DeliveryStatus>('Draft');
  isNew = signal<boolean>(false);

  deliveryAddress = signal<string>('');
  scheduleDate = signal<string>('');
  responsible = signal<string>('Unknown');
  operationType = signal<string>('Delivery Orders');
  products = signal<DeliveryProductLine[]>([]);

  /* New-delivery form: customer and warehouse selects */
  selectedCustomerId = signal<number | null>(null);
  selectedWarehouseId = signal<number | null>(null);

  /* Product-add row */
  selectedProductId = signal<number | null>(null);
  newProductQty = signal<number>(1);

  /* Lookup lists */
  customers = signal<any[]>([]);
  warehouses = signal<any[]>([]);
  products_list = signal<any[]>([]);

  loading = signal(true);
  saving = signal(false);
  apiError = signal('');

  readonly operationTypes = ['Delivery Orders', 'Returns', 'Receipts', 'Internal Transfers'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private contactsService: ContactsService,
    private settingsService: SettingsService,
    private stockService: StockService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    try {
      const token = localStorage.getItem('sf_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.loginId) this.responsible.set(payload.loginId);
      }
    } catch {}

    forkJoin({
      customers: this.contactsService.getCustomers(),
      warehouses: this.settingsService.getWarehouses(),
      products: this.stockService.getProducts(),
    }).subscribe({
      next: ({ customers, warehouses, products }) => {
        this.customers.set(customers?.data ?? []);
        this.warehouses.set(warehouses?.data ?? []);
        this.products_list.set(products?.data ?? []);

        if (id && id !== 'new') {
          this.loadDelivery(id);
        } else {
          this.deliveryId.set('new');
          this.reference.set('New Delivery');
          this.status.set('Draft');
          this.isNew.set(true);
          this.loading.set(false);
        }
      },
      error: () => {
        this.apiError.set('Failed to load form data.');
        this.loading.set(false);
        if (id && id !== 'new') {
          this.loadDelivery(id);
        } else {
          this.isNew.set(true);
        }
      },
    });
  }

  private loadDelivery(id: string): void {
    this.loading.set(true);
    this.deliveryService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          const custs = this.customers();
          const ware = this.warehouses();
          const mapped = this.deliveryService.mapToFrontend(d, custs, ware);
          this.deliveryId.set(mapped.id);
          this.reference.set(mapped.reference);
          this.status.set(mapped.status);
          this.deliveryAddress.set(mapped.deliveryAddress);
          this.scheduleDate.set(mapped.scheduleDate);
          this.responsible.set(mapped.responsible);
          this.operationType.set(mapped.operationType);
          const pList = this.products_list();
          this.products.set(
            mapped.products.map((line) => {
              const found = pList.find((p: any) => Number(p.id) === Number(line.product_id));
              return found ? { ...line, product: `[${found.sku ?? found.id}] ${found.name}` } : line;
            }),
          );
        } else {
          this.apiError.set(res.message ?? 'Delivery not found.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.apiError.set('Failed to load delivery.');
        this.loading.set(false);
      },
    });
  }

  save() {
    const custId = this.selectedCustomerId();
    const wareId = this.selectedWarehouseId();
    if (!custId) { this.apiError.set('Please select a customer.'); return; }
    if (!wareId) { this.apiError.set('Please select a warehouse.'); return; }

    this.saving.set(true);
    this.apiError.set('');
    this.deliveryService.create({ customer_id: custId, warehouse_id: wareId }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success && res.data) {
          const newId = String(res.data.id);
          this.isNew.set(false);
          this.router.navigate(['/operations/delivery', newId]);
        } else {
          this.apiError.set(res.message ?? 'Failed to create delivery.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.apiError.set('Failed to create delivery.');
      },
    });
  }

  markAsWaiting() {
    const id = this.deliveryId();
    if (id === 'new') return;
    this.saving.set(true);
    this.apiError.set('');
    this.deliveryService.updateStatus(id, 'picking').subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.status.set('Waiting');
        } else {
          this.apiError.set(res.message ?? 'Failed to update status.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.apiError.set('Failed to update status.');
      },
    });
  }

  markAsReady() {
    const id = this.deliveryId();
    if (id === 'new') return;
    this.saving.set(true);
    this.apiError.set('');
    this.deliveryService.updateStatus(id, 'ready').subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.status.set('Ready');
        } else {
          this.apiError.set(res.message ?? 'Failed to update status.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.apiError.set('Failed to update status.');
      },
    });
  }

  validate() {
    const id = this.deliveryId();
    if (id === 'new') return;
    this.saving.set(true);
    this.apiError.set('');
    this.deliveryService.validate(id).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.status.set('Done');
        } else {
          this.apiError.set(res.message ?? 'Validation failed. Check stock levels.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.apiError.set('Validation failed.');
      },
    });
  }

  addProduct() {
    const productId = this.selectedProductId();
    const qty = this.newProductQty();
    if (!productId || qty < 1) { this.apiError.set('Please select a product and enter a valid quantity.'); return; }

    const id = this.deliveryId();
    if (id === 'new') { this.apiError.set('Save the delivery first before adding products.'); return; }

    this.saving.set(true);
    this.apiError.set('');
    this.deliveryService.addItem(id, { product_id: productId, quantity: qty }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          const pList = this.products_list();
          const found = pList.find((p: any) => Number(p.id) === Number(productId));
          const label = found ? `[${found.sku ?? found.id}] ${found.name}` : `Product #${productId}`;
          const newLine: DeliveryProductLine = {
            id: res.data?.id ?? Date.now(),
            product_id: productId,
            product: label,
            quantity: qty,
            inStock: true,
          };
          this.products.update((lines) => [...lines, newLine]);
          this.selectedProductId.set(null);
          this.newProductQty.set(1);
          if (this.status() === 'Draft') this.status.set('Waiting');
        } else {
          this.apiError.set(res.message ?? 'Failed to add product.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.apiError.set('Failed to add product.');
      },
    });
  }

  removeProduct(itemId: number) {
    const id = this.deliveryId();
    if (id === 'new') { this.products.update((p) => p.filter((l) => l.id !== itemId)); return; }
    this.deliveryService.removeItem(id, itemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.products.update((p) => p.filter((l) => l.id !== itemId));
        } else {
          this.apiError.set(res.message ?? 'Failed to remove item.');
        }
      },
      error: () => {
        this.apiError.set('Failed to remove item.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/operations/delivery']);
  }

  printDelivery() {
    window.print();
  }

  isDone(): boolean {
    return this.status() === 'Done' || this.status() === 'Cancelled';
  }

  hasOutOfStockItems(): boolean {
    return this.products().some((p) => !p.inStock);
  }
}
