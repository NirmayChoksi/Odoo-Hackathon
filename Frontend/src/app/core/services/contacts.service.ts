import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  private get headers() {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('sf_token')}`);
  }

  /* ═══ Suppliers ═══ */
  getSuppliers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/suppliers`, { headers: this.headers });
  }
  createSupplier(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/suppliers`, data, { headers: this.headers });
  }
  updateSupplier(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/suppliers/${id}`, data, { headers: this.headers });
  }
  deleteSupplier(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/suppliers/${id}`, { headers: this.headers });
  }

  /* ═══ Customers ═══ */
  getCustomers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customers`, { headers: this.headers });
  }
  createCustomer(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/customers`, data, { headers: this.headers });
  }
  updateCustomer(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/customers/${id}`, data, { headers: this.headers });
  }
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/customers/${id}`, { headers: this.headers });
  }
}
