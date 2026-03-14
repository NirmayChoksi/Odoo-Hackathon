import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService, CurrentUser } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-nav.component.html',
})
export class TopNavComponent implements OnInit {
  isOperationsOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isProfileOpen    = signal(false);

  currentUser: CurrentUser | null = null;
  initials = 'U';

  constructor(
    public theme: ThemeService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.initials = this.authService.getInitials(this.currentUser.loginId);
    }
  }

  toggleOperations() { this.isOperationsOpen.update(v => !v); }
  toggleMobileMenu()  { this.isMobileMenuOpen.update(v => !v); }
  toggleProfile()     { this.isProfileOpen.update(v => !v); }

  logout(): void {
    this.authService.setLoggedIn(false);
    this.router.navigate(['/auth/login']);
  }
}
