import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardResponse } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardResponse | null = null;
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData = res;
        } else {
          this.error = 'Failed to load dashboard data.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.error = 'An error occurred while loading dashboard data.';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.setLoggedIn(false);
    this.router.navigate(['/auth/login']);
  }
}
