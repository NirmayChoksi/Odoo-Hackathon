import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  label: string;
  value: number;
  color: string;
}

export interface StatCardData {
  title: string;
  mainAction: string;
  stats: StatItem[];
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input() data!: StatCardData;
}
