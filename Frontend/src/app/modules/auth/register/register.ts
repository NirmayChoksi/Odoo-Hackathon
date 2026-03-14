import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value || '';
  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
  const hasMinLen = val.length >= 8;
  if (hasUpper && hasLower && hasSpecial && hasMinLen) return null;
  return { weakPassword: true };
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = signal(false);
  showConfirm = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  readonly requirements: { text: string; met: (v: string) => boolean }[] = [
    { text: 'At least 8 characters',          met: (v) => v?.length >= 8 },
    { text: 'One uppercase letter (A–Z)',       met: (v) => /[A-Z]/.test(v) },
    { text: 'One lowercase letter (a–z)',       met: (v) => /[a-z]/.test(v) },
    { text: 'One special character (!@#$…)',   met: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group(
      {
        loginId: [
          '',
          [Validators.required, Validators.minLength(6), Validators.maxLength(12)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, passwordStrengthValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  get loginId() { return this.registerForm.get('loginId')!; }
  get email() { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }

  getPasswordStrength(): { width: string; color: string; label: string } {
    const val: string = this.password.value || '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) score++;
    if (score <= 1) return { width: '25%', color: '#ef4444', label: 'Weak' };
    if (score === 2) return { width: '50%', color: '#f59e0b', label: 'Fair' };
    if (score === 3) return { width: '75%', color: '#3b82f6', label: 'Good' };
    return { width: '100%', color: '#22c55e', label: 'Strong' };
  }

  getStrengthScore(): number {
    const val: string = this.password.value || '';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) score++;
    return score;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    const { loginId, email, password } = this.registerForm.value;
    this.authService.register({ loginId, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Account created! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/auth/login']), 1800);
      },
      error: () => {
        this.errorMessage.set('Registration failed. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
