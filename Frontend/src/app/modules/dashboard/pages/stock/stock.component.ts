import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, BalanceRow } from '../../../../core/services/stock.service';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface StockItem {
  id: string;
  balanceId: number;
  productId: number;
  product: string;
  sku: string;
  category: string;
  warehouse: string;
  unitCost: number;
  onHand: number;
  reserved: number;
  freeToUse: number;
  reorderPoint: number;
  unit: string;
}

interface UpdateForm {
  product: string;
  sku: string;
  category: string;
  warehouse: string;
  onHand: number | null;
  reserved: number | null;
  unitCost: number | null;
  reorderPoint: number | null;
  unit: string;
  note: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
})
export class StockComponent implements OnInit {
  private svc = inject(StockService);

  /* ── Loading ── */
  loading = signal(false);
  saving  = signal(false);

  /* ── Filters ── */
  searchQuery     = signal('');
  categoryFilter  = signal('All');
  warehouseFilter = signal('All');
  statusFilter    = signal<StockStatus | 'All'>('All');
  sortField       = signal<keyof StockItem>('product');
  sortAsc         = signal(true);
  activeDropdown  = signal<'category' | 'warehouse' | 'status' | null>(null);

  /* ── Update drawer ── */
  drawerOpen    = signal(false);
  drawerMode    = signal<'add' | 'edit'>('edit');
  editTarget    = signal<StockItem | null>(null);
  updateForm: UpdateForm = this.blankForm();
  updateErrors  = signal<Partial<Record<keyof UpdateForm, string>>>({});
  updateHistory = signal<{ id: string; product: string; field: string; from: number | string; to: number | string; note: string; date: string }[]>([]);

  readonly statuses: (StockStatus | 'All')[] = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
  readonly units = ['Units', 'kg', 'Litres', 'Boxes', 'Pcs'];

  /* ── Reference data for Add Product form ── */
  apiCategories = signal<{ id: number; name: string }[]>([]);
  apiLocations  = signal<{ id: number; name: string; warehouse_name: string }[]>([]);

  /* ── Stock Data ── */
  items = signal<StockItem[]>([]);

  /* ── Filter lists derived from loaded data ── */
  categories = computed(() => ['All', ...new Set(this.items().map(i => i.category).filter(Boolean))]);
  warehouses = computed(() => ['All', ...new Set(this.items().map(i => i.warehouse).filter(Boolean))]);

  /* ── Computed filtered + sorted list ── */
  filtered = computed(() => {
    const q   = this.searchQuery().toLowerCase();
    const cat = this.categoryFilter();
    const wh  = this.warehouseFilter();
    const st  = this.statusFilter();
    const sf  = this.sortField();
    const asc = this.sortAsc();

    let list = this.items().filter(i => {
      const matchSearch = !q || i.product.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
      const matchCat    = cat === 'All' || i.category === cat;
      const matchWh     = wh  === 'All' || i.warehouse === wh;
      const matchStatus = st  === 'All' || this.stockStatus(i) === st;
      return matchSearch && matchCat && matchWh && matchStatus;
    });

    list = [...list].sort((a, b) => {
      const av = a[sf]; const bv = b[sf];
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return asc ? cmp : -cmp;
    });
    return list;
  });

  /* ── Summary KPIs ── */
  totalProducts   = computed(() => new Set(this.items().map(i => i.productId)).size);
  totalValue      = computed(() => this.items().reduce((s, i) => s + i.unitCost * i.onHand, 0));
  lowStockCount   = computed(() => this.items().filter(i => this.stockStatus(i) === 'Low Stock').length);
  outOfStockCount = computed(() => this.items().filter(i => this.stockStatus(i) === 'Out of Stock').length);

  /* ── Helpers ── */
  stockStatus(item: StockItem): StockStatus {
    if (item.onHand === 0)                return 'Out of Stock';
    if (item.onHand <= item.reorderPoint) return 'Low Stock';
    return 'In Stock';
  }

