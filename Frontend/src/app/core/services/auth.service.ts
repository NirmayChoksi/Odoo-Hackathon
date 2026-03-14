import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LoginData {
  loginId: string;
  password: string;
}

export interface RegisterData {
  loginId: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  private _resetEmail = signal('');

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly resetEmail = this._resetEmail.asReadonly();

  login(data: LoginData): Observable<{ token: string }> {
    return of({ token: 'mock-jwt-token-xyz' }).pipe(delay(1200));
  }

  register(data: RegisterData): Observable<{ message: string }> {
    return of({ message: 'Registration successful' }).pipe(delay(1200));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    this._resetEmail.set(email);
    return of({ message: 'OTP sent to your email' }).pipe(delay(1200));
  }

  verifyOtp(otp: string): Observable<{ verified: boolean }> {
    return of({ verified: true }).pipe(delay(1200));
  }

  resetPassword(password: string): Observable<{ message: string }> {
    return of({ message: 'Password reset successful' }).pipe(delay(1200));
  }

  setLoggedIn(value: boolean): void {
    this._isLoggedIn.set(value);
    if (value) {
      localStorage.setItem('sf_token', 'mock-jwt-token-xyz');
    } else {
      localStorage.removeItem('sf_token');
    }
  }

  checkAuth(): boolean {
    return !!localStorage.getItem('sf_token');
  }
}
