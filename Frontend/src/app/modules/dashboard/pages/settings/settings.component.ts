import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Warehouse, Location, LocType, Category } from '../../../../core/services/settings.service';



/* ─── Form models ─── */
type WarehouseForm = Omit<Warehouse, 'id' | 'createdAt'>;
type LocationForm  = Omit<Location, 'id'>;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {

  private svc = inject(SettingsService);

  activeTab = signal<'warehouse' | 'location' | 'category'>('warehouse');

  /* ═══ Warehouse state ═══ */
  warehouseDrawerOpen  = signal(false);
  warehouseEditTarget  = signal<string | null>(null);
  warehouseFormErrors  = signal<Partial<Record<keyof WarehouseForm, string>>>({});
  warehouseDeleteConfirm = signal<string | null>(null);

  warehouses = signal<Warehouse[]>([]);

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
    
    // Convert form to snake_case for backend
    const payload = {
      name: this.warehouseForm.name,
      short_code: this.warehouseForm.shortCode.toUpperCase(),
      address: this.warehouseForm.address,
      type: this.warehouseForm.type,
      active: this.warehouseForm.active
    };

    if (editId) {
      this.svc.updateWarehouse(editId, payload).subscribe((res: any) => {
        if(res.success) {
          this.loadWarehouses();
          this.warehouseDrawerOpen.set(false);
        }
      });
    } else {
      this.svc.createWarehouse(payload).subscribe((res: any) => {
        if(res.success) {
          this.loadWarehouses();
          this.warehouseDrawerOpen.set(false);
        }
      });
    }
  }

  confirmDeleteWarehouse(id: string) { this.warehouseDeleteConfirm.set(id); }
  cancelDeleteWarehouse()            { this.warehouseDeleteConfirm.set(null); }

  deleteWarehouse(id: string) {
    this.svc.deleteWarehouse(id).subscribe((res: any) => {
      if(res.success) {
        this.loadWarehouses();
        this.loadLocations(); // also refresh linked locations
        this.warehouseDeleteConfirm.set(null);
      }
    });
  }

  toggleWarehouseActive(wh: Warehouse) {
    this.svc.updateWarehouse(wh.id, { active: !wh.active }).subscribe((res: any) => {
      if(res.success) this.loadWarehouses();
    });
  }

  warehouseErr(f: keyof WarehouseForm): string { return this.warehouseFormErrors()[f] ?? ''; }

  /* ═══ Location state ═══ */
  locationDrawerOpen   = signal(false);
  locationEditTarget   = signal<string | null>(null);
  locationFormErrors   = signal<Partial<Record<keyof LocationForm, string>>>({});
  locationDeleteConfirm = signal<string | null>(null);
  locationSearch       = signal('');

  locations = signal<Location[]>([]);

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
    
    const payload = {
      name: this.locationForm.name,
      short_code: this.locationForm.shortCode.toUpperCase(),
      warehouse_id: this.locationForm.warehouseId,
      location_type: this.locationForm.locationType,
      parent_location: this.locationForm.parentLocation,
      active: this.locationForm.active
    };

    if (editId) {
      this.svc.updateLocation(editId, payload).subscribe((res: any) => {
        if(res.success) {
          this.loadLocations();
          this.locationDrawerOpen.set(false);
        }
      });
    } else {
      this.svc.createLocation(payload).subscribe((res: any) => {
        if(res.success) {
          this.loadLocations();
          this.locationDrawerOpen.set(false);
        }
      });
    }
  }

  confirmDeleteLocation(id: string) { this.locationDeleteConfirm.set(id); }
  cancelDeleteLocation()            { this.locationDeleteConfirm.set(null); }
  
  deleteLocation(id: string) { 
    this.svc.deleteLocation(id).subscribe((res: any) => {
      if(res.success) {
        this.loadLocations();
        this.locationDeleteConfirm.set(null);
      }
    });
  }

  toggleLocationActive(loc: Location) { 
    this.svc.updateLocation(loc.id, { active: !loc.active }).subscribe((res: any) => {
      if(res.success) this.loadLocations();
    });
  }
  locationErr(f: keyof LocationForm): string { return this.locationFormErrors()[f] ?? ''; }

  /* ═══ Category state ═══ */
  categoryDrawerOpen   = signal(false);
  categoryEditTarget   = signal<string | null>(null);
  categoryFormErrors   = signal<{ name?: string }>({});
  categoryDeleteConfirm = signal<string | null>(null);

  categories = signal<Category[]>([]);

  categoryForm = { name: '', description: '' };

  openAddCategory() {
    this.categoryForm = { name: '', description: '' };
    this.categoryEditTarget.set(null);
    this.categoryFormErrors.set({});
    this.categoryDrawerOpen.set(true);
  }

  openEditCategory(cat: Category) {
    this.categoryForm = { name: cat.name, description: cat.description || '' };
    this.categoryEditTarget.set(cat.id);
    this.categoryFormErrors.set({});
    this.categoryDrawerOpen.set(true);
  }

  validateCategory(): boolean {
    const e: { name?: string } = {};
    if (!this.categoryForm.name.trim()) e.name = 'Category name is required';
    this.categoryFormErrors.set(e);
    return Object.keys(e).length === 0;
  }

  saveCategory() {
    if (!this.validateCategory()) return;
    const payload = { name: this.categoryForm.name.trim(), description: this.categoryForm.description.trim() };
    const editId = this.categoryEditTarget();
    if (editId) {
      this.svc.updateCategory(editId, payload).subscribe((res: any) => {
        if (res.success) { this.loadCategories(); this.categoryDrawerOpen.set(false); }
      });
    } else {
      this.svc.createCategory(payload).subscribe((res: any) => {
        if (res.success) { this.loadCategories(); this.categoryDrawerOpen.set(false); }
        else this.categoryFormErrors.set({ name: res.message });
      });
    }
  }

  confirmDeleteCategory(id: string) { this.categoryDeleteConfirm.set(id); }
  cancelDeleteCategory()            { this.categoryDeleteConfirm.set(null); }

  deleteCategory(id: string) {
    this.svc.deleteCategory(id).subscribe((res: any) => {
      if (res.success) { this.loadCategories(); this.categoryDeleteConfirm.set(null); }
    });
  }

  categoryErr(f: keyof { name: string }): string { return this.categoryFormErrors()[f] ?? ''; }

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
  
  /* ═══ Data Init ═══ */
  ngOnInit() {
    this.loadWarehouses();
    this.loadLocations();
    this.loadCategories();
  }

  loadWarehouses() {
    this.svc.getWarehouses().subscribe((res: any) => {
      if(res.success) {
        // Map backend snake_case to frontend camelCase expectations
        const mapped = res.data.map((w: any) => ({
          ...w,
          shortCode: w.short_code,
          createdAt: w.created_at || new Date().toISOString()
        }));
        this.warehouses.set(mapped);
      }
    });
  }

  loadLocations() {
    this.svc.getLocations().subscribe((res: any) => {
      if(res.success) {
        const mapped = res.data.map((l: any) => ({
          ...l,
          shortCode: l.short_code,
          warehouseId: l.warehouse_id,
          locationType: (l.location_type || 'Internal') as LocType,
          parentLocation: l.parent_location || ''
        }));
        this.locations.set(mapped);
      }
    });
  }

  loadCategories() {
    this.svc.getCategories().subscribe((res: any) => {
      if (res.success) this.categories.set(res.data);
    });
  }
}
