import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardBlueComponent } from './components/stats-card-blue.component';
import { StatsCardRedComponent } from './components/stats-card-red.component';
import { StatsCardGreenComponent } from './components/stats-card-green.component';

import { LineChartComponent } from './components/line-chart.component';

import { BestSellingWidgetComponent } from './components/best-selling-widget.component';
import { HerramientasPopularesChartComponent } from './components/herramientas-populares-chart.component';
import { TrabajadoresRankingChartComponent } from './components/trabajadores-ranking-chart.component';
import { TrabajadoresRetardosChartComponent } from './components/trabajadores-retardos-chart.component';


import { ReportsService, Estadisticas } from '../service/reports.service';
import { RateLimitingService } from '../service/rate-limiting.service';
import { getRateLimitConfig } from '../service/rate-limiting-config';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
      CommonModule,
      StatsCardBlueComponent,
      StatsCardRedComponent,
      StatsCardGreenComponent,
      LineChartComponent,

      BestSellingWidgetComponent,
      HerramientasPopularesChartComponent,
      TrabajadoresRankingChartComponent,
      TrabajadoresRetardosChartComponent

    ],
    template: `
      <div class="space-y-6 max-w-7xl mx-auto px-4">
                  <!-- Header del Dashboard -->
          <div class="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
            <div class="flex justify-center items-center">
              <div class="text-center">
                <h1 class="text-4xl font-bold text-[var(--primary-color)] mb-4">Dashboard del Sistema</h1>
                <p class="text-gray-600 text-xl">Resumen completo de la actividad del sistema de herramientas</p>
              </div>
            </div>
          </div>

        <!-- Tarjetas de estadísticas principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div class="col-span-1">
            <app-stats-card-blue
              [title]="'Herramientas Activas'"
              [value]="estadisticas?.herramientas?.herramientas_activas || 0"
              [color]="'blue'"
            />
          </div>

          <div class="col-span-1">
            <app-stats-card-green
              [title]="'Herramientas Disponibles'"
              [value]="estadisticas?.herramientas?.disponibles || 0"
              [color]="'green'"
            />
          </div>
          <div class="col-span-1">
            <app-stats-card-red
              [title]="'Multas Pendientes'"
              [value]="estadisticas?.multas?.pendientes || 0"
              [color]="'red'"
            />
          </div>
        </div>

        <!-- Resumen de Usuarios y Estado de Préstamos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 class="text-2xl font-semibold text-[var(--primary-color)] mb-8 flex items-center">
              <span class="material-icons mr-4 text-blue-500 text-3xl">group</span>
              Resumen de Usuarios
            </h3>
            <div class="grid grid-cols-2 gap-8">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 flex flex-row items-center justify-between border border-blue-200">
                <div class="flex items-center">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span class="material-icons text-white text-3xl">group</span>
                  </div>
                </div>
                <div class="flex flex-col items-end">
                  <div class="text-4xl font-bold text-blue-700">{{ estadisticas?.usuarios?.total_usuarios || 0 }}</div>
                  <div class="text-base font-semibold text-blue-600">Total Usuarios</div>
                </div>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 flex flex-row items-center justify-between border border-green-200">
                <div class="flex items-center">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <span class="material-icons text-white text-3xl">check_circle</span>
                  </div>
                </div>
                <div class="flex flex-col items-end">
                  <div class="text-4xl font-bold text-green-700">{{ estadisticas?.usuarios?.activos || 0 }}</div>
                  <div class="text-base font-semibold text-green-600">Usuarios Activos</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 class="text-2xl font-semibold text-[var(--primary-color)] mb-8 flex items-center">
              <span class="material-icons mr-4 text-orange-500 text-3xl">assignment</span>
              Estado de Préstamos
            </h3>
            <div class="space-y-6">
              <div class="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <span class="text-gray-700 font-semibold text-lg">Total Préstamos:</span>
                <span class="font-bold text-2xl text-gray-900">{{ estadisticas?.prestamos?.total_prestamos || 0 }}</span>
              </div>
              <div class="flex justify-between items-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <span class="text-gray-700 font-semibold text-lg">Devueltos:</span>
                <span class="font-bold text-2xl text-green-600">{{ estadisticas?.prestamos?.devueltos || 0 }}</span>
              </div>
              <div class="flex justify-between items-center p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                <span class="text-gray-700 font-semibold text-lg">Vencidos:</span>
                <span class="font-bold text-2xl text-red-600">{{ estadisticas?.prestamos?.vencidos || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficas y widgets principales -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Gráfica de línea principal -->
          <div class="xl:col-span-2">
            <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <app-line-chart
                [title]="'Actividad del Sistema - Últimos 12 Meses'"
                [loading]="loading"
              />
            </div>
          </div>

          <!-- Widget de herramientas populares -->
          <div class="xl:col-span-1">
            <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-full">
              <app-best-selling-widget />
            </div>
          </div>
        </div>

        <!-- Gráficas de análisis -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Herramientas más solicitadas - Card más pequeña -->
          <div class="xl:col-span-1">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <app-herramientas-populares-chart />
            </div>
          </div>

          <!-- Ranking de trabajadores - Card más grande -->
          <div class="xl:col-span-2">
            <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <app-trabajadores-ranking-chart />
            </div>
          </div>
        </div>

        <!-- Trabajadores con retardos - Full width para mejor visualización -->
        <div class="grid grid-cols-1 gap-6">
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <app-trabajadores-retardos-chart />
          </div>
        </div>
      </div>
    `
})
export class Dashboard implements OnInit, OnDestroy {
  estadisticas?: Estadisticas;
  loading = false;
  private destroy$ = new Subject<void>();
  private interval: any;

  constructor(
    private reportsService: ReportsService,
    private rateLimitingService: RateLimitingService
  ) {}

  ngOnInit() {
    this.loadEstadisticas();
    
    // Actualización automática cada 15 segundos (balance entre frescura y rendimiento)
    this.interval = setInterval(() => {
      this.loadEstadisticas();
    }, 15000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.interval) {
      clearInterval(this.interval);
    }
  }



  loadEstadisticas() {
    this.loading = true;
    const endpoint = 'dashboard-stats';

    this.reportsService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.loading = false;
        this.rateLimitingService.recordRequest(endpoint);
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.loading = false;
      }
    });
  }


}