  statusBadge(item: StockItem): string {
    const s = this.stockStatus(item);
    if (s === 'In Stock')  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (s === 'Low Stock') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
  }

  freeToUseColor(item: StockItem): string {
    const ratio = item.onHand === 0 ? 0 : item.freeToUse / item.onHand;
    if (ratio === 0)  return 'text-rose-500 dark:text-rose-400';
    if (ratio < 0.3)  return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  formatCurrency(v: number): string {
    return '₹' + v.toLocaleString('en-IN');
  }

  formatTotal(v: number): string {
    if (v >= 10_00_000) return '₹' + (v / 10_00_000).toFixed(2) + 'L';
    if (v >= 1000)      return '₹' + (v / 1000).toFixed(1) + 'K';
    return '₹' + v;
  }

  toggleSort(field: keyof StockItem) {
    if (this.sortField() === field) this.sortAsc.update(v => !v);
    else { this.sortField.set(field); this.sortAsc.set(true); }
  }

  sortIcon(field: keyof StockItem): string {
    if (this.sortField() !== field) return 'text-slate-300 dark:text-slate-600';
    return this.sortAsc() ? 'text-indigo-500 rotate-0' : 'text-indigo-500 rotate-180';
  }

  onSearch(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }

  toggleDropdown(type: 'category' | 'warehouse' | 'status') {
    this.activeDropdown.update(v => v === type ? null : type);
  }

  selectFilter(type: 'category' | 'warehouse' | 'status', value: string) {
    if (type === 'category')  this.categoryFilter.set(value);
    if (type === 'warehouse') this.warehouseFilter.set(value);
    if (type === 'status')    this.statusFilter.set(value as any);
    this.activeDropdown.set(null);
  }

  /* ── Drawer ── */
  blankForm(): UpdateForm {
    return { product: '', sku: '', category: '', warehouse: '', onHand: null, reserved: null, unitCost: null, reorderPoint: null, unit: 'Units', note: '' };
  }

  openAdd() {
    this.drawerMode.set('add');
    this.editTarget.set(null);
    this.updateForm = this.blankForm();
    this.updateErrors.set({});
    this.loadRefData();
    this.drawerOpen.set(true);
  }

  openUpdate(item: StockItem) {
    this.drawerMode.set('edit');
    this.editTarget.set(item);
    this.updateForm = {
      product:      item.product,
      sku:          item.sku,
      category:     item.category,
      warehouse:    item.warehouse,
      onHand:       item.onHand,
      reserved:     item.reserved,
      unitCost:     item.unitCost,
      reorderPoint: item.reorderPoint,
      unit:         item.unit,
      note:         '',
    };
    this.updateErrors.set({});
    this.drawerOpen.set(true);
  }

  closeDrawer() { this.drawerOpen.set(false); }

  validateUpdate(): boolean {
    const e: Partial<Record<keyof UpdateForm, string>> = {};
    if (this.drawerMode() === 'add') {
      if (!this.updateForm.product.trim()) e.product  = 'Product name required';
      if (!this.updateForm.sku.trim())     e.sku      = 'SKU required';
      if (!this.updateForm.category)       e.category = 'Category required';
      if (!this.updateForm.unit.trim())    e.unit     = 'Unit required';
    } else {
      if (this.updateForm.onHand == null  || this.updateForm.onHand < 0)   e.onHand      = 'On Hand must be ≥ 0';
      if (this.updateForm.reserved == null || this.updateForm.reserved < 0) e.reserved    = 'Reserved must be ≥ 0';
      if ((this.updateForm.reserved ?? 0) > (this.updateForm.onHand ?? 0)) e.reserved    = 'Reserved cannot exceed On Hand';
      if (this.updateForm.unitCost == null || this.updateForm.unitCost <= 0) e.unitCost   = 'Unit cost must be > 0';
      if (this.updateForm.reorderPoint == null || this.updateForm.reorderPoint < 0) e.reorderPoint = 'Reorder point must be ≥ 0';
    }
    this.updateErrors.set(e);
    return Object.keys(e).length === 0;
  }

  saveUpdate() {
    if (!this.validateUpdate()) return;

    if (this.drawerMode() === 'add') {
      const cat = this.apiCategories().find(c => c.name === this.updateForm.category);
      const loc = this.apiLocations().find(l => l.name === this.updateForm.warehouse);

      const payload: any = {
        name:          this.updateForm.product.trim(),
        sku:           this.updateForm.sku.trim().toUpperCase(),
        category_id:   cat?.id,
        unit:          this.updateForm.unit,
        reorder_level: this.updateForm.reorderPoint ?? 0,
        unit_price:    this.updateForm.unitCost ?? 0,
      };
      if (this.updateForm.onHand && this.updateForm.onHand > 0 && loc) {
        payload.initial_stock       = this.updateForm.onHand;
        payload.initial_location_id = loc.id;
        payload.initial_reserved    = this.updateForm.reserved ?? 0;
      }

      this.saving.set(true);
      this.svc.createProduct(payload).subscribe({
        next: (res: any) => {
          this.saving.set(false);
          if (res.success) { this.load(); this.closeDrawer(); }
          else this.updateErrors.set({ product: res.message });
        },
        error: () => this.saving.set(false),
      });

    } else {
      const target = this.editTarget()!;
      this.saving.set(true);

      const productUpdate$ = this.svc.updateProduct(target.productId, {
        unit_price:    this.updateForm.unitCost    ?? 0,
        reorder_level: this.updateForm.reorderPoint ?? 0,
      });

      const balanceUpdate$ = this.svc.updateBalance(target.balanceId, {
        quantity:          this.updateForm.onHand!,
        reserved_quantity: this.updateForm.reserved!,
        note:              this.updateForm.note,
      });

      let done = 0;
      const finish = (err?: string) => {
        done++;
        if (err) { this.saving.set(false); this.updateErrors.set({ note: err }); return; }
        if (done === 2) { this.saving.set(false); this.load(); this.closeDrawer(); }
      };

      productUpdate$.subscribe({ next: () => finish(), error: () => finish('Failed to update product details.') });
      balanceUpdate$.subscribe({ next: () => finish(), error: () => finish('Failed to update stock quantity.') });
    }
  }

  updateErr(f: keyof UpdateForm): string { return this.updateErrors()[f] ?? ''; }

  /* ── Init & Data Loading ── */
  ngOnInit() {
    this.load();
    this.loadRefData();
  }

  load() {
    this.loading.set(true);
    this.svc.getBalances().subscribe({
      next: (res: any) => {
        if (res.success) this.items.set(res.data.map((b: BalanceRow) => this.mapBalance(b)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadRefData() {
    this.svc.getCategories().subscribe((res: any) => {
      if (res.success) this.apiCategories.set(res.data);
    });
    this.svc.getLocations().subscribe((res: any) => {
      if (res.success) {
        this.apiLocations.set(res.data.map((l: any) => ({
          id:             Number(l.id),
          name:           l.name,
          warehouse_name: l.warehouse_name || l.warehouseId || '',
        })));
      }
    });
  }

  private mapBalance(b: BalanceRow): StockItem {
    const onHand   = Number(b.quantity);
    const reserved = Number(b.reserved_quantity ?? 0);
    return {
      id:           `${b.product_id}-${b.location_id}`,
      balanceId:    b.id,
      productId:    b.product_id,
      product:      b.product_name,
      sku:          b.sku,
      category:     b.category,
      warehouse:    b.warehouse_name,
      unitCost:     Number(b.unit_price ?? 0),
      onHand,
      reserved,
      freeToUse:    onHand - reserved,
      reorderPoint: Number(b.reorder_level),
      unit:         b.unit,
    };
  }
}
