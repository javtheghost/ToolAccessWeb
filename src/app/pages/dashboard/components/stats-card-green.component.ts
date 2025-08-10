import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card-green',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl bg-white shadow p-4 flex flex-col gap-2 h-full">
      <div class="flex justify-between items-center mb-2">
        <span class="text-[var(--primary-color)] text-sm font-semibold">{{ title }}</span>
        <span class="text-gray-400 cursor-pointer">&#8942;</span>
      </div>
      <div class="bg-green-50 rounded-lg p-4 flex flex-row items-center justify-between">
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <span class="material-icons text-white text-xl">{{ getIcon() }}</span>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-2xl font-bold text-gray-700">{{ value }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class StatsCardGreenComponent {
  @Input() title: string = 'Herramientas Disponibles';
  @Input() value: number = 0;
  @Input() color: string = 'green';

  getIcon(): string {
    const icons = {
      blue: 'build',      // Herramientas Activas
      orange: 'assignment', // Préstamos Activos
      green: 'check_circle', // Herramientas Disponibles
      red: 'warning'       // Para elementos adicionales
    };
    return icons[this.color as keyof typeof icons] || 'check_circle';
  }
}
