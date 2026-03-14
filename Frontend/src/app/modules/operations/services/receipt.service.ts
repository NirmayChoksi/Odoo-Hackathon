import { Injectable, signal } from '@angular/core';

export type ReceiptStatus = 'Draft' | 'Ready' | 'Done';

export interface ProductLine {
  id: number;
  product: string;
  quantity: number;
}

export interface Receipt {
  id: string;
  reference: string;
  from: string;
  to: string;
  contact: string;
  scheduleDate: string;
  responsible: string;
  status: ReceiptStatus;
  products: ProductLine[];
}

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private _receipts = signal<Receipt[]>([
    {
      id: '1',
      reference: 'WH/IN/0001',
      from: 'Vendor',
      to: 'WH/Stock1',
      contact: 'Azure Interior',
      scheduleDate: '2026-03-15',
      responsible: 'John Doe',
      status: 'Ready',
      products: [{ id: 1, product: '[DESK001] Desk', quantity: 6 }]
    },
    {
      id: '2',
      reference: 'WH/IN/0002',
      from: 'Vendor',
      to: 'WH/Stock1',
      contact: 'Azure Interior',
      scheduleDate: '2026-03-16',
      responsible: 'John Doe',
      status: 'Ready',
      products: [{ id: 2, product: '[DESK002] Chair', quantity: 12 }]
    },
    {
      id: '3',
      reference: 'WH/IN/0003',
      from: 'Vendor',
      to: 'WH/Stock2',
      contact: 'Deco Addict',
      scheduleDate: '2026-03-18',
      responsible: 'John Doe',
      status: 'Draft',
      products: []
    }
  ]);

  readonly receipts = this._receipts.asReadonly();

  getReceipt(id: string): Receipt | undefined {
    return this._receipts().find(r => r.id === id);
  }

  generateNextReference(): string {
    const refs = this._receipts().map(r => {
      const parts = r.reference.split('/');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(n => !isNaN(n));
    
    const max = refs.length > 0 ? Math.max(...refs) : 0;
    const next = max + 1;
    return `WH/IN/${next.toString().padStart(4, '0')}`;
  }

  generateNextId(): string {
      const ids = this._receipts().map(r => parseInt(r.id, 10)).filter(n => !isNaN(n));
      const max = ids.length > 0 ? Math.max(...ids) : 0;
      return (max + 1).toString();
  }

  saveReceipt(receipt: Receipt): void {
    const exists = this._receipts().find(r => r.id === receipt.id);
    if (exists) {
      this._receipts.update(list => list.map(r => r.id === receipt.id ? receipt : r));
    } else {
      this._receipts.update(list => [receipt, ...list]); // Prepend new receipts
    }
  }

  deleteReceipt(id: string): void {
    this._receipts.update(list => list.filter(r => r.id !== id));
  }
}
