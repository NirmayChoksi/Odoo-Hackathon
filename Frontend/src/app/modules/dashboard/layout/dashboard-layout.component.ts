import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../components/top-nav/top-nav.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {}
