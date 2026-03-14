import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type MoveStatus = 'Ready' | 'Done' | 'Waiting' | 'Cancelled';

export interface StockMove {
  id: string;
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
  contact: string;
  from: string;
  to: string;
  product: string;
  quantity: number | null;
  unit: string;
  status: MoveStatus;
}

@Component({
  selector: 'app-move-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './move-history.component.html',
})
export class MoveHistoryComponent {
  viewMode = signal<'list' | 'kanban'>('list');
  searchQuery = signal('');
  statusFilter = signal<MoveStatus | 'All'>('All');
  isDrawerOpen = signal(false);
  formErrors = signal<Partial<Record<keyof NewMoveForm, string>>>({});
  didSubmit = signal(false);

  readonly statuses: (MoveStatus | 'All')[] = ['All', 'Ready', 'Done', 'Waiting', 'Cancelled'];
  readonly moveStatuses: MoveStatus[] = ['Ready', 'Waiting', 'Done', 'Cancelled'];
  readonly locations = ['Vendor', 'WH/Stock1', 'WH/Stock2', 'WH/Stock3', 'WH/Output', 'WH/Input'];
  readonly units = ['Units', 'kg', 'Litres', 'Boxes', 'Pallets'];

  moves = signal<StockMove[]>([
    { id: '1', reference: 'WH/IN/0001',  date: '2001-12-01', contact: 'Azure Interior', from: 'Vendor',    to: 'WH/Stock1', product: 'Office Chair',    quantity: 10, unit: 'Units', status: 'Ready',   type: 'IN' },
    { id: '2', reference: 'WH/IN/0001',  date: '2001-12-01', contact: 'Azure Interior', from: 'Vendor',    to: 'WH/Stock1', product: 'Office Desk',     quantity: 5,  unit: 'Units', status: 'Ready',   type: 'IN' },
    { id: '3', reference: 'WH/OUT/0002', date: '2001-12-01', contact: 'Azure Interior', from: 'WH/Stock1', to: 'Vendor',    product: 'Wooden Chair',    quantity: 8,  unit: 'Units', status: 'Ready',   type: 'OUT' },
    { id: '4', reference: 'WH/OUT/0003', date: '2001-12-05', contact: 'Deco Addict',    from: 'WH/Stock2', to: 'Vendor',    product: 'Laptop Stand',    quantity: 3,  unit: 'Units', status: 'Done',    type: 'OUT' },
    { id: '5', reference: 'WH/INT/0004', date: '2001-12-08', contact: 'Deco Addict',    from: 'WH/Stock1', to: 'WH/Stock2', product: 'Monitor',         quantity: 2,  unit: 'Units', status: 'Waiting', type: 'INTERNAL' },
    { id: '6', reference: 'WH/IN/0005',  date: '2001-12-10', contact: 'Lumber Inc',     from: 'Vendor',    to: 'WH/Stock1', product: 'Ergonomic Chair', quantity: 15, unit: 'Units', status: 'Ready',   type: 'IN' },
    { id: '7', reference: 'WH/OUT/0006', date: '2001-12-12', contact: 'Lumber Inc',     from: 'WH/Stock2', to: 'Vendor',    product: 'Standing Desk',   quantity: 4,  unit: 'Units', status: 'Done',    type: 'OUT' },
    { id: '8', reference: 'WH/OUT/0006', date: '2001-12-12', contact: 'Lumber Inc',     from: 'WH/Stock2', to: 'Vendor',    product: 'Cable Tray',      quantity: 12, unit: 'Units', status: 'Done',    type: 'OUT' },
  ]);

  newMove: NewMoveForm = this.blankForm();

  blankForm(): NewMoveForm {
    return {
      type: 'IN',
      date: new Date().toISOString().split('T')[0],
      contact: '',
      from: 'Vendor',
      to: 'WH/Stock1',
      product: '',
      quantity: null,
      unit: 'Units',
      status: 'Ready',
    };
  }

