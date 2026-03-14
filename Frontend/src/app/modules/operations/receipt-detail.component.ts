import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReceiptService, ReceiptStatus, ProductLine } from './services/receipt.service';
import { ContactsService } from '../../core/services/contacts.service';
import { SettingsService } from '../../core/services/settings.service';
import { StockService } from '../../core/services/stock.service';

@Component({
  selector: 'app-receipt-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receipt-detail.component.html',
})
export class ReceiptDetailComponent implements OnInit {
  receiptId = signal<string>('new');
  reference = signal<string>('New Receipt');
  status = signal<ReceiptStatus>('Draft');
  isNew = signal<boolean>(false);

  receiveFrom = signal<string>('');
  warehouseTo = signal<string>('');
  scheduleDate = signal<string>('');
  responsible = signal<string>('Unknown');
  products = signal<ProductLine[]>([]);

  /* New-receipt form: supplier and warehouse selects */
  selectedSupplierId = signal<number | null>(null);
  selectedWarehouseId = signal<number | null>(null);

  /* Product-add row: select from loaded products */
  selectedProductId = signal<number | null>(null);
  newProductQty = signal<number>(1);

  /* Lookup lists for dropdowns */
  suppliers = signal<any[]>([]);
  warehouses = signal<any[]>([]);
  products_list = signal<any[]>([]);

  loading = signal(true);
  saving = signal(false);
  apiError = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private receiptService: ReceiptService,
    private contactsService: ContactsService,
    private settingsService: SettingsService,
    private stockService: StockService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Pre-fill responsible from JWT
    try {
      const token = localStorage.getItem('sf_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.loginId) this.responsible.set(payload.loginId);
      }
    } catch {}

    // Always load lookup lists
    forkJoin({
      suppliers: this.contactsService.getSuppliers(),
      warehouses: this.settingsService.getWarehouses(),
      products: this.stockService.getProducts(),
    }).subscribe({
      next: ({ suppliers, warehouses, products }) => {
        this.suppliers.set(suppliers?.data ?? []);
        this.warehouses.set(warehouses?.data ?? []);
        this.products_list.set(products?.data ?? []);

        if (id && id !== 'new') {
          this.loadReceipt(id);
        } else {
          this.receiptId.set('new');
          this.reference.set('New Receipt');
          this.status.set('Draft');
          this.isNew.set(true);
          this.loading.set(false);
        }
      },
      error: () => {
        this.apiError.set('Failed to load form data.');
        this.loading.set(false);
        if (id && id !== 'new') {
          this.loadReceipt(id);
        } else {
          this.isNew.set(true);
        }
      },
    });
  }

  private loadReceipt(id: string): void {
    this.loading.set(true);
    this.receiptService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const r = res.data;
          const supp = this.suppliers();
          const ware = this.warehouses();
          const mapped = this.receiptService.mapToFrontend(r, supp, ware);
          this.receiptId.set(mapped.id);
          this.reference.set(mapped.reference);
          this.status.set(mapped.status);
          this.receiveFrom.set(mapped.from);
          this.warehouseTo.set(mapped.to);
          this.scheduleDate.set(mapped.scheduleDate);
          this.responsible.set(mapped.responsible);
          this.products.set(mapped.products);
          // Resolve product names from the loaded product list
          const pList = this.products_list();
          this.products.update((lines) =>
            lines.map((line) => {
              if (!line.product_id) return line;
              const found = pList.find((p: any) => Number(p.id) === Number(line.product_id));
              return found ? { ...line, product: `[${found.sku ?? found.id}] ${found.name}` } : line;
            }),
          );
        } else {
          this.apiError.set(res.message ?? 'Receipt not found.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.apiError.set('Failed to load receipt.');
        this.loading.set(false);
      },
    });
  }

  /** Create new receipt via API */
  save() {
    const suppId = this.selectedSupplierId();
    const wareId = this.selectedWarehouseId();
    if (!suppId) { this.apiError.set('Please select a supplier.'); return; }
    if (!wareId) { this.apiError.set('Please select a warehouse.'); return; }

    this.saving.set(true);
    this.apiError.set('');
    this.receiptService.create({ supplier_id: suppId, warehouse_id: wareId }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success && res.data) {
          const newId = String(res.data.id);
          this.isNew.set(false);
          this.router.navigate(['/operations/receipt', newId]);
        } else {
          this.apiError.set(res.message ?? 'Failed to create receipt.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.apiError.set('Failed to create receipt.');
      },
    });
  }

  markAsToDo() {
    const id = this.receiptId();
    if (id === 'new') return;
    this.saving.set(true);
    this.apiError.set('');
    this.receiptService.updateStatus(id, 'ready').subscribe({
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
    const id = this.receiptId();
    if (id === 'new') return;
    this.saving.set(true);
    this.apiError.set('');
    this.receiptService.validate(id).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.status.set('Done');
        } else {
          this.apiError.set(res.message ?? 'Validation failed.');
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

    const id = this.receiptId();
    if (id === 'new') { this.apiError.set('Save the receipt first before adding products.'); return; }

    this.saving.set(true);
    this.apiError.set('');
    this.receiptService.addItem(id, { product_id: productId, quantity: qty }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          const pList = this.products_list();
          const found = pList.find((p: any) => Number(p.id) === Number(productId));
          const label = found ? `[${found.sku ?? found.id}] ${found.name}` : `Product #${productId}`;
          const newLine: ProductLine = {
            id: res.data?.id ?? Date.now(),
            product_id: productId,
            product: label,
            quantity: qty,
          };
          this.products.update((lines) => [...lines, newLine]);
          this.selectedProductId.set(null);
          this.newProductQty.set(1);
          // Auto-advance to Waiting after first item
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
    const id = this.receiptId();
    if (id === 'new') { this.products.update((p) => p.filter((l) => l.id !== itemId)); return; }
    this.receiptService.removeItem(id, itemId).subscribe({
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
    this.router.navigate(['/operations/receipt']);
  }

  printReceipt() {
    window.print();
  }

  isDone(): boolean {
    return this.status() === 'Done' || this.status() === 'Cancelled';
  }

  hasOutOfStockItems(): boolean {
    return false;
  }
}
