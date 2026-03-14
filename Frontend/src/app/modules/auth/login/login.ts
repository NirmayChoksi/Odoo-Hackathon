import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      loginId: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  get loginId() { return this.loginForm.get('loginId')!; }
  get password() { return this.loginForm.get('password')!; }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    const { loginId, password } = this.loginForm.value;

    this.authService.login({ loginId, password }).subscribe({
      next: () => {
        this.authService.setLoggedIn(true);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage.set('Invalid Login ID or Password. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
