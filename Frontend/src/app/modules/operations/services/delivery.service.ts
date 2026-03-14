import { Injectable, signal } from '@angular/core';

export type DeliveryStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done';

export interface DeliveryProductLine {
  id: number;
  product: string;
  quantity: number;
  inStock: boolean; // If false, highlight row in red
}

export interface Delivery {
  id: string;
  reference: string;
  from: string;
  to: string;
  contact: string;
  deliveryAddress: string;
  scheduleDate: string;
  responsible: string;
  operationType: string;
  status: DeliveryStatus;
  products: DeliveryProductLine[];
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private _deliveries = signal<Delivery[]>([
    {
      id: '1',
      reference: 'WH/OUT/0001',
      from: 'WH/Stock1',
      to: 'Vendor',
      contact: 'Azure Interior',
      deliveryAddress: '69 rue de la République, Lyon, 69001',
      scheduleDate: '2026-03-15',
      responsible: 'John Doe',
      operationType: 'Delivery Orders',
      status: 'Ready',
      products: [
        { id: 1, product: '[DESK001] Desk', quantity: 6, inStock: true }
      ]
    },
    {
      id: '2',
      reference: 'WH/OUT/0002',
      from: 'WH/Stock1',
      to: 'Vendor',
      contact: 'Azure Interior',
      deliveryAddress: '12 avenue Montaigne, Paris, 75008',
      scheduleDate: '2026-03-16',
      responsible: 'John Doe',
      operationType: 'Delivery Orders',
      status: 'Ready',
      products: [
        { id: 1, product: '[CHAIR001] Office Chair', quantity: 4, inStock: false }
      ]
    }
  ]);

  readonly deliveries = this._deliveries.asReadonly();

  getDelivery(id: string): Delivery | undefined {
    return this._deliveries().find(d => d.id === id);
  }

  generateNextReference(): string {
    const refs = this._deliveries().map(d => {
      const parts = d.reference.split('/');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(n => !isNaN(n));

    const max = refs.length > 0 ? Math.max(...refs) : 0;
    return `WH/OUT/${(max + 1).toString().padStart(4, '0')}`;
  }

  generateNextId(): string {
    const ids = this._deliveries().map(d => parseInt(d.id, 10)).filter(n => !isNaN(n));
    const max = ids.length > 0 ? Math.max(...ids) : 0;
    return (max + 1).toString();
  }

  saveDelivery(delivery: Delivery): void {
    const exists = this._deliveries().find(d => d.id === delivery.id);
    if (exists) {
      this._deliveries.update(list => list.map(d => d.id === delivery.id ? delivery : d));
    } else {
      this._deliveries.update(list => [delivery, ...list]);
    }
  }

  deleteDelivery(id: string): void {
    this._deliveries.update(list => list.filter(d => d.id !== id));
  }
}
