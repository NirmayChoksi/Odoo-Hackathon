import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoveHistoryService, RefItem } from '../../../../core/services/move-history.service';

export type MoveStatus = 'Ready' | 'Done' | 'Waiting' | 'Cancelled' | 'Draft' | 'Picking' | 'Packing';

export interface StockMove {
  id: string; // Internal unique ID for frontend iteration
  reference: string;
  date: string;
  contact: string;
  from: string;
  to: string;
  product: string;
  quantity: number;
  unit: string;
  status: MoveStatus;
  type: 'IN' | 'OUT' | 'INTERNAL';
}

interface NewMoveForm {
  type: 'IN' | 'OUT' | 'INTERNAL';
  date: string;
  warehouse: number | null;
  contact: number | null;
  from: number | null;
  to: number | null;
  product: number | null;
  quantity: number | null;
  unit: string;
  status: string;
}

@Component({
  selector: 'app-move-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './move-history.component.html',
})
export class MoveHistoryComponent implements OnInit {
  private svc = inject(MoveHistoryService);

  viewMode = signal<'list' | 'kanban'>('list');
  searchQuery = signal('');
  statusFilter = signal<string>('All');
  isDrawerOpen = signal(false);
  formErrors = signal<Partial<Record<keyof NewMoveForm, string>>>({});
  didSubmit = signal(false);
  isLoading = signal(false);

  readonly statuses = ['All', 'Ready', 'Done', 'Waiting', 'Cancelled', 'Draft', 'Picking', 'Packing'];
  readonly moveStatuses = ['draft', 'picking', 'packing', 'ready', 'waiting', 'done', 'cancelled'];
  readonly units = ['Units', 'kg', 'Litres', 'Boxes', 'Pallets'];

  moves = signal<StockMove[]>([]);

  products = signal<RefItem[]>([]);
  locations = signal<RefItem[]>([]);
  suppliers = signal<RefItem[]>([]);
  customers = signal<RefItem[]>([]);
  warehouses = signal<RefItem[]>([]);

  newMove: NewMoveForm = this.blankForm();

  ngOnInit() {
     this.loadReferenceData();
     this.loadMoves();
  }

  loadReferenceData() {
    this.svc.getProducts().subscribe((r: any) => { if(r.success) this.products.set(r.data); });
    this.svc.getLocations().subscribe((r: any) => { if(r.success) this.locations.set(r.data); });
    this.svc.getSuppliers().subscribe((r: any) => { if(r.success) this.suppliers.set(r.data); });
    this.svc.getCustomers().subscribe((r: any) => { if(r.success) this.customers.set(r.data); });
    this.svc.getWarehouses().subscribe((r: any) => { if(r.success) this.warehouses.set(r.data); });
  }

  loadMoves() {
    this.isLoading.set(true);
    
    this.svc.getUnifiedMoves().subscribe((details: any[]) => {
      const allMoves: StockMove[] = [];
      const prods = Object.fromEntries(this.products().map(p => [p.id, p.name]));
      const locs = Object.fromEntries(this.locations().map(l => [l.id, l.name]));
      const supps = Object.fromEntries(this.suppliers().map(s => [s.id, s.name]));
      const custs = Object.fromEntries(this.customers().map(c => [c.id, c.name]));

      for (const d of details) {
        if (!d || !d.success || !d.data) continue;
        const doc = d.data;
        const items = doc.items || [];
        
        for (const item of items) {
          let type: 'IN'|'OUT'|'INTERNAL' = 'INTERNAL';
          let ref = '';
          let contact = '';
          let from = '';
          let to = '';

          // Determine type based on fields
          if (doc.supplier_id) {
            type = 'IN';
            ref = `WH/IN/${String(doc.id).padStart(4,'0')}`;
            contact = supps[doc.supplier_id] || `Supplier ${doc.supplier_id}`;
            from = 'Vendor';
            to = 'Warehouse Storage';
          } else if (doc.customer_id) {
            type = 'OUT';
            ref = `WH/OUT/${String(doc.id).padStart(4,'0')}`;
            contact = custs[doc.customer_id] || `Customer ${doc.customer_id}`;
            from = 'Warehouse Storage';
            to = 'Customer';
          } else if (doc.from_location && doc.to_location) {
            type = 'INTERNAL';
            ref = `WH/INT/${String(doc.id).padStart(4,'0')}`;
            contact = 'Internal';
            from = locs[doc.from_location] || `Loc ${doc.from_location}`;
            to = locs[doc.to_location] || `Loc ${doc.to_location}`;
          }

          allMoves.push({
            id: crypto.randomUUID(),
            reference: ref,
            date: doc.created_at || new Date().toISOString(),
            contact,
            from,
            to,
            product: prods[item.product_id] || `Product ${item.product_id}`,
            quantity: item.quantity,
            unit: 'Units',
            status: (doc.status as string).charAt(0).toUpperCase() + (doc.status as string).slice(1) as any,
            type
          });
        }
      }
      
      allMoves.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.moves.set(allMoves);
      this.isLoading.set(false);
    });
  }