  openDrawer() {
    this.newMove = this.blankForm();
    this.formErrors.set({});
    this.didSubmit.set(false);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  private generateRef(type: 'IN' | 'OUT' | 'INTERNAL'): string {
    const prefix = type === 'IN' ? 'WH/IN' : type === 'OUT' ? 'WH/OUT' : 'WH/INT';
    const count = this.moves().filter(m => m.reference.startsWith(prefix)).length + 1;
    return `${prefix}/${String(count).padStart(4, '0')}`;
  }

  validate(): boolean {
    const e: Partial<Record<keyof NewMoveForm, string>> = {};
    if (!this.newMove.contact.trim())      e.contact = 'Contact is required';
    if (!this.newMove.product.trim())      e.product = 'Product is required';
    if (!this.newMove.quantity || this.newMove.quantity <= 0) e.quantity = 'Enter a valid quantity';
    if (this.newMove.from === this.newMove.to)  e.to = 'Origin and destination must differ';
    this.formErrors.set(e);
    return Object.keys(e).length === 0;
  }

  onTypeChange() {
    // Auto-set sensible defaults when type changes
    if (this.newMove.type === 'IN') {
      this.newMove.from = 'Vendor'; this.newMove.to = 'WH/Stock1';
    } else if (this.newMove.type === 'OUT') {
      this.newMove.from = 'WH/Stock1'; this.newMove.to = 'Vendor';
    } else {
      this.newMove.from = 'WH/Stock1'; this.newMove.to = 'WH/Stock2';
    }
  }

  saveMove() {
    this.didSubmit.set(true);
    if (!this.validate()) return;

    const move: StockMove = {
      id: crypto.randomUUID(),
      reference: this.generateRef(this.newMove.type),
      date: this.newMove.date,
      contact: this.newMove.contact.trim(),
      from: this.newMove.from,
      to: this.newMove.to,
      product: this.newMove.product.trim(),
      quantity: this.newMove.quantity!,
      unit: this.newMove.unit,
      status: this.newMove.status,
      type: this.newMove.type,
    };

    this.moves.update(list => [move, ...list]);
    this.closeDrawer();
  }

  err(field: keyof NewMoveForm): string {
    return this.formErrors()[field] ?? '';
  }

  /* ── Existing helpers ── */
  filteredMoves = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.statusFilter();
    return this.moves().filter(m => {
      const matchesSearch = !q || m.reference.toLowerCase().includes(q) || m.contact.toLowerCase().includes(q) || m.product.toLowerCase().includes(q);
      const matchesStatus = s === 'All' || m.status === s;
      return matchesSearch && matchesStatus;
    });
  });

  kanbanGroups = computed(() => {
    const groups: Record<string, StockMove[]> = { Ready: [], Waiting: [], Done: [], Cancelled: [] };
    for (const m of this.filteredMoves()) { groups[m.status]?.push(m); }
    return Object.entries(groups).map(([status, items]) => ({ status: status as MoveStatus, items }));
  });

  rowClass(move: StockMove): string {
    if (move.type === 'IN')      return 'border-l-4 border-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10';
    if (move.type === 'OUT')     return 'border-l-4 border-rose-400 bg-rose-50/30 dark:bg-rose-900/10';
    return 'border-l-4 border-indigo-300 bg-indigo-50/20 dark:bg-indigo-900/10';
  }

  refClass(move: StockMove): string {
    if (move.type === 'IN')  return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    if (move.type === 'OUT') return 'text-rose-600 dark:text-rose-400 font-semibold';
    return 'text-indigo-600 dark:text-indigo-400 font-semibold';
  }

  statusBadge(status: MoveStatus): string {
    const map: Record<MoveStatus, string> = {
      'Ready':     'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
      'Done':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      'Waiting':   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'Cancelled': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    };
    return map[status];
  }

  kanbanCardBorder(status: MoveStatus): string {
    const map: Record<MoveStatus, string> = {
      'Ready':     'border-t-4 border-t-sky-400',
      'Done':      'border-t-4 border-t-emerald-400',
      'Waiting':   'border-t-4 border-t-amber-400',
      'Cancelled': 'border-t-4 border-t-slate-300',
    };
    return map[status];
  }

  typeIcon(type: StockMove['type']): string {
    if (type === 'IN')   return 'M3 16l4-4m0 0l4 4m-4-4v12M21 8l-4 4m0 0l-4-4m4 4V4';
    if (type === 'OUT')  return 'M3 8l4-4m0 0l4 4M7 4v12m14 4l-4-4m0 0l-4 4m4-4V8';
    return 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4';
  }

  typeIconColor(type: StockMove['type']): string {
    if (type === 'IN')  return 'text-emerald-500';
    if (type === 'OUT') return 'text-rose-500';
    return 'text-indigo-500';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }
}
