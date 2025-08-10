import { Component, Input, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { ReportsService, Estadisticas, DatosHistoricos } from '../../service/reports.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="variant === 'detailed' ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 mt-4 border border-blue-200 dark:border-gray-600' : 'bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-4'"
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
        <div class="relative h-80">
          <canvas #lineChart></canvas>
          <div *ngIf="!chart" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
            <div class="text-center">
              <div class="text-gray-500 mb-2">📊 Gráfico no disponible</div>
              <div class="text-sm text-gray-400">Estado: {{ loading ? 'Cargando...' : 'Error al cargar' }}</div>
            </div>
          </div>
        </div>
        
        <div *ngIf="variant === 'detailed'" class="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded text-sm border-l-4 border-blue-500">
          <p class="text-blue-800 dark:text-blue-200 font-medium">📊 Vista Detallada - Datos de los últimos 12 meses</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .bg-white {
      transition: all 0.3s ease;
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
  `]
})
export class LineChartComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Actividad del Sistema';
  @Input() variant: 'default' | 'detailed' = 'default';
  @Input() loading: boolean = false;

  @ViewChild('lineChart', { static: false }) lineChartRef!: ElementRef<HTMLCanvasElement>;
  
  chart: Chart | null = null;
  estadisticas?: Estadisticas;
  datosHistoricos?: DatosHistoricos[];
  private refreshInterval: any;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadChartData();
    // Actualizar datos cada 30 segundos para tiempo real
    this.startRealTimeUpdates();
  }

  ngAfterViewInit() {
    // Forzar actualización después de que la vista esté lista
    setTimeout(() => {
      if (this.datosHistoricos && this.datosHistoricos.length > 0) {
        this.updateChartWithHistoricalData();
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

    this.reportsService.getDatosHistoricos().subscribe({
      next: (datosHistoricos) => {
        this.datosHistoricos = datosHistoricos;
        setTimeout(() => {
          this.updateChartWithHistoricalData();
        }, 100);
        this.loading = false;
      },
      error: (error) => {
        // Si no hay datos históricos, usar estadísticas actuales
        this.loadEstadisticasForSimulation();
      }
    });
  }

  private loadEstadisticasForSimulation() {
    this.reportsService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.updateChartWithSimulatedData();
        this.loading = false;
      },
      error: (error) => {
        // Usar datos por defecto si no se pueden obtener estadísticas
        this.updateChartWithDefaultData();
        this.loading = false;
      }
    });
  }

  private updateChartWithHistoricalData() {
    if (!this.datosHistoricos || this.datosHistoricos.length === 0) {
      this.updateChartWithDefaultData();
      return;
    }

    // Filtrar solo meses con datos reales (no cero)
    const mesesConDatos = this.datosHistoricos.filter(d => 
      d.herramientas_activas > 0 || 
      d.prestamos_activos > 0 || 
      d.herramientas_disponibles > 0
    );
    
    if (mesesConDatos.length === 0) {
      this.updateChartWithDefaultData();
      return;
    }

    // Si solo hay un mes con datos, mostrar solo ese mes
    if (mesesConDatos.length === 1) {
      this.updateChartWithSingleMonthData(mesesConDatos[0]);
      return;
    }

    // Mostrar todos los meses con datos
    const labels = mesesConDatos.map(d => d.mes);
    const herramientasActivas = mesesConDatos.map(d => d.herramientas_activas);
    const prestamosActivos = mesesConDatos.map(d => d.prestamos_activos);
    const herramientasDisponibles = mesesConDatos.map(d => d.herramientas_disponibles);

    this.createChart(labels, herramientasActivas, prestamosActivos, herramientasDisponibles);
  }

  private updateChartWithSingleMonthData(singleMonthData: DatosHistoricos) {
    // Solo mostrar el mes que tiene datos reales
    const labels = [singleMonthData.mes];
    const herramientasActivas = [singleMonthData.herramientas_activas];
    const prestamosActivos = [singleMonthData.prestamos_activos];
    const herramientasDisponibles = [singleMonthData.herramientas_disponibles];

    this.createChart(labels, herramientasActivas, prestamosActivos, herramientasDisponibles);
  }

  private updateChartWithSimulatedData() {
    if (!this.estadisticas) {
      this.updateChartWithDefaultData();
      return;
    }

    // Generar datos simulados basados en estadísticas reales
    const herramientasActivas = this.estadisticas.herramientas?.herramientas_activas || 0;
    const prestamosActivos = this.estadisticas.prestamos?.activos || 0;
    const herramientasDisponibles = this.estadisticas.herramientas?.disponibles || 0;

    const dataHerramientasActivas = this.generateTrendData(herramientasActivas, 12);
    const dataPrestamosActivos = this.generateTrendData(prestamosActivos, 12);
    const dataHerramientasDisponibles = this.generateTrendData(herramientasDisponibles, 12);

    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.createChart(labels, dataHerramientasActivas, dataPrestamosActivos, dataHerramientasDisponibles);
  }

  private updateChartWithDefaultData() {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const herramientasActivas = [5, 7, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30];
    const prestamosActivos = [3, 5, 4, 6, 8, 10, 12, 11, 13, 15, 17, 19];
    const herramientasDisponibles = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

    this.createChart(labels, herramientasActivas, prestamosActivos, herramientasDisponibles);
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
      canvas.width = 800;
      canvas.height = 400;
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

    try {
      const chartConfig: ChartConfiguration<'line'> = {
        type: 'line',
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
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2
            },
            {
              label: 'Préstamos Activos',
              data: data2,
              fill: false,
              borderColor: colors.secondary,
              backgroundColor: colors.secondary,
              tension: 0.1,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2
            },
            {
              label: 'Herramientas Disponibles',
              data: data3,
              fill: false,
              borderColor: colors.tertiary,
              backgroundColor: colors.tertiary,
              tension: 0.1,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2
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
                padding: 20
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false
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
                  size: 12
                }
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
                  size: 12
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
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

  private generateTrendData(currentValue: number, months: number): number[] {
    const data: number[] = [];
    const baseValue = Math.max(1, currentValue * 0.2);

    for (let i = 0; i < months; i++) {
      const progress = i / (months - 1);
      const easedProgress = this.easeInOutCubic(progress);
      const trend = baseValue + (currentValue - baseValue) * easedProgress;
      const variation = (Math.random() - 0.5) * 0.2;
      const finalValue = Math.max(0, trend * (1 + variation));
      data.push(Math.round(finalValue));
    }

    return data;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  forceReload() {
    // Limpiar datos existentes
    this.datosHistoricos = undefined;
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
