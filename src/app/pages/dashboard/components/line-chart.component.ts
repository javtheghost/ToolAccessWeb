import { Component, Input, OnInit, ElementRef, ViewChild, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { ReportsService, Estadisticas } from '../../service/reports.service';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="variant === 'detailed' ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 mt-4 border border-blue-200 dark:border-gray-600 w-full' : 'bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-4 w-full'"
      role="img"
    >
      <div *ngIf="loading" class="flex justify-center items-center h-80">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div *ngIf="!loading">
        <div class="flex justify-between items-center mb-4">
          <h3 [class]="variant === 'detailed' ? 'text-xl font-bold text-blue-800 dark:text-blue-200' : 'text-lg font-semibold text-[var(--primary-color)]'">{{ title }}</h3>
          <div class="text-xs text-gray-500 flex items-center">
            <span [class]="loading ? 'animate-spin' : 'animate-pulse'">🔄</span>
            <span class="ml-1">{{ loading ? 'Actualizando...' : 'Actualización automática' }}</span>
          </div>
        </div>
        <div class="relative h-80 w-full">
          <canvas #lineChart class="w-full h-full"></canvas>
          <div *ngIf="!chart" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
            <div class="text-center">
              <div class="text-gray-500 mb-2">📊 Gráfico no disponible</div>
              <div class="text-sm text-gray-400">Estado: {{ loading ? 'Cargando...' : 'Error al cargar' }}</div>
            </div>
          </div>
        </div>
        
        <div *ngIf="variant === 'detailed'" class="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded text-sm border-l-4 border-blue-500">
          <p class="text-blue-800 dark:text-blue-200 font-medium">📊 Datos Reales del Sistema - Agosto 2024</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 100%;
    }
    
    .bg-white {
      transition: all 0.3s ease;
      min-width: 100%;
      width: 100%;
      max-width: none;
    }
    
    .bg-white:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    h3 {
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 600;
      color: var(--primary-color, #3b82f6);
    }
    
    /* Ajustar el canvas para que use todo el ancho disponible */
    canvas {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
    }
    
    /* Hacer que el contenedor del gráfico sea más ancho */
    .relative.h-80 {
      min-width: 100%;
      width: 100%;
      max-width: none;
    }
    
    /* Asegurar que la card ocupe todo el ancho disponible */
    div[role="img"] {
      width: 100% !important;
      min-width: 100% !important;
      max-width: none !important;
    }
  `]
})
export class LineChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title: string = 'Estado Actual del Sistema';
  @Input() variant: 'default' | 'detailed' = 'default';
  @Input() loading: boolean = false;
  @Input() estadisticas?: Estadisticas;

  @ViewChild('lineChart', { static: false }) lineChartRef!: ElementRef<HTMLCanvasElement>;
  
  chart: Chart | null = null;
  private refreshInterval: any;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadChartData();
    // Actualizar datos cada 30 segundos para tiempo real
    this.startRealTimeUpdates();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Si cambian las estadísticas y no son undefined, actualizar el gráfico
    if (changes['estadisticas'] && 
        changes['estadisticas'].currentValue && 
        !changes['estadisticas'].firstChange) {
      this.updateChartWithRealData();
    }
  }

  ngAfterViewInit() {
    // Forzar actualización después de que la vista esté lista
    setTimeout(() => {
      if (this.estadisticas) {
        this.updateChartWithRealData();
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private startRealTimeUpdates() {
    // Actualizar cada 15 segundos para mayor tiempo real
    this.refreshInterval = setInterval(() => {
      this.loadChartData();
    }, 15000); // 15 segundos
  }

  private loadChartData() {
    this.loading = true;

    // Solo usar estadísticas reales del dashboard
    if (this.estadisticas) {
      this.updateChartWithRealData();
      this.loading = false;
      return;
    }

    // Si no hay estadísticas, mostrar mensaje de no datos
    this.showNoDataMessage();
    this.loading = false;
  }

  private showNoDataMessage() {
    // Destruir chart existente si existe
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private updateChartWithRealData() {
    if (!this.estadisticas) {
      this.showNoDataMessage();
      return;
    }

    // Usar las estadísticas reales del dashboard
    const herramientasActivas = this.estadisticas.herramientas?.herramientas_activas || 0;
    const prestamosActivos = this.estadisticas.prestamos?.activos || 0;
    const herramientasDisponibles = this.estadisticas.herramientas?.disponibles || 0;

    // Solo mostrar el mes actual (agosto) con datos reales
    const labels = ['Agosto'];
    const dataHerramientasActivas = [herramientasActivas];
    const dataPrestamosActivos = [prestamosActivos];
    const dataHerramientasDisponibles = [herramientasDisponibles];

    this.createChart(labels, dataHerramientasActivas, dataPrestamosActivos, dataHerramientasDisponibles);
  }

  private createChart(labels: string[], data1: number[], data2: number[], data3: number[]) {
    // Validaciones básicas
    if (labels.length !== data1.length || labels.length !== data2.length || labels.length !== data3.length || labels.length === 0) {
      return;
    }

    // Destruir chart existente si existe
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Verificar que el canvas esté disponible
    if (!this.lineChartRef || !this.lineChartRef.nativeElement) {
      return;
    }

    const canvas = this.lineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Asegurar dimensiones del canvas
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 400;
    }

    // Configuración de colores según la variante
    const colors = this.variant === 'detailed' ? {
      primary: '#1e40af',
      secondary: '#dc2626',
      tertiary: '#059669'
    } : {
      primary: '#3b82f6',
      secondary: '#f59e0b',
      tertiary: '#16a34a'
    };

    // Si solo hay un punto de datos, usar gráfico de barras
    const chartType = labels.length === 1 ? 'bar' : 'line';

    try {
      const chartConfig: ChartConfiguration<'line' | 'bar'> = {
        type: chartType,
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Herramientas Activas',
              data: data1,
              fill: false,
              borderColor: colors.primary,
              backgroundColor: colors.primary,
              tension: 0.1,
              pointRadius: labels.length === 1 ? 0 : 4,
              pointHoverRadius: labels.length === 1 ? 0 : 6,
              borderWidth: labels.length === 1 ? 0 : 2
            },
            {
              label: 'Préstamos Activos',
              data: data2,
              fill: false,
              borderColor: colors.secondary,
              backgroundColor: colors.secondary,
              tension: 0.1,
              pointRadius: labels.length === 1 ? 0 : 4,
              pointHoverRadius: labels.length === 1 ? 0 : 6,
              borderWidth: labels.length === 1 ? 0 : 2
            },
            {
              label: 'Herramientas Disponibles',
              data: data3,
              fill: false,
              borderColor: colors.tertiary,
              backgroundColor: colors.tertiary,
              tension: 0.1,
              pointRadius: labels.length === 1 ? 0 : 4,
              pointHoverRadius: labels.length === 1 ? 0 : 6,
              borderWidth: labels.length === 1 ? 0 : 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: true,
                color: 'rgba(0,0,0,0.1)'
              },
              ticks: {
                font: {
                  size: 14
                },
                padding: 8
              }
            },
            y: {
              display: true,
              grid: {
                display: true,
                color: 'rgba(0,0,0,0.1)'
              },
              beginAtZero: true,
              ticks: {
                font: {
                  size: 14
                },
                padding: 8
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          layout: {
            padding: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            }
          }
        }
      };
      
      this.chart = new Chart(ctx, chartConfig);
      
      // Forzar actualización del chart
      setTimeout(() => {
        if (this.chart) {
          this.chart.update('none');
        }
      }, 100);
      
    } catch (error) {
      // Crear gráfico simple de fallback
      this.createSimpleFallbackChart(ctx, labels, data1);
    }
  }

  private createSimpleFallbackChart(ctx: CanvasRenderingContext2D, labels: string[], data: number[]) {
    try {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Datos',
            data: data,
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    } catch (error) {
      // Error silencioso para evitar logs innecesarios
    }
  }

  forceReload() {
    // Limpiar datos existentes
    this.estadisticas = undefined;
    
    // Destruir chart existente
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    // Recargar datos
    this.loadChartData();
  }
}
