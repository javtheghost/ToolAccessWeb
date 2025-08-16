import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../service/reports.service';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';

interface TrabajadorRetardo {
  usuario_id: number;
  nombre: string;
  email: string;
  dias_atraso: number;
  prestamos_atrasados: number;
  ultimo_prestamo: string;
  nivel_urgencia: 'critico' | 'advertencia' | 'normal';
}

interface ResumenRetardos {
  total_retardos: number;
  promedio_dias_atraso: number;
  trabajadores_afectados: number;
}

@Component({
  selector: 'app-trabajadores-retardos-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="pi pi-exclamation-triangle me-2"></i>
          Trabajadores con Retardos
        </h5>
      </div>
      <div class="card-body">
        <div *ngIf="loading" class="text-center py-4">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div *ngIf="!loading && (!retardosData || retardosData.length === 0)" class="text-center py-4">
          <i class="pi pi-check-circle text-success" style="font-size: 2rem;"></i>
          <p class="text-success mt-2">¡Excelente! No hay trabajadores con retardos</p>
        </div>
        
        <div *ngIf="!loading && retardosData && retardosData.length > 0">
          <!-- Resumen estadístico -->
          <div class="stats-summary mb-4">
            <div class="stats-grid">
              <div class="stat-item bg-warning bg-opacity-10">
                <h4 class="text-warning mb-0">{{ resumen?.total_retardos || 0 }}</h4>
                <small class="text-muted">Total Retardos</small>
              </div>
              <div class="stat-item bg-danger bg-opacity-10">
                <h4 class="text-danger mb-0">{{ resumen?.promedio_dias_atraso || 0 }}</h4>
                <small class="text-muted">Promedio Días Atraso</small>
              </div>
              <div class="stat-item bg-info bg-opacity-10">
                <h4 class="text-info mb-0">{{ resumen?.trabajadores_afectados || 0 }}</h4>
                <small class="text-muted">Trabajadores Afectados</small>
              </div>
            </div>
          </div>
          
          <!-- Lista de trabajadores con retardos -->
          <div class="retardos-list">
            <h6 class="text-muted mb-3">Detalle de Retardos</h6>
            <div *ngFor="let trabajador of retardosData; let i = index" 
                 class="retardo-item p-3 mb-3 rounded">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center mb-2">
                    <div class="retardo-indicator me-3" 
                         [ngClass]="getRetardoClass(trabajador.dias_atraso)">
                      <i class="pi" [ngClass]="getRetardoIcon(trabajador.dias_atraso)"></i>
                    </div>
                    <div>
                      <h6 class="mb-0 fw-bold">{{ trabajador.nombre }}</h6>
                      <small class="text-muted">{{ trabajador.email }}</small>
                    </div>
                  </div>
                  
                  <div class="retardo-details">
                    <div class="retardo-metrics-grid">
                      <div class="retardo-metric-item">
                        <span class="badge" [ngClass]="getDiasBadgeClass(trabajador.dias_atraso)">
                          {{ trabajador.dias_atraso }} días de atraso
                        </span>
                      </div>
                      <div class="retardo-metric-item">
                        <small class="text-muted">
                          <i class="pi pi-calendar me-1"></i>
                          Último préstamo: {{ trabajador.ultimo_prestamo }}
                        </small>
                      </div>
                      <div class="retardo-metric-item">
                        <small class="text-muted">
                          <i class="pi pi-list me-1"></i>
                          {{ trabajador.prestamos_atrasados }} préstamos atrasados
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="text-end">
                  <div class="fw-bold text-danger">{{ trabajador.dias_atraso }}</div>
                  <small class="text-muted">días</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }
    
    .stat-item {
      text-align: center;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(0,0,0,0.1);
    }
    
    .retardo-item {
      border: 1px solid rgba(0,0,0,0.1);
      background-color: #f8f9fa;
    }
    
    .retardo-indicator {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .retardo-indicator.critico {
      background-color: #dc3545;
    }
    
    .retardo-indicator.advertencia {
      background-color: #fd7e14;
    }
    
    .retardo-indicator.normal {
      background-color: #0dcaf0;
    }
    
    .retardo-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .retardo-metric-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .badge.critico {
      background-color: #dc3545;
      color: white;
    }
    
    .badge.advertencia {
      background-color: #fd7e14;
      color: white;
    }
    
    .badge.normal {
      background-color: #0dcaf0;
      color: white;
    }
  `]
})
export class TrabajadoresRetardosChartComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  resumen: ResumenRetardos | null = null;
  retardosData: TrabajadorRetardo[] = [];

  private destroy$ = new Subject<void>();

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.cargarTrabajadoresRetardos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async cargarTrabajadoresRetardos() {
    this.loading = true;
    this.error = null;

    try {
      const data = await firstValueFrom(
        this.reportsService.getTrabajadoresRetardos().pipe(
          takeUntil(this.destroy$)
        )
      );

      this.resumen = data.resumen;
      this.retardosData = data.detalle;
    } catch (error) {
      console.error('Error al cargar trabajadores con retardos:', error);
      this.error = 'Error al cargar datos de retardos';
    } finally {
      this.loading = false;
    }
  }

  getRetardoClass(diasAtraso: number): string {
    if (diasAtraso > 10) return 'critico';
    if (diasAtraso > 5) return 'advertencia';
    return 'normal';
  }

  getRetardoIcon(diasAtraso: number): string {
    if (diasAtraso > 10) return 'pi-times';
    if (diasAtraso > 5) return 'pi-exclamation-triangle';
    return 'pi-info-circle';
  }

  getDiasBadgeClass(diasAtraso: number): string {
    if (diasAtraso > 10) return 'critico';
    if (diasAtraso > 5) return 'advertencia';
    return 'normal';
  }
} 