import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LedgerEntry {
  id: number;
  product_id: number;
  warehouse_id: number;
  location_id: number;
  movement_type: 'RECEIPT' | 'DELIVERY' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';
  quantity: string;
  reference_type: string;
  reference_id: number;
  created_at: string;
}

export interface LedgerResponse {
  success: boolean;
  data: LedgerEntry[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface LedgerFilters {
  product_id?: number;
  location_id?: number;
  warehouse_id?: number;
  movement_type?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly BASE_URL = 'http://localhost:3000/api/stock';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('sf_token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getLedger(filters: LedgerFilters = {}): Observable<LedgerResponse> {
    let params = new HttpParams();
    if (filters.product_id)    params = params.set('product_id',    filters.product_id);
    if (filters.location_id)   params = params.set('location_id',   filters.location_id);
    if (filters.warehouse_id)  params = params.set('warehouse_id',  filters.warehouse_id);
    if (filters.movement_type) params = params.set('movement_type', filters.movement_type);
    if (filters.page)          params = params.set('page',          filters.page);
    if (filters.limit)         params = params.set('limit',         filters.limit);

    return this.http.get<LedgerResponse>(`${this.BASE_URL}/ledger`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