  blankForm(): NewMoveForm {
    return {
      type: 'IN',
      date: new Date().toISOString().split('T')[0],
      warehouse: null,
      contact: null,
      from: null,
      to: null,
      product: null,
      quantity: null,
      unit: 'Units',
      status: 'draft',
    };
  }

  openDrawer() {
    this.newMove = this.blankForm();
    if(this.warehouses().length > 0) this.newMove.warehouse = this.warehouses()[0].id;
    this.formErrors.set({});
    this.didSubmit.set(false);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  validate(): boolean {
    const e: Partial<Record<keyof NewMoveForm, string>> = {};
    if (this.newMove.type !== 'INTERNAL' && !this.newMove.warehouse) e.warehouse = 'Warehouse is required';
    if (this.newMove.type !== 'INTERNAL' && !this.newMove.contact) e.contact = 'Contact is required';
    if (this.newMove.type === 'INTERNAL') {
      if (!this.newMove.from) e.from = 'Source location is required';
      if (!this.newMove.to) e.to = 'Destination location is required';
      if (this.newMove.from === this.newMove.to) e.to = 'Origin and destination must differ';
    }
    if (!this.newMove.product) e.product = 'Product is required';
    if (!this.newMove.quantity || this.newMove.quantity <= 0) e.quantity = 'Enter a valid quantity';
    
    this.formErrors.set(e);
    return Object.keys(e).length === 0;
  }

  onTypeChange() {
    this.newMove.contact = null;
    this.newMove.from = null;
    this.newMove.to = null;
  }

  saveMove() {
    this.didSubmit.set(true);
    if (!this.validate()) return;
    
    let req;
    
    // Determine API based on type
    if (this.newMove.type === 'IN') {
      req = this.svc.createReceipt(this.newMove.contact!, this.newMove.warehouse!, this.newMove.product!, this.newMove.quantity!);
    } else if (this.newMove.type === 'OUT') {
      req = this.svc.createDelivery(this.newMove.contact!, this.newMove.warehouse!, this.newMove.product!, this.newMove.quantity!);
    } else if (this.newMove.type === 'INTERNAL') {
      req = this.svc.createTransfer(this.newMove.from!, this.newMove.to!, this.newMove.product!, this.newMove.quantity!);
    }
    
    if(req) {
      req.subscribe({
        next: () => { this.closeDrawer(); this.loadMoves(); },
        error: (err: any) => console.error(err)
      });
    }
  }

  err(field: keyof NewMoveForm): string {
    return this.formErrors()[field] ?? '';
  }

  filteredMoves = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.statusFilter();
    return this.moves().filter(m => {
      const matchesSearch = !q || m.reference.toLowerCase().includes(q) || m.contact.toLowerCase().includes(q) || m.product.toLowerCase().includes(q);
      const matchesStatus = s === 'All' || m.status.toLowerCase() === s.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  });

  kanbanGroups = computed(() => {
    const groups: Record<string, StockMove[]> = { Ready: [], Waiting: [], Done: [], Cancelled: [] };
    // Only pre-define these keys, others will be added dynamically if needed
    for (const m of this.filteredMoves()) { 
      if (!groups[m.status]) groups[m.status] = [];
      groups[m.status].push(m); 
    }
    return Object.entries(groups).map(([status, items]) => ({ status: status as MoveStatus, items }));
  });

  rowClass(move: StockMove): string {
    if (move.type === 'IN')  return 'border-l-4 border-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10';
    if (move.type === 'OUT') return 'border-l-4 border-rose-400 bg-rose-50/30 dark:bg-rose-900/10';
    return 'border-l-4 border-indigo-300 bg-indigo-50/20 dark:bg-indigo-900/10';
  }

  refClass(move: StockMove): string {
    if (move.type === 'IN')  return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    if (move.type === 'OUT') return 'text-rose-600 dark:text-rose-400 font-semibold';
    return 'text-indigo-600 dark:text-indigo-400 font-semibold';
  }

  statusBadge(status: string): string {
    const s = status.toLowerCase();
    if (s === 'ready' || s === 'picking' || s === 'packing') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
    if (s === 'done') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (s === 'waiting' || s === 'draft') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  }

  kanbanCardBorder(status: string): string {
    const s = status.toLowerCase();
    if (s === 'ready' || s === 'picking' || s === 'packing') return 'border-t-4 border-t-sky-400';
    if (s === 'done') return 'border-t-4 border-t-emerald-400';
    if (s === 'waiting' || s === 'draft') return 'border-t-4 border-t-amber-400';
    return 'border-t-4 border-t-slate-300';
  }

  typeIcon(type: StockMove['type']): string {
    if (type === 'IN')  return 'M3 16l4-4m0 0l4 4m-4-4v12M21 8l-4 4m0 0l-4-4m4 4V4';
    if (type === 'OUT') return 'M3 8l4-4m0 0l4 4M7 4v12m14 4l-4-4m0 0l-4 4m4-4V8';
    return 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4';
  }

  typeIconColor(type: StockMove['type']): string {
    if (type === 'IN')  return 'text-emerald-500';
    if (type === 'OUT') return 'text-rose-500';
    return 'text-indigo-500';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }
}
