import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BalanceRow {
  id: number;
  product_id: number;
  location_id: number;
  quantity: string;
  reserved_quantity: string;
  product_name: string;
  sku: string;
  unit: string;
  reorder_level: string;
  unit_price: string;
  category: string;
  location_name: string;
  warehouse_id: number;
  warehouse_name: string;
}

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
  private readonly BASE_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('sf_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token ?? ''}`);
  }

  /* ── Stock ── */
  getBalances(filters: { product_id?: number; location_id?: number; warehouse_id?: number } = {}): Observable<{ success: boolean; data: BalanceRow[] }> {
    let params = new HttpParams();
    if (filters.product_id)   params = params.set('product_id',   filters.product_id);
    if (filters.location_id)  params = params.set('location_id',  filters.location_id);
    if (filters.warehouse_id) params = params.set('warehouse_id', filters.warehouse_id);
    return this.http.get<any>(`${this.BASE_URL}/stock/balances`, { headers: this.getHeaders(), params });
  }

  getLedger(filters: LedgerFilters = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.product_id)    params = params.set('product_id',    filters.product_id);
    if (filters.location_id)   params = params.set('location_id',   filters.location_id);
    if (filters.warehouse_id)  params = params.set('warehouse_id',  filters.warehouse_id);
    if (filters.movement_type) params = params.set('movement_type', filters.movement_type);
    if (filters.page)          params = params.set('page',          filters.page);
    if (filters.limit)         params = params.set('limit',         filters.limit);
    return this.http.get<any>(`${this.BASE_URL}/stock/ledger`, { headers: this.getHeaders(), params });
  }

  /* ── Categories ── */
  getCategories(): Observable<{ success: boolean; data: { id: number; name: string }[] }> {
    return this.http.get<any>(`${this.BASE_URL}/categories`, { headers: this.getHeaders() });
  }

  /* ── Locations ── */
  getLocations(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<any>(`${this.BASE_URL}/locations`, { headers: this.getHeaders() });
  }

  updateProduct(id: number, payload: {
    unit_price?: number;
    reorder_level?: number;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.put<any>(`${this.BASE_URL}/products/${id}`, payload, { headers: this.getHeaders() });
  }

  updateBalance(balanceId: number, payload: {
    quantity: number;
    reserved_quantity: number;
    note?: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.put<any>(`${this.BASE_URL}/stock/balances/${balanceId}`, payload, { headers: this.getHeaders() });
  }

  /* ── Products ── */
  createProduct(payload: {
    name: string;
    sku: string;
    category_id: number;
    unit: string;
    reorder_level?: number;
    unit_price?: number;
    initial_stock?: number;
    initial_location_id?: number;
    initial_reserved?: number;
  }): Observable<{ success: boolean; message: string; data?: any }> {
    return this.http.post<any>(`${this.BASE_URL}/products`, payload, { headers: this.getHeaders() });
  }
}
