import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* ─── Models ─── */
export type LocType = 'Internal' | 'View' | 'Input/Output' | 'Virtual';

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  type: 'Local' | 'Transit';
  active: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  locationType: LocType;
  parentLocation: string;
  active: boolean;
}

/* ─── Form models ─── */
type WarehouseForm = Omit<Warehouse, 'id' | 'createdAt'>;
type LocationForm  = Omit<Location, 'id'>;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {

  activeTab = signal<'warehouse' | 'location'>('warehouse');

  /* ═══ Warehouse state ═══ */
  warehouseDrawerOpen  = signal(false);
  warehouseEditTarget  = signal<string | null>(null);
  warehouseFormErrors  = signal<Partial<Record<keyof WarehouseForm, string>>>({});
  warehouseDeleteConfirm = signal<string | null>(null);

  warehouses = signal<Warehouse[]>([
    { id: 'wh1', name: 'Main Warehouse',    shortCode: 'WH',  address: '42 Industrial Blvd, Mumbai 400001', type: 'Local',   active: true,  createdAt: '2024-01-15' },
    { id: 'wh2', name: 'West Coast Store',  shortCode: 'WCS', address: '18 Harbour Rd, Pune 411001',        type: 'Local',   active: true,  createdAt: '2024-03-20' },
    { id: 'wh3', name: 'Transit Hub',       shortCode: 'TH',  address: '5 Gateway Complex, Navi Mumbai',    type: 'Transit', active: false, createdAt: '2024-06-01' },
  ]);

  warehouseForm: WarehouseForm = this.blankWarehouseForm();

  readonly warehouseTypes = ['Local', 'Transit'] as const;

  blankWarehouseForm(): WarehouseForm {
    return { name: '', shortCode: '', address: '', type: 'Local', active: true };
  }

  openAddWarehouse() {
    this.warehouseForm = this.blankWarehouseForm();
    this.warehouseEditTarget.set(null);
    this.warehouseFormErrors.set({});
    this.warehouseDrawerOpen.set(true);
  }

  openEditWarehouse(wh: Warehouse) {
    this.warehouseForm = { name: wh.name, shortCode: wh.shortCode, address: wh.address, type: wh.type, active: wh.active };
    this.warehouseEditTarget.set(wh.id);
    this.warehouseFormErrors.set({});
    this.warehouseDrawerOpen.set(true);
  }

  validateWarehouse(): boolean {
    const e: Partial<Record<keyof WarehouseForm, string>> = {};
    if (!this.warehouseForm.name.trim())      e.name      = 'Warehouse name is required';
    if (!this.warehouseForm.shortCode.trim()) e.shortCode = 'Short code is required';
    if (!this.warehouseForm.address.trim())   e.address   = 'Address is required';
    if (this.warehouseForm.shortCode.trim().length > 6) e.shortCode = 'Max 6 characters';
    this.warehouseFormErrors.set(e);
    return Object.keys(e).length === 0;
  }

  saveWarehouse() {
    if (!this.validateWarehouse()) return;
    const editId = this.warehouseEditTarget();
    if (editId) {
      this.warehouses.update(list => list.map(w =>
        w.id === editId ? { ...w, ...this.warehouseForm } : w
      ));
    } else {
      const newWh: Warehouse = {
        id: crypto.randomUUID(),
        ...this.warehouseForm,
        shortCode: this.warehouseForm.shortCode.toUpperCase(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.warehouses.update(list => [newWh, ...list]);
    }
    this.warehouseDrawerOpen.set(false);
  }

  confirmDeleteWarehouse(id: string) { this.warehouseDeleteConfirm.set(id); }
  cancelDeleteWarehouse()            { this.warehouseDeleteConfirm.set(null); }

  deleteWarehouse(id: string) {
    this.warehouses.update(list => list.filter(w => w.id !== id));
    // also remove linked locations
    this.locations.update(list => list.filter(l => l.warehouseId !== id));
    this.warehouseDeleteConfirm.set(null);
  }

  toggleWarehouseActive(wh: Warehouse) {
    this.warehouses.update(list => list.map(w => w.id === wh.id ? { ...w, active: !w.active } : w));
  }

  warehouseErr(f: keyof WarehouseForm): string { return this.warehouseFormErrors()[f] ?? ''; }

  /* ═══ Location state ═══ */
  locationDrawerOpen   = signal(false);
  locationEditTarget   = signal<string | null>(null);
  locationFormErrors   = signal<Partial<Record<keyof LocationForm, string>>>({});
  locationDeleteConfirm = signal<string | null>(null);
  locationSearch       = signal('');

  locations = signal<Location[]>([
    { id: 'loc1', name: 'Main Stock',    shortCode: 'STOCK1',   warehouseId: 'wh1', locationType: 'Internal', parentLocation: 'WH/Input',  active: true  },
    { id: 'loc2', name: 'Packing Zone',  shortCode: 'PACK',     warehouseId: 'wh1', locationType: 'Internal', parentLocation: 'WH/Output', active: true  },
    { id: 'loc3', name: 'Quality Check', shortCode: 'QC',       warehouseId: 'wh1', locationType: 'View',     parentLocation: 'WH/Input',  active: true  },
    { id: 'loc4', name: 'West Stock',    shortCode: 'WSTOCK1',  warehouseId: 'wh2', locationType: 'Internal', parentLocation: 'WCS/Input', active: true  },
    { id: 'loc5', name: 'Virtual Loc',   shortCode: 'VIRT',     warehouseId: 'wh1', locationType: 'Virtual',  parentLocation: '',          active: false },
  ]);

  locationForm: LocationForm = this.blankLocationForm();

  readonly locationTypes: LocType[] = ['Internal', 'View', 'Input/Output', 'Virtual'];

  filteredLocations = computed(() => {
    const q = this.locationSearch().toLowerCase();
    return this.locations().filter(l =>
      !q || l.name.toLowerCase().includes(q) || l.shortCode.toLowerCase().includes(q) || this.warehouseName(l.warehouseId).toLowerCase().includes(q)
    );
  });

  blankLocationForm(): LocationForm {
    return {
      name: '', shortCode: '',
      warehouseId: this.warehouses()[0]?.id ?? '',
      locationType: 'Internal',
      parentLocation: '',
      active: true,
    };
  }

  openAddLocation() {
    this.locationForm = this.blankLocationForm();
    this.locationEditTarget.set(null);
    this.locationFormErrors.set({});
    this.locationDrawerOpen.set(true);
  }

  openEditLocation(loc: Location) {
    this.locationForm = { ...loc };
    this.locationEditTarget.set(loc.id);
    this.locationFormErrors.set({});
    this.locationDrawerOpen.set(true);
  }

  validateLocation(): boolean {
    const e: Partial<Record<keyof LocationForm, string>> = {};
    if (!this.locationForm.name.trim())        e.name       = 'Location name is required';
    if (!this.locationForm.shortCode.trim())   e.shortCode  = 'Short code is required';
    if (!this.locationForm.warehouseId)        e.warehouseId= 'Please select a warehouse';
    this.locationFormErrors.set(e);
    return Object.keys(e).length === 0;
  }

  saveLocation() {
    if (!this.validateLocation()) return;
    const editId = this.locationEditTarget();
    if (editId) {
      this.locations.update(list => list.map(l => l.id === editId ? { ...l, ...this.locationForm } : l ));
    } else {
      this.locations.update(list => [{ id: crypto.randomUUID(), ...this.locationForm, shortCode: this.locationForm.shortCode.toUpperCase() }, ...list]);
    }
    this.locationDrawerOpen.set(false);
  }

  confirmDeleteLocation(id: string) { this.locationDeleteConfirm.set(id); }
  cancelDeleteLocation()            { this.locationDeleteConfirm.set(null); }
  deleteLocation(id: string)        { this.locations.update(l => l.filter(x => x.id !== id)); this.locationDeleteConfirm.set(null); }
  toggleLocationActive(loc: Location) { this.locations.update(list => list.map(l => l.id === loc.id ? { ...l, active: !l.active } : l)); }
  locationErr(f: keyof LocationForm): string { return this.locationFormErrors()[f] ?? ''; }

  /* ═══ Shared helpers ═══ */
  warehouseName(id: string): string {
    return this.warehouses().find(w => w.id === id)?.name ?? '—';
  }

  locTypeBadge(t: LocType): string {
    const map: Record<LocType, string> = {
      'Internal':    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'View':        'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
      'Input/Output':'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
      'Virtual':     'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    };
    return map[t];
  }

  warehouseTypeBadge(t: 'Local' | 'Transit'): string {
    return t === 'Local'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onLocSearch(e: Event) { this.locationSearch.set((e.target as HTMLInputElement).value); }
}
