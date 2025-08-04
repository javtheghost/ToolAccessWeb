import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-stats-card-green',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="rounded-xl bg-white shadow p-4 flex flex-col gap-2 h-full">
      <div class="flex justify-between items-center mb-2">
        <span class="text-[var(--primary-color)] text-sm font-semibold">{{ title }}</span>
        <span class="text-gray-400 cursor-pointer">&#8942;</span>
      </div>
      <div class="bg-green-50 rounded-lg p-2 flex flex-row items-center justify-between">
        <div class="flex-1 min-w-0">
          <p-chart type="bar" [data]="barData" [options]="barOptions" styleClass="w-full h-20"></p-chart>
        </div>
        <div class="flex flex-col items-end ml-4 min-w-[80px]">
          <div class="text-xl font-bold text-gray-700">{{ value }}</div>
          <div class="text-xs font-semibold" [ngClass]="trend === 'up' ? 'text-green-600' : 'text-red-500'">
            {{ trend === 'up' ? '↗' : '↘' }} {{ percentage }}%
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class StatsCardGreenComponent {
  @Input() title: string = 'Herramientas Disponibles';
  @Input() value: number = 0;
  @Input() percentage: number = 0;
  @Input() trend: 'up' | 'down' = 'up';
  @Input() color: string = 'green';

  get barData() {
    return {
      labels: Array(12).fill(''),
      datasets: [
        {
          label: '',
          data: this.generateRandomData(),
          backgroundColor: this.getColor(),
          borderRadius: 3,
          barPercentage: 0.7,
          categoryPercentage: 0.7
        }
      ]
    };
  }

  barOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true, min: 0, max: 14 }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  private generateRandomData(): number[] {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 12) + 2);
  }

  private getColor(): string {
    const colors = {
      blue: '#2563eb',
      orange: '#f59e42',
      green: '#16a34a',
      red: '#ef4444'
    };
    return colors[this.color as keyof typeof colors] || '#16a34a';
  }
}
