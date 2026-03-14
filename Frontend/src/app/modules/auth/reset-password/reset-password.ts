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
  const ok = /[A-Z]/.test(val) && /[a-z]/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val) && val.length >= 8;
  return ok ? null : { weakPassword: true };
}

function matchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  showPassword = signal(false);
  showConfirm = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  readonly requirements: { text: string; met: (v: string) => boolean }[] = [
    { text: 'At least 8 characters', met: (v) => v?.length >= 8 },
    { text: 'One uppercase letter (A–Z)', met: (v) => /[A-Z]/.test(v) },
    { text: 'One lowercase letter (a–z)', met: (v) => /[a-z]/.test(v) },
    { text: 'One special character (!@#$…)', met: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, passwordStrengthValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: matchValidator }
    );
  }

  get password() { return this.resetForm.get('password')!; }
  get confirmPassword() { return this.resetForm.get('confirmPassword')!; }

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
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.resetPassword(this.resetForm.value.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.errorMessage.set('Password reset failed. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
