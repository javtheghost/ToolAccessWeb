import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReportsService, HerramientaPopular } from '../../service/reports.service';

@Component({
  selector: 'app-best-selling-widget',
  standalone: true,
  imports: [CommonModule, ChartModule, ProgressSpinnerModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-[var(--primary-color)]">Herramientas Más Populares</h3>
        <div *ngIf="loading" class="flex items-center">
          <p-progressSpinner styleClass="w-4 h-4" strokeWidth="3" animationDuration=".5s"></p-progressSpinner>
        </div>
      </div>

      <div *ngIf="!loading && herramientasPopulares.length > 0" class="max-h-80 overflow-y-auto space-y-4 pr-2">
        <div *ngFor="let herramienta of herramientasPopulares; let i = index"
             class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                 [ngClass]="getColorClass(i)">
              {{ i + 1 }}
            </div>
            <div>
              <h4 class="font-semibold text-gray-800">{{ herramienta.nombre }}</h4>
              <p class="text-sm text-gray-500">{{ herramienta.categoria }} - {{ herramienta.subcategoria }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-gray-800">{{ herramienta.veces_prestada }} préstamos</div>
            <div class="text-xs text-gray-500">Stock: {{ herramienta.stock }}</div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && herramientasPopulares.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay datos disponibles</p>
      </div>
    </div>
  `,
  styles: [``]
})
export class BestSellingWidgetComponent implements OnInit {
  herramientasPopulares: HerramientaPopular[] = [];
  loading = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadHerramientasPopulares();
  }

  loadHerramientasPopulares() {
    this.loading = true;
    this.reportsService.getHerramientasPopulares().subscribe({
      next: (data) => {
        this.herramientasPopulares = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando herramientas populares:', error);
        this.loading = false;
      }
    });
  }

  getColorClass(index: number): string {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-purple-500',
      'bg-red-500'
    ];
    return colors[index] || 'bg-gray-500';
  }
}
