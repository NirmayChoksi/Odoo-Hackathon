import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface RefItem {
  id: number;
  name: string;
  type?: string;
  warehouse_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MoveHistoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  private get headers() {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('sf_token')}`);
  }

  getProducts(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/products`, { headers: this.headers }); }
  getLocations(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/locations`, { headers: this.headers }); }
  getSuppliers(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/suppliers`, { headers: this.headers }); }
  getCustomers(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/customers`, { headers: this.headers }); }
  getWarehouses(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/warehouses`, { headers: this.headers }); }

  getUnifiedMoves(): Observable<any[]> {
    const opts = { headers: this.headers };
    return forkJoin({
      receipts: this.http.get<any>(`${this.apiUrl}/receipts`, opts).pipe(catchError(() => of({data:[]}))),
      deliveries: this.http.get<any>(`${this.apiUrl}/deliveries`, opts).pipe(catchError(() => of({data:[]}))),
      transfers: this.http.get<any>(`${this.apiUrl}/transfers`, opts).pipe(catchError(() => of({data:[]}))),
    }).pipe(
      switchMap(res => {
        const rcpts = (res.receipts?.data || []).map((r:any) => this.http.get<any>(`${this.apiUrl}/receipts/${r.id}`, opts).pipe(catchError(()=>of(null))));
        const dlvs = (res.deliveries?.data || []).map((r:any) => this.http.get<any>(`${this.apiUrl}/deliveries/${r.id}`, opts).pipe(catchError(()=>of(null))));
        const trns = (res.transfers?.data || []).map((r:any) => this.http.get<any>(`${this.apiUrl}/transfers/${r.id}`, opts).pipe(catchError(()=>of(null))));
        
        const allObs = [...rcpts, ...dlvs, ...trns];
        if (allObs.length === 0) return of([]);
        return forkJoin(allObs);
      })
    );
  }

  createReceipt(supplier_id: number, warehouse_id: number, product_id: number, quantity: number): Observable<any> {
    const opts = { headers: this.headers };
    return this.http.post<any>(`${this.apiUrl}/receipts`, { supplier_id, warehouse_id }, opts).pipe(
      switchMap(res => {
        if (!res.success) throw new Error(res.message);
        return this.http.post<any>(`${this.apiUrl}/receipts/${res.data.id}/items`, { product_id, quantity }, opts);
      })
    );
  }

  createDelivery(customer_id: number, warehouse_id: number, product_id: number, quantity: number): Observable<any> {
    const opts = { headers: this.headers };
    return this.http.post<any>(`${this.apiUrl}/deliveries`, { customer_id, warehouse_id }, opts).pipe(
      switchMap(res => {
        if (!res.success) throw new Error(res.message);
        return this.http.post<any>(`${this.apiUrl}/deliveries/${res.data.id}/items`, { product_id, quantity }, opts);
      })
    );
  }

  createTransfer(from_location: number, to_location: number, product_id: number, quantity: number): Observable<any> {
    const opts = { headers: this.headers };
    return this.http.post<any>(`${this.apiUrl}/transfers`, { from_location, to_location }, opts).pipe(
      switchMap(res => {
        if (!res.success) throw new Error(res.message);
        return this.http.post<any>(`${this.apiUrl}/transfers/${res.data.id}/items`, { product_id, quantity }, opts);
      })
    );
  }
}
