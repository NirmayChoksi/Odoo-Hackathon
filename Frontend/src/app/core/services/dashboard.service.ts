import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardKPIs {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    kpis: DashboardKPIs;
    alerts: any;
    recent: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(warehouseId?: number): Observable<DashboardResponse> {
    const token = localStorage.getItem('sf_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let url = this.API_URL;
    if (warehouseId !== undefined) {
      url += `?warehouse_id=${warehouseId}`;
    }

    return this.http.get<DashboardResponse>(url, { headers });
  }
}
