import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-nav.component.html',
})
export class TopNavComponent {
  isOperationsOpen = signal(false);
  isMobileMenuOpen = signal(false);

  toggleOperations() {
    this.isOperationsOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
