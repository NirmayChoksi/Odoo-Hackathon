import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-otp',
  imports: [RouterLink, FormsModule],
  templateUrl: './verify-otp.html',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits = signal<string[]>(['', '', '', '', '', '']);
  isLoading = signal(false);
  errorMessage = signal('');
  countdown = signal(60);
  canResend = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private startCountdown(): void {
    this.countdown.set(60);
    this.canResend.set(false);
    this.timer = setInterval(() => {
      this.countdown.update((v) => {
        if (v <= 1) {
          clearInterval(this.timer!);
          this.canResend.set(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  onKeyUp(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const boxes = this.otpBoxes.toArray();

    if (event.key === 'Backspace') {
      this.updateDigit(index, '');
      if (index > 0) boxes[index - 1].nativeElement.focus();
      return;
    }
    if (input.value.length === 1 && /\d/.test(input.value)) {
      this.updateDigit(index, input.value);
      if (index < 5) boxes[index + 1].nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const filtered = pasted.replace(/\D/g, '').slice(0, 6);
    const arr = [...filtered.split(''), ...Array(6).fill('')].slice(0, 6);
    this.digits.set(arr);
    const boxes = this.otpBoxes.toArray();
    setTimeout(() => {
      const focusIdx = Math.min(filtered.length, 5);
      boxes[focusIdx]?.nativeElement.focus();
    }, 0);
  }

  private updateDigit(index: number, value: string): void {
    const arr = [...this.digits()];
    arr[index] = value;
    this.digits.set(arr);
  }

  getOtp(): string {
    return this.digits().join('');
  }

  resendOtp(): void {
    if (!this.canResend()) return;
    this.digits.set(['', '', '', '', '', '']);
    this.errorMessage.set('');
    this.startCountdown();
  }

  onSubmit(): void {
    const otp = this.getOtp();
    if (otp.length < 6) {
      this.errorMessage.set('Please enter the complete 6-digit OTP.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.verifyOtp(otp).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/reset-password']);
      },
      error: () => {
        this.errorMessage.set('Invalid or expired OTP. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}
