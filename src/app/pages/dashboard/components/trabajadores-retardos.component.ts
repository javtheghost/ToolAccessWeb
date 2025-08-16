import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../service/reports.service';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

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
  selector: 'app-trabajadores-retardos',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    CardModule,
    BadgeModule,
    TooltipModule
  ],
  template: `
    <div class="card">
      <h5 class="mb-3">
        <i class="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
        Trabajadores con Retardos
      </h5>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-content-center">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="p-3 bg-red-100 border-round text-red-700">
        {{ error }}
      </div>

      <!-- Datos -->
      <div *ngIf="!loading && !error && resumen" class="mb-4">
        <!-- Resumen -->
        <div class="grid">
          <div class="col-4">
            <div class="text-center p-3 bg-blue-100 border-round">
              <div class="text-xl font-bold text-blue-700">{{ resumen.total_retardos }}</div>
              <div class="text-sm text-blue-600">Total Retardos</div>
            </div>
          </div>
          <div class="col-4">
            <div class="text-center p-3 bg-orange-100 border-round">
              <div class="text-xl font-bold text-orange-700">{{ resumen.promedio_dias_atraso }}</div>
              <div class="text-sm text-orange-600">Promedio Días Atraso</div>
            </div>
          </div>
          <div class="col-4">
            <div class="text-center p-3 bg-red-100 border-round">
              <div class="text-xl font-bold text-red-700">{{ resumen.trabajadores_afectados }}</div>
              <div class="text-sm text-red-600">Trabajadores Afectados</div>
            </div>
          </div>
        </div>

        <!-- Detalle -->
        <div *ngIf="trabajadores.length > 0">
          <h6 class="mb-3">Detalle de Retardos</h6>
          <div class="space-y-3">
            <div *ngFor="let trabajador of trabajadores" 
                 class="p-3 border-round border-1 border-gray-200 hover:bg-gray-50 transition-colors">
              
              <div class="flex align-items-center justify-content-between">
                <!-- Información del trabajador -->
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">{{ trabajador.nombre }}</div>
                  <div class="text-sm text-gray-600">{{ trabajador.email }}</div>
                  
                  <div class="flex align-items-center gap-3 mt-2">
                    <i class="pi pi-calendar text-gray-500"></i>
                    <span class="text-sm text-gray-600">Último préstamo: {{ trabajador.ultimo_prestamo }}</span>
                    
                    <i class="pi pi-list text-gray-500"></i>
                    <span class="text-sm text-gray-600">{{ trabajador.prestamos_atrasados }} préstamos atrasados</span>
                  </div>
                </div>

                <!-- Indicadores de urgencia -->
                <div class="flex align-items-center gap-3">
                  <!-- Días de atraso -->
                  <div [ngClass]="getDiasAtrasoClass(trabajador.nivel_urgencia)" 
                       class="px-3 py-1 border-round font-semibold text-white">
                    {{ trabajador.dias_atraso }} días de atraso
                  </div>

                  <!-- Icono de urgencia -->
                  <div [ngClass]="getUrgenciaIconClass(trabajador.nivel_urgencia)" 
                       class="w-2rem h-2rem border-circle flex align-items-center justify-content-center">
                    <i [class]="getUrgenciaIcon(trabajador.nivel_urgencia)"></i>
                  </div>

                  <!-- Días en texto pequeño -->
                  <span class="text-sm text-gray-500">{{ trabajador.dias_atraso }} días</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin retardos -->
        <div *ngIf="trabajadores.length === 0" class="text-center p-4 text-gray-500">
          <i class="pi pi-check-circle text-3xl text-green-500 mb-2"></i>
          <div>No hay trabajadores con préstamos atrasados</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .space-y-3 > * + * {
      margin-top: 0.75rem;
    }
    
    .hover\\:bg-gray-50:hover {
      background-color: #f9fafb;
    }
    
    .transition-colors {
      transition: background-color 0.2s ease;
    }
  `]
})
export class TrabajadoresRetardosComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  resumen: ResumenRetardos | null = null;
  trabajadores: TrabajadorRetardo[] = [];

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
      this.trabajadores = data.detalle;
    } catch (error) {
      console.error('Error al cargar trabajadores con retardos:', error);
      this.error = 'Error al cargar datos de retardos';
    } finally {
      this.loading = false;
    }
  }

  getDiasAtrasoClass(nivel: string): string {
    switch (nivel) {
      case 'critico':
        return 'bg-red-500';
      case 'advertencia':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  }

  getUrgenciaIconClass(nivel: string): string {
    switch (nivel) {
      case 'critico':
        return 'bg-red-500';
      case 'advertencia':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  }

  getUrgenciaIcon(nivel: string): string {
    switch (nivel) {
      case 'critico':
        return 'pi pi-times';
      case 'advertencia':
        return 'pi pi-exclamation-triangle';
      default:
        return 'pi pi-info-circle';
    }
  }
} 