import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ReportsService } from '../../service/reports.service';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-herramientas-populares-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="pi pi-chart-bar me-2"></i>
          Herramientas Más Solicitadas
        </h5>
      </div>
      <div class="card-body">
        <div *ngIf="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div *ngIf="!loading && (!chartData || chartData.length === 0)" class="text-center py-4">
          <i class="pi pi-info-circle text-muted" style="font-size: 2rem;"></i>
          <p class="text-muted mt-2">No hay datos disponibles</p>
        </div>
        
        <div *ngIf="!loading && chartData && chartData.length > 0" class="chart-container">
          <canvas baseChart
            [data]="barChartData"
            [options]="barChartOptions"
            [type]="barChartType">
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
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
  `]
})
export class HerramientasPopularesChartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private interval: any;
  
  loading = true;
  chartData: any[] = [];
  
  public barChartType = 'bar' as const;
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const item = this.chartData[dataIndex];
            return [
              `Herramienta: ${item.nombre}`,
              `Categoría: ${item.categoria}`,
              `Veces prestada: ${item.veces_prestada}`,
              `Stock: ${item.stock}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de préstamos'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Herramientas'
        }
      }
    }
  };

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadData();
    // Actualización automática cada 15 segundos para mayor tiempo real
    this.interval = setInterval(() => {
      this.loadData();
    }, 15000);
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
    this.reportsService.getHerramientasPopulares()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chartData = data.slice(0, 10); // Top 10 herramientas
          this.updateChart();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando herramientas populares:', error);
          this.loading = false;
        }
      });
  }

  private updateChart() {
    if (!this.chartData || this.chartData.length === 0) return;

    const colors = [
      '#3b82f6', // Azul - Herramientas Activas
      '#f59e0b', // Naranja - Préstamos Activos
      '#16a34a', // Verde - Herramientas Disponibles
      '#ef4444', // Rojo - Para el cuarto elemento
      '#8b5cf6', // Púrpura - Para el quinto elemento
      '#3b82f6', // Azul (repetido para el sexto)
      '#f59e0b', // Naranja (repetido para el séptimo)
      '#16a34a', // Verde (repetido para el octavo)
      '#ef4444', // Rojo (repetido para el noveno)
      '#8b5cf6'  // Púrpura (repetido para el décimo)
    ];

    this.barChartData = {
      labels: this.chartData.map(item => item.nombre),
      datasets: [{
        data: this.chartData.map(item => item.veces_prestada),
        backgroundColor: colors.slice(0, this.chartData.length),
        borderColor: colors.slice(0, this.chartData.length),
        borderWidth: 1
      }]
    };
  }
} 