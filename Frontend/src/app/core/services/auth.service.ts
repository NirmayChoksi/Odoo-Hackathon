import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginData {
  loginId: string;
  password: string;
}

export interface RegisterData {
  loginId: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface CurrentUser {
  id: number;
  loginId: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  
  private _isLoggedIn = signal(false);
  private _resetEmail = signal('');
  private _resetToken = signal('');

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly resetEmail = this._resetEmail.asReadonly();
  readonly resetToken = this._resetToken.asReadonly();

  constructor(private http: HttpClient) {
    this._isLoggedIn.set(this.checkAuth());
  }

  login(data: LoginData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, data).pipe(
      tap(res => {
        // Robust check for res.success and nested data.token
        if (res && res.success && res.data?.token) {
          this.setLoggedIn(true, res.data.token);
        } else {
          // If login call finishes but token is missing, ensure we aren't "half-logged-in"
          this.setLoggedIn(false);
        }
      })
    );
  }

  register(data: RegisterData): Observable<any> {
    // Backend expects confirmPassword, defaulting to password if not provided
    const payload = {
      ...data,
      confirmPassword: data.confirmPassword || data.password
    };
    return this.http.post<any>(`${this.API_URL}/register`, payload);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/forgot-password`, { email }).pipe(
      tap(() => this._resetEmail.set(email))
    );
  }

  verifyOtp(otp: string): Observable<any> {
    const email = this._resetEmail();
    return this.http.post<any>(`${this.API_URL}/verify-otp`, { email, otp }).pipe(
      tap(res => {
        if (res.success && res.data && res.data.resetToken) {
          this._resetToken.set(res.data.resetToken);
        }
      })
    );
  }

  resetPassword(password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/reset-password`, { 
      resetToken: this._resetToken(),
      password,
      confirmPassword: password 
    });
  }

  setLoggedIn(value: boolean, token?: string): void {
    this._isLoggedIn.set(value);
    if (value && token) {
      localStorage.setItem('sf_token', token);
    } else if (!value) {
      localStorage.removeItem('sf_token');
    }
  }

  checkAuth(): boolean {
    const token = localStorage.getItem('sf_token');
    return !!token;
  }

  getCurrentUser(): CurrentUser | null {
    const token = localStorage.getItem('sf_token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as CurrentUser;
    } catch {
      return null;
    }
  }

  getInitials(loginId: string): string {
    const parts = loginId.trim().split(/[\s_\-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return loginId.slice(0, 2).toUpperCase();
  }
}
