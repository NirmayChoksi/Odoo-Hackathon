import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DeliveryStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled';

export interface DeliveryProductLine {
  id: number;
  product_id: number;
  product: string;
  quantity: number;
  inStock: boolean;
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
  customer_id?: number;
  warehouse_id?: number;
  products: DeliveryProductLine[];
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly BASE = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('sf_token') ?? ''}`);
  }

  mapStatus(s: string): DeliveryStatus {
    const m: Record<string, DeliveryStatus> = {
      draft: 'Draft',
      picking: 'Waiting',
      packing: 'Waiting',
      ready: 'Ready',
      done: 'Done',
      cancelled: 'Cancelled',
    };
    return m[s] ?? 'Draft';
  }

  mapToFrontend(d: any, customers: any[] = [], warehouses: any[] = []): Delivery {
    const customer = customers.find((c) => Number(c.id) === Number(d.customer_id));
    const warehouse = warehouses.find((w) => Number(w.id) === Number(d.warehouse_id));
    return {
      id: String(d.id),
      reference: `WH/OUT/${String(d.id).padStart(4, '0')}`,
      from: warehouse?.name ?? `Warehouse #${d.warehouse_id}`,
      to: customer?.name ?? `Customer #${d.customer_id}`,
      contact: customer?.name ?? `Customer #${d.customer_id}`,
      deliveryAddress: customer?.address ?? '',
      scheduleDate: d.created_at ? d.created_at.split('T')[0] : '',
      responsible: d.responsible ?? `User #${d.created_by}`,
      operationType: 'Delivery Orders',
      status: this.mapStatus(d.status),
      customer_id: d.customer_id,
      warehouse_id: d.warehouse_id,
      products: (d.items ?? []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product: item.product_name ?? `Product #${item.product_id}`,
        quantity: Number(item.quantity),
        inStock: true,
      })),
    };
  }

  list(): Observable<any> {
    return this.http.get<any>(`${this.BASE}/deliveries`, { headers: this.headers });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.BASE}/deliveries/${id}`, { headers: this.headers });
  }

  create(payload: { customer_id: number; warehouse_id: number }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/deliveries`, payload, { headers: this.headers });
  }

  addItem(deliveryId: string, payload: { product_id: number; quantity: number }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/deliveries/${deliveryId}/items`, payload, { headers: this.headers });
  }

  removeItem(deliveryId: string, itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE}/deliveries/${deliveryId}/items/${itemId}`, { headers: this.headers });
  }

  updateStatus(deliveryId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.BASE}/deliveries/${deliveryId}/status`, { status }, { headers: this.headers });
  }

  validate(deliveryId: string): Observable<any> {
    return this.http.post<any>(`${this.BASE}/deliveries/${deliveryId}/validate`, {}, { headers: this.headers });
  }

  cancel(deliveryId: string): Observable<any> {
    return this.http.post<any>(`${this.BASE}/deliveries/${deliveryId}/cancel`, {}, { headers: this.headers });
  }
}
