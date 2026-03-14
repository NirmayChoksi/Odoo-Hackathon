import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  type: 'Local' | 'Transit';
  active: boolean;
  createdAt: string;
}

export type LocType = 'Internal' | 'View' | 'Input/Output' | 'Virtual';

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  locationType: LocType;
  parentLocation: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  private get headers() {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('sf_token')}`);
  }

  /* ═══ Warehouses ═══ */
  getWarehouses(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/warehouses`, { headers: this.headers });
  }

  createWarehouse(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/warehouses`, data, { headers: this.headers });
  }

  updateWarehouse(id: number | string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/warehouses/${id}`, data, { headers: this.headers });
  }

  deleteWarehouse(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/warehouses/${id}`, { headers: this.headers });
  }

  /* ═══ Locations ═══ */
  getLocations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/locations`, { headers: this.headers });
  }

  createLocation(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/locations`, data, { headers: this.headers });
  }

  updateLocation(id: number | string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/locations/${id}`, data, { headers: this.headers });
  }

  deleteLocation(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/locations/${id}`, { headers: this.headers });
  }

  /* ═══ Categories ═══ */
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`, { headers: this.headers });
  }

  createCategory(data: { name: string; description?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, data, { headers: this.headers });
  }

  updateCategory(id: number | string, data: { name?: string; description?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, data, { headers: this.headers });
  }

  deleteCategory(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${id}`, { headers: this.headers });
  }
}
