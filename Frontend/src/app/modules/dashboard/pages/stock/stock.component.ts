import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface StockItem {
  id: string;
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
export class StockComponent {

  /* ── Filters ── */
  searchQuery   = signal('');
  categoryFilter = signal('All');
  warehouseFilter = signal('All');
  statusFilter  = signal<StockStatus | 'All'>('All');
  sortField     = signal<keyof StockItem>('product');
  sortAsc       = signal(true);

  /* ── Filter Dropdown States ── */
  activeDropdown = signal<'category' | 'warehouse' | 'status' | null>(null);

  /* ── Update drawer ── */
  drawerOpen    = signal(false);
  drawerMode    = signal<'add' | 'edit'>('edit');
  editTarget    = signal<StockItem | null>(null);
  updateForm: UpdateForm = this.blankForm();
  updateErrors  = signal<Partial<Record<keyof UpdateForm, string>>>({});
  updateHistory = signal<{ id: string; product: string; field: string; from: number | string; to: number | string; note: string; date: string }[]>([]);

  readonly statuses: (StockStatus | 'All')[] = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
  readonly categories = ['All', 'Furniture', 'Electronics', 'Accessories', 'Storage', 'Lighting'];
  readonly warehouses = ['All', 'Main Warehouse', 'West Coast Store', 'Transit Hub'];
  readonly units = ['Units', 'kg', 'Litres', 'Boxes'];

  /* ── Stock Data ── */
  items = signal<StockItem[]>([
    { id: '1', product: 'Office Desk',        sku: 'FURN-001', category: 'Furniture',    warehouse: 'Main Warehouse',   unitCost: 3000, onHand: 50,  reserved: 5,  freeToUse: 45, reorderPoint: 10, unit: 'Units' },
    { id: '2', product: 'Wooden Table',        sku: 'FURN-002', category: 'Furniture',    warehouse: 'Main Warehouse',   unitCost: 3000, onHand: 50,  reserved: 0,  freeToUse: 50, reorderPoint: 8,  unit: 'Units' },
    { id: '3', product: 'Ergonomic Chair',     sku: 'FURN-003', category: 'Furniture',    warehouse: 'West Coast Store', unitCost: 4500, onHand: 12,  reserved: 2,  freeToUse: 10, reorderPoint: 15, unit: 'Units' },
    { id: '4', product: 'Monitor Stand',       sku: 'ACC-001',  category: 'Accessories',  warehouse: 'Main Warehouse',   unitCost: 800,  onHand: 75,  reserved: 10, freeToUse: 65, reorderPoint: 20, unit: 'Units' },
    { id: '5', product: 'Laptop Stand',        sku: 'ACC-002',  category: 'Accessories',  warehouse: 'West Coast Store', unitCost: 650,  onHand: 3,   reserved: 1,  freeToUse: 2,  reorderPoint: 10, unit: 'Units' },
    { id: '6', product: 'USB Hub',             sku: 'ELEC-001', category: 'Electronics',  warehouse: 'Main Warehouse',   unitCost: 1200, onHand: 0,   reserved: 0,  freeToUse: 0,  reorderPoint: 5,  unit: 'Units' },
    { id: '7', product: 'Cable Tray',          sku: 'ACC-003',  category: 'Accessories',  warehouse: 'Main Warehouse',   unitCost: 350,  onHand: 30,  reserved: 0,  freeToUse: 30, reorderPoint: 5,  unit: 'Units' },
    { id: '8', product: 'Storage Cabinet',     sku: 'STOR-001', category: 'Storage',      warehouse: 'Main Warehouse',   unitCost: 6500, onHand: 8,   reserved: 2,  freeToUse: 6,  reorderPoint: 3,  unit: 'Units' },
    { id: '9', product: 'LED Desk Lamp',       sku: 'LGHT-001', category: 'Lighting',     warehouse: 'West Coast Store', unitCost: 950,  onHand: 5,   reserved: 0,  freeToUse: 5,  reorderPoint: 8,  unit: 'Units' },
    { id:'10', product: 'Wireless Keyboard',   sku: 'ELEC-002', category: 'Electronics',  warehouse: 'Main Warehouse',   unitCost: 2200, onHand: 22,  reserved: 4,  freeToUse: 18, reorderPoint: 5,  unit: 'Units' },
    { id:'11', product: 'Filing Cabinet',      sku: 'STOR-002', category: 'Storage',      warehouse: 'Transit Hub',      unitCost: 4200, onHand: 0,   reserved: 0,  freeToUse: 0,  reorderPoint: 2,  unit: 'Units' },
    { id:'12', product: 'Whiteboard',          sku: 'FURN-004', category: 'Furniture',    warehouse: 'Main Warehouse',   unitCost: 1800, onHand: 15,  reserved: 3,  freeToUse: 12, reorderPoint: 5,  unit: 'Units' },
  ]);

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
  totalProducts   = computed(() => this.items().length);
  totalValue      = computed(() => this.items().reduce((s, i) => s + i.unitCost * i.onHand, 0));
  lowStockCount   = computed(() => this.items().filter(i => this.stockStatus(i) === 'Low Stock').length);
  outOfStockCount = computed(() => this.items().filter(i => this.stockStatus(i) === 'Out of Stock').length);

  /* ── Helpers ── */
  stockStatus(item: StockItem): StockStatus {
    if (item.onHand === 0) return 'Out of Stock';
    if (item.onHand <= item.reorderPoint) return 'Low Stock';
    return 'In Stock';
  }

  statusBadge(item: StockItem): string {
    const s = this.stockStatus(item);
    if (s === 'In Stock')     return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (s === 'Low Stock')    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
  }

  freeToUseColor(item: StockItem): string {
    const ratio = item.onHand === 0 ? 0 : item.freeToUse / item.onHand;
    if (ratio === 0)    return 'text-rose-500 dark:text-rose-400';
    if (ratio < 0.3)    return 'text-amber-500 dark:text-amber-400';
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
    if (type === 'category') this.categoryFilter.set(value);
    if (type === 'warehouse') this.warehouseFilter.set(value);
    if (type === 'status') this.statusFilter.set(value as any);
    this.activeDropdown.set(null);
  }

  /* ── Drawer ── */
  blankForm(): UpdateForm {
    return {
      product: '',
      sku: '',
      category: 'Furniture',
      warehouse: 'Main Warehouse',
      onHand: null,
      reserved: null,
      unitCost: null,
      reorderPoint: null,
      unit: 'Units',
      note: ''
    };
  }

  openAdd() {
    this.drawerMode.set('add');
    this.editTarget.set(null);
    this.updateForm = this.blankForm();
    this.updateErrors.set({});
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
      if (!this.updateForm.product.trim()) e.product = 'Product name required';
      if (!this.updateForm.sku.trim()) e.sku = 'SKU required';
    }
    if (this.updateForm.onHand == null || this.updateForm.onHand < 0) e.onHand = 'On Hand must be ≥ 0';
    if (this.updateForm.reserved == null || this.updateForm.reserved < 0) e.reserved = 'Reserved must be ≥ 0';
    if (this.updateForm.reserved! > this.updateForm.onHand!) e.reserved = 'Reserved cannot exceed On Hand';
    if (this.updateForm.unitCost == null || this.updateForm.unitCost <= 0) e.unitCost = 'Unit cost must be > 0';
    if (this.updateForm.reorderPoint == null || this.updateForm.reorderPoint < 0) e.reorderPoint = 'Reorder point must be ≥ 0';
    this.updateErrors.set(e);
    return Object.keys(e).length === 0;
  }

  saveUpdate() {
    if (!this.validateUpdate()) return;

    if (this.drawerMode() === 'add') {
      const newItem: StockItem = {
        id: crypto.randomUUID(),
        product: this.updateForm.product,
        sku: this.updateForm.sku,
        category: this.updateForm.category,
        warehouse: this.updateForm.warehouse,
        onHand: this.updateForm.onHand!,
        reserved: this.updateForm.reserved!,
        freeToUse: this.updateForm.onHand! - this.updateForm.reserved!,
        unitCost: this.updateForm.unitCost!,
        reorderPoint: this.updateForm.reorderPoint!,
        unit: this.updateForm.unit
      };
      this.items.update(list => [newItem, ...list]);

      this.updateHistory.update(h => [{
        id: crypto.randomUUID(),
        product: newItem.product,
        field: 'Status',
        from: 'N/A',
        to: 'Created',
        note: this.updateForm.note || 'New product added',
        date: new Date().toISOString(),
      }, ...h]);
    } else {
      const target = this.editTarget()!;
      if (this.updateForm.onHand !== target.onHand) {
        this.updateHistory.update(h => [{
          id: crypto.randomUUID(),
          product: target.product,
          field: 'On Hand',
          from: target.onHand,
          to: this.updateForm.onHand!,
          note: this.updateForm.note,
          date: new Date().toISOString(),
        }, ...h]);
      }

      this.items.update(list => list.map(i => {
        if (i.id !== target.id) return i;
        const onHand   = this.updateForm.onHand!;
        const reserved = this.updateForm.reserved!;
        return {
          ...i,
          product:   this.updateForm.product,
          sku:       this.updateForm.sku,
          category:  this.updateForm.category,
          warehouse: this.updateForm.warehouse,
          onHand,
          reserved,
          freeToUse: onHand - reserved,
          unitCost:  this.updateForm.unitCost!,
          reorderPoint: this.updateForm.reorderPoint!,
          unit:      this.updateForm.unit
        };
      }));
    }
    this.closeDrawer();
  }

  updateErr(f: keyof UpdateForm): string { return this.updateErrors()[f] ?? ''; }
}
