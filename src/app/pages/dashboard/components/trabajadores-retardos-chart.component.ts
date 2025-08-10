import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService, Prestamo } from '../../service/reports.service';
import { Subject, takeUntil, interval } from 'rxjs';

interface TrabajadorRetardo {
  nombre: string;
  email: string;
  dias_atraso: number;
  prestamos_atrasados: string[];
  ultimo_prestamo: string;
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
                <h4 class="text-warning mb-0">{{ totalRetardos }}</h4>
                <small class="text-muted">Total Retardos</small>
              </div>
              <div class="stat-item bg-danger bg-opacity-10">
                <h4 class="text-danger mb-0">{{ promedioDiasAtraso | number:'1.0-0' }}</h4>
                <small class="text-muted">Promedio Días Atraso</small>
              </div>
              <div class="stat-item bg-info bg-opacity-10">
                <h4 class="text-info mb-0">{{ trabajadoresAfectados }}</h4>
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
                          Último préstamo: {{ trabajador.ultimo_prestamo | date:'shortDate' }}
                        </small>
                      </div>
                      <div class="retardo-metric-item">
                        <small class="text-muted">
                          <i class="pi pi-list me-1"></i>
                          {{ trabajador.prestamos_atrasados.length }} préstamos atrasados
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
    
    .stats-summary {
      margin-bottom: 1.5rem;
    }
    
    .stats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: space-between;
      align-items: stretch;
    }
    
    .stat-item {
      flex: 1;
      min-width: 200px;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      text-align: center;
    }
    
    .retardo-item {
      background-color: #f8f9fa;
      border-left: 4px solid #dee2e6;
      transition: all 0.2s ease;
    }
    
    .retardo-item:hover {
      background-color: #e9ecef;
      transform: translateX(5px);
    }
    
    .retardo-indicator {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    
    .retardo-leve {
      background-color: #ffc107;
    }
    
    .retardo-moderado {
      background-color: #fd7e14;
    }
    
    .retardo-critico {
      background-color: #dc3545;
    }
    
    .retardo-details {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
    
    .retardo-metrics-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .retardo-metric-item {
      flex: 1;
      min-width: 150px;
      text-align: center;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .retardo-metric-item .badge {
      display: block;
      margin: 0 auto 0.5rem auto;
      width: fit-content;
      min-width: 120px;
    }
    
    .retardo-metric-item small {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
  `]
})
export class TrabajadoresRetardosChartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private interval: any;
  
  loading = true;
  retardosData: TrabajadorRetardo[] = [];
  totalRetardos = 0;
  promedioDiasAtraso = 0;
  trabajadoresAfectados = 0;

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
          this.processRetardosData(prestamos);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando préstamos:', error);
          this.loading = false;
        }
      });
  }

  private processRetardosData(prestamos: Prestamo[]) {
    const hoy = new Date();
    const userRetardos = new Map<string, TrabajadorRetardo>();
    
    prestamos.forEach(prestamo => {
      if (prestamo.estado === 'activo' || prestamo.estado === 'vencido') {
        const fechaDevolucion = new Date(prestamo.fecha_devolucion_estimada);
        const diasAtraso = Math.ceil((hoy.getTime() - fechaDevolucion.getTime()) / (1000 * 60 * 60 * 24));
        
        // ← VALIDACIÓN: Solo procesar retrasos reales (fechas pasadas)
        if (diasAtraso > 0 && fechaDevolucion < hoy) {
          const key = prestamo.usuario_email;
          const existing = userRetardos.get(key);
          
          if (existing) {
            existing.dias_atraso = Math.max(existing.dias_atraso, diasAtraso);
            existing.prestamos_atrasados.push(prestamo.folio);
          } else {
            userRetardos.set(key, {
              nombre: prestamo.usuario_nombre,
              email: prestamo.usuario_email,
              dias_atraso: diasAtraso,
              prestamos_atrasados: [prestamo.folio],
              ultimo_prestamo: prestamo.fecha_solicitud
            });
          }
        }
      }
    });
    
    // Convertir a array y ordenar por días de atraso
    this.retardosData = Array.from(userRetardos.values())
      .sort((a, b) => b.dias_atraso - a.dias_atraso);
    
    // Calcular estadísticas
    this.totalRetardos = this.retardosData.reduce((sum, item) => sum + item.prestamos_atrasados.length, 0);
    this.promedioDiasAtraso = this.retardosData.length > 0 
      ? this.retardosData.reduce((sum, item) => sum + item.dias_atraso, 0) / this.retardosData.length
      : 0;
    this.trabajadoresAfectados = this.retardosData.length;
  }

  getRetardoClass(diasAtraso: number): string {
    if (diasAtraso <= 3) return 'retardo-leve';
    if (diasAtraso <= 7) return 'retardo-moderado';
    return 'retardo-critico';
  }

  getRetardoIcon(diasAtraso: number): string {
    if (diasAtraso <= 3) return 'pi-exclamation-circle';
    if (diasAtraso <= 7) return 'pi-exclamation-triangle';
    return 'pi-times-circle';
  }

  getDiasBadgeClass(diasAtraso: number): string {
    if (diasAtraso <= 3) return 'bg-warning text-dark';
    if (diasAtraso <= 7) return 'bg-warning text-dark';
    return 'bg-danger text-white';
  }
} 