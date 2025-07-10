import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-stats-card-orange',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="rounded-xl bg-white shadow p-4 flex flex-col gap-2 h-full">
      <div class="flex justify-between items-center mb-2">
        <span class="text-gray-400 text-xl font-bold">&nbsp;</span>
        <span class="text-gray-400 cursor-pointer">&#8942;</span>
      </div>
      <div class="bg-orange-50 rounded-lg p-2 flex flex-row items-center justify-between">
        <div class="flex-1 min-w-0">
          <p-chart type="bar" [data]="barData" [options]="barOptions" styleClass="w-full h-20"></p-chart>
        </div>
        <div class="flex flex-col items-end ml-4 min-w-[80px]">
          <div class="text-xl font-bold text-gray-700">290+</div>
          <div class="text-xs text-orange-400 font-semibold">&#8595; 30.6%</div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class StatsCardOrangeComponent {
  barData = {
    labels: Array(12).fill(''),
    datasets: [
      {
        label: '',
        data: [4, 8, 6, 12, 7, 10, 6, 8, 4, 7, 10, 6],
        backgroundColor: '#f59e42',
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      }
    ]
  };
  barOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true, min: 0, max: 14 }
    },
    responsive: true,
    maintainAspectRatio: false
  };
}
