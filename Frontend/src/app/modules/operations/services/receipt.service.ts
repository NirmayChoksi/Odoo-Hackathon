import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReceiptStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled';

export interface ProductLine {
  id: number;
  product_id: number;
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
  supplier_id?: number;
  warehouse_id?: number;
  products: ProductLine[];
}

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly BASE = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('sf_token') ?? ''}`);
  }

  mapStatus(s: string): ReceiptStatus {
    const m: Record<string, ReceiptStatus> = {
      draft: 'Draft',
      waiting: 'Waiting',
      ready: 'Ready',
      done: 'Done',
      cancelled: 'Cancelled',
    };
    return m[s] ?? 'Draft';
  }

  mapToFrontend(r: any, suppliers: any[] = [], warehouses: any[] = []): Receipt {
    const supplier = suppliers.find((s) => Number(s.id) === Number(r.supplier_id));
    const warehouse = warehouses.find((w) => Number(w.id) === Number(r.warehouse_id));
    return {
      id: String(r.id),
      reference: `WH/IN/${String(r.id).padStart(4, '0')}`,
      from: supplier?.name ?? `Supplier #${r.supplier_id}`,
      to: warehouse?.name ?? `Warehouse #${r.warehouse_id}`,
      contact: supplier?.name ?? `Supplier #${r.supplier_id}`,
      scheduleDate: r.created_at ? r.created_at.split('T')[0] : '',
      responsible: r.responsible ?? `User #${r.created_by}`,
      status: this.mapStatus(r.status),
      supplier_id: r.supplier_id,
      warehouse_id: r.warehouse_id,
      products: (r.items ?? []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product: item.product_name ?? `Product #${item.product_id}`,
        quantity: Number(item.quantity),
      })),
    };
  }

  list(): Observable<any> {
    return this.http.get<any>(`${this.BASE}/receipts`, { headers: this.headers });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.BASE}/receipts/${id}`, { headers: this.headers });
  }

  create(payload: { supplier_id: number; warehouse_id: number }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/receipts`, payload, { headers: this.headers });
  }

  addItem(receiptId: string, payload: { product_id: number; quantity: number }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/receipts/${receiptId}/items`, payload, { headers: this.headers });
  }

  removeItem(receiptId: string, itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE}/receipts/${receiptId}/items/${itemId}`, { headers: this.headers });
  }

  updateStatus(receiptId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.BASE}/receipts/${receiptId}/status`, { status }, { headers: this.headers });
  }

  validate(receiptId: string): Observable<any> {
    return this.http.post<any>(`${this.BASE}/receipts/${receiptId}/validate`, {}, { headers: this.headers });
  }

  cancel(receiptId: string): Observable<any> {
    return this.http.post<any>(`${this.BASE}/receipts/${receiptId}/cancel`, {}, { headers: this.headers });
  }
}
