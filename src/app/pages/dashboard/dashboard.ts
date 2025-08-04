import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardBlueComponent } from './components/stats-card-blue.component';
import { StatsCardOrangeComponent } from './components/stats-card-orange.component';
import { StatsCardGreenComponent } from './components/stats-card-green.component';
import { StatsCardRedComponent } from './components/stats-card-red.component';
import { LineChartComponent } from './components/line-chart.component';
import { BestSellingWidgetComponent } from './components/best-selling-widget.component';
import { ReportsService, Estadisticas } from '../service/reports.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
      CommonModule,
      StatsCardBlueComponent,
      StatsCardOrangeComponent,
      StatsCardGreenComponent,
      StatsCardRedComponent,
      LineChartComponent,
      BestSellingWidgetComponent
    ],
    template: `
      <div class="space-y-6">
        <!-- Header del Dashboard -->
        <div class="bg-white rounded-xl shadow p-6">
          <h1 class="text-2xl font-bold text-[var(--primary-color)] mb-2">Dashboard del Sistema</h1>
          <p class="text-gray-600">Resumen completo de la actividad del sistema de herramientas</p>
        </div>

        <!-- Tarjetas de estadísticas principales -->
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <app-stats-card-blue
              [title]="'Herramientas Activas'"
              [value]="estadisticas?.herramientas?.herramientas_activas || 0"
              [percentage]="getPercentage(estadisticas?.herramientas?.herramientas_activas, estadisticas?.herramientas?.total_herramientas)"
              [trend]="'up'"
              [color]="'blue'"
            />
          </div>
          <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <app-stats-card-orange
              [title]="'Préstamos Activos'"
              [value]="estadisticas?.prestamos?.activos || 0"
              [percentage]="getPercentage(estadisticas?.prestamos?.activos, estadisticas?.prestamos?.total_prestamos)"
              [trend]="'up'"
              [color]="'orange'"
            />
          </div>
          <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <app-stats-card-green
              [title]="'Herramientas Disponibles'"
              [value]="estadisticas?.herramientas?.disponibles || 0"
              [percentage]="getPercentage(estadisticas?.herramientas?.disponibles, estadisticas?.herramientas?.total_herramientas)"
              [trend]="'up'"
              [color]="'green'"
            />
          </div>
          <div class="col-span-12 md:col-span-6 xl:col-span-3">
            <app-stats-card-red
              [title]="'Multas Pendientes'"
              [value]="estadisticas?.multas?.pendientes || 0"
              [percentage]="getPercentage(estadisticas?.multas?.pendientes, estadisticas?.multas?.total_multas)"
              [trend]="'down'"
              [color]="'red'"
            />
          </div>
        </div>

        <!-- Gráficas y widgets -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Gráfica de línea principal -->
          <div class="col-span-12 lg:col-span-8">
            <app-line-chart
              [title]="'Actividad del Sistema - Últimos 12 Meses'"
              [loading]="loading"
            />
          </div>

          <!-- Widget de herramientas populares -->
          <div class="col-span-12 lg:col-span-4">
            <app-best-selling-widget />
          </div>
        </div>

        <!-- Información adicional -->
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 md:col-span-6">
            <div class="bg-white rounded-xl shadow p-6">
              <h3 class="text-lg font-semibold text-[var(--primary-color)] mb-4">Resumen de Usuarios</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="text-3xl font-bold text-blue-600">{{ estadisticas?.usuarios?.total_usuarios || 0 }}</div>
                  <div class="text-sm text-blue-600">Total Usuarios</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-3xl font-bold text-green-600">{{ estadisticas?.usuarios?.activos || 0 }}</div>
                  <div class="text-sm text-green-600">Usuarios Activos</div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-12 md:col-span-6">
            <div class="bg-white rounded-xl shadow p-6">
              <h3 class="text-lg font-semibold text-[var(--primary-color)] mb-4">Estado de Préstamos</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total Préstamos:</span>
                  <span class="font-semibold">{{ estadisticas?.prestamos?.total_prestamos || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Devueltos:</span>
                  <span class="font-semibold text-green-600">{{ estadisticas?.prestamos?.devueltos || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Vencidos:</span>
                  <span class="font-semibold text-red-600">{{ estadisticas?.prestamos?.vencidos || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
})
export class Dashboard implements OnInit {
  estadisticas?: Estadisticas;
  loading = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadEstadisticas();
  }

  loadEstadisticas() {
    this.loading = true;
    this.reportsService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.loading = false;
      }
    });
  }

  getPercentage(value: number | undefined, total: number | undefined): number {
    if (!value || !total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}


