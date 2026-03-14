import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactsService, Contact } from '../../../../core/services/contacts.service';

type ContactTab = 'supplier' | 'customer';
type ContactForm = Omit<Contact, 'id'>;

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent implements OnInit {
  private svc = inject(ContactsService);

  activeTab = signal<ContactTab>('supplier');

  suppliers = signal<Contact[]>([]);
  customers = signal<Contact[]>([]);

  drawerOpen     = signal(false);
  editTarget     = signal<string | null>(null);
  formErrors     = signal<Partial<Record<keyof ContactForm, string>>>({});
  deleteConfirm  = signal<string | null>(null);
  search         = signal('');

  form: ContactForm = this.blankForm();

  blankForm(): ContactForm {
    return { name: '', email: '', phone: '', address: '' };
  }

  filteredList = computed(() => {
    const q = this.search().toLowerCase();
    const list = this.activeTab() === 'supplier' ? this.suppliers() : this.customers();
    return !q ? list : list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  tabLabel = computed(() => this.activeTab() === 'supplier' ? 'Supplier' : 'Customer');

  switchTab(tab: ContactTab) {
    this.activeTab.set(tab);
    this.search.set('');
    this.closeDrawer();
    this.deleteConfirm.set(null);
  }

  openAdd() {
    this.form = this.blankForm();
    this.editTarget.set(null);
    this.formErrors.set({});
    this.drawerOpen.set(true);
  }

  openEdit(c: Contact) {
    this.form = { name: c.name, email: c.email, phone: c.phone, address: c.address };
    this.editTarget.set(c.id);
    this.formErrors.set({});
    this.drawerOpen.set(true);
  }

  closeDrawer() { this.drawerOpen.set(false); }

  validate(): boolean {
    const e: Partial<Record<keyof ContactForm, string>> = {};
    if (!this.form.name.trim()) e.name = 'Name is required';
    if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email))
      e.email = 'Enter a valid email address';
    this.formErrors.set(e);
    return Object.keys(e).length === 0;
  }

  save() {
    if (!this.validate()) return;
    const payload = {
      name:    this.form.name.trim(),
      email:   this.form.email.trim(),
      phone:   this.form.phone.trim(),
      address: this.form.address.trim(),
    };
    const editId = this.editTarget();
    const isSupplier = this.activeTab() === 'supplier';

    if (editId) {
      const call = isSupplier
        ? this.svc.updateSupplier(editId, payload)
        : this.svc.updateCustomer(editId, payload);
      call.subscribe((res: any) => {
        if (res.success) { this.load(); this.closeDrawer(); }
      });
    } else {
      const call = isSupplier
        ? this.svc.createSupplier(payload)
        : this.svc.createCustomer(payload);
      call.subscribe((res: any) => {
        if (res.success) { this.load(); this.closeDrawer(); }
      });
    }
  }

  confirmDelete(id: string) { this.deleteConfirm.set(id); }
  cancelDelete()            { this.deleteConfirm.set(null); }

  doDelete(id: string) {
    const call = this.activeTab() === 'supplier'
      ? this.svc.deleteSupplier(id)
      : this.svc.deleteCustomer(id);
    call.subscribe((res: any) => {
      if (res.success) { this.load(); this.deleteConfirm.set(null); }
    });
  }

  err(f: keyof ContactForm): string { return this.formErrors()[f] ?? ''; }

  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }

  ngOnInit() { this.load(); }

  load() {
    this.svc.getSuppliers().subscribe((res: any) => {
      if (res.success) this.suppliers.set(res.data ?? []);
    });
    this.svc.getCustomers().subscribe((res: any) => {
      if (res.success) this.customers.set(res.data ?? []);
    });
  }
}
