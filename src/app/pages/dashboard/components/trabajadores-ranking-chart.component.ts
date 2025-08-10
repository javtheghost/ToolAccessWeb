import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ReportsService, Prestamo } from '../../service/reports.service';
import { Subject, takeUntil, interval } from 'rxjs';

interface TrabajadorRanking {
  nombre: string;
  email: string;
  total_prestamos: number;
  porcentaje: number;
}

@Component({
  selector: 'app-trabajadores-ranking-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="pi pi-users me-2"></i>
          Ranking de Trabajadores
        </h5>
      </div>
      <div class="card-body">
        <div *ngIf="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div *ngIf="!loading && (!rankingData || rankingData.length === 0)" class="text-center py-4">
          <i class="pi pi-info-circle text-muted" style="font-size: 2rem;"></i>
          <p class="text-muted mt-2">No hay datos disponibles</p>
        </div>
        
        <div *ngIf="!loading && rankingData && rankingData.length > 0" class="ranking-content">
          <!-- Gráfico de dona -->
          <div class="chart-section">
            <div class="chart-container">
              <canvas baseChart
                [data]="doughnutChartData"
                [options]="doughnutChartOptions"
                [type]="doughnutChartType">
              </canvas>
            </div>
          </div>
          
          <!-- Lista de ranking -->
          <div class="ranking-section">
            <div class="ranking-list">
              <h6 class="text-muted mb-3">
                <i class="pi pi-trophy me-2 text-warning"></i>
                Top 5 Trabajadores por Préstamos
              </h6>
              <div *ngFor="let trabajador of rankingData.slice(0, 5); let i = index" 
                   class="ranking-item d-flex align-items-center p-3 mb-3 rounded">
                <div class="ranking-position me-3">
                  <span class="badge position-badge" [ngClass]="getPositionClass(i)">{{ i + 1 }}</span>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold text-dark">{{ trabajador.nombre }}</div>
                  <small class="text-muted">{{ trabajador.email }}</small>
                </div>
                <div class="text-end">
                  <div class="d-flex flex-column align-items-end">
                    <div class="d-flex align-items-center mb-1">
                      <span class="badge bg-primary fs-6 me-1">{{ trabajador.total_prestamos }}</span>
                      <small class="text-muted">préstamos</small>
                    </div>
                    <span class="badge bg-light text-dark fs-7">{{ trabajador.porcentaje }}% del total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resumen estadístico -->
        <div *ngIf="!loading && rankingData && rankingData.length > 0" class="mt-4">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-badge bg-primary text-white mb-2">
                <span class="stat-number">{{ totalPrestamos }}</span>
                <small class="stat-label">Total</small>
              </div>
              <small class="text-muted fw-medium">Préstamos Realizados</small>
            </div>
            <div class="stat-item">
              <div class="stat-badge bg-primary text-white mb-2">
                <span class="stat-number">{{ rankingData.length }}</span>
                <small class="stat-label">Usuarios</small>
              </div>
              <small class="text-muted fw-medium">Trabajadores Activos</small>
            </div>
            <div class="stat-item">
              <div class="stat-badge bg-primary text-white mb-2">
                <span class="stat-number">{{ promedioPrestamos | number:'1.1-1' }}</span>
                <small class="stat-label">Promedio</small>
              </div>
              <small class="text-muted fw-medium">Préstamos por Usuario</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 250px;
      width: 100%;
    }
    
    .ranking-content {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      align-items: flex-start;
    }
    
    .chart-section {
      flex: 1;
      min-width: 300px;
    }
    
    .ranking-section {
      flex: 1;
      min-width: 300px;
    }
    
    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border-radius: 0.5rem;
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      border-radius: 0.5rem 0.5rem 0 0;
    }
    
    .card-title {
      color: #495057;
      font-weight: 600;
    }
    
    .ranking-item {
      background-color: #f8f9fa;
      transition: all 0.2s ease;
    }
    
    .ranking-item:hover {
      background-color: #e9ecef;
      transform: translateX(5px);
    }
    
    .ranking-position .badge {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      border: 2px solid #ffffff;
      box-shadow: 0 3px 6px rgba(0,0,0,0.2);
    }
    
    .position-badge {
      transition: all 0.2s ease;
    }
    
    .position-badge:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
            .badge.bg-primary {
          background-color: #03346E !important;
          color: white !important;
          font-weight: 600;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          min-width: 40px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #dbeafe !important; /* border-blue-100 */
        }
    
    .badge.bg-light {
      background-color: #f8f9fa !important;
      color: #495057 !important;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid #dee2e6;
    }
    
    .fs-6 {
      font-size: 1rem !important;
    }
    
    .fs-7 {
      font-size: 0.875rem !important;
    }
    
    .stats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: space-around;
      align-items: stretch;
    }
    
    .stat-item {
      flex: 1;
      min-width: 200px;
      background-color: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      border: 1px solid #e9ecef;
    }
    
    .stat-item:hover {
      background-color: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .stat-badge {
      display: inline-block;
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      min-width: 80px;
    }
    
    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      display: block;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      opacity: 0.9;
      display: block;
      margin-top: 2px;
    }
    
    .fw-medium {
      font-weight: 500 !important;
    }
  `]
})
export class TrabajadoresRankingChartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private interval: any;
  
  loading = true;
  rankingData: TrabajadorRanking[] = [];
  totalPrestamos = 0;
  promedioPrestamos = 0;
  
  public doughnutChartType = 'doughnut' as const;
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: []
  };
  
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const item = this.rankingData[dataIndex];
            return [
              `Trabajador: ${item.nombre}`,
              `Préstamos: ${item.total_prestamos}`,
              `Porcentaje: ${item.porcentaje}%`
            ];
          }
        }
      }
    }
  };

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadData();
    // Actualización automática cada 30 segundos
    this.interval = setInterval(() => {
      this.loadData();
    }, 30000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private loadData() {
    this.loading = true;
    this.reportsService.getReportePrestamos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prestamos: Prestamo[]) => {
          this.processPrestamosData(prestamos);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando préstamos:', error);
          this.loading = false;
        }
      });
  }

  private processPrestamosData(prestamos: Prestamo[]) {
    // Agrupar préstamos por usuario
    const userPrestamos = new Map<string, number>();
    
    prestamos.forEach(prestamo => {
      const key = prestamo.usuario_email;
      userPrestamos.set(key, (userPrestamos.get(key) || 0) + 1);
    });
    
    // Convertir a array y ordenar
    this.rankingData = Array.from(userPrestamos.entries())
      .map(([email, total]) => {
        const prestamo = prestamos.find(p => p.usuario_email === email);
        return {
          nombre: prestamo?.usuario_nombre || email,
          email: email,
          total_prestamos: total,
          porcentaje: 0 // Se calculará después
        };
      })
      .sort((a, b) => b.total_prestamos - a.total_prestamos);
    
    // Calcular totales y porcentajes
    this.totalPrestamos = prestamos.length;
    this.promedioPrestamos = this.totalPrestamos / this.rankingData.length;
    
    this.rankingData.forEach(trabajador => {
      trabajador.porcentaje = Math.round((trabajador.total_prestamos / this.totalPrestamos) * 100);
    });
    
    this.updateChart();
  }

  private updateChart() {
    if (!this.rankingData || this.rankingData.length === 0) return;

    const top5 = this.rankingData.slice(0, 5);
    const colors = [
      '#3b82f6', // Azul - Herramientas Activas
      '#f59e0b', // Naranja - Préstamos Activos
      '#16a34a', // Verde - Herramientas Disponibles
      '#ef4444', // Rojo - Para el cuarto elemento
      '#8b5cf6'  // Púrpura - Para el quinto elemento
    ];

    this.doughnutChartData = {
      labels: top5.map(item => item.nombre),
      datasets: [{
        data: top5.map(item => item.total_prestamos),
        backgroundColor: colors.slice(0, top5.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  getPositionClass(index: number): string {
    return 'bg-primary text-white'; // Todos los lugares usan azul
  }
} 