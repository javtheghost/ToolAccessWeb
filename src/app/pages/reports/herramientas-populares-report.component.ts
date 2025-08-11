import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsTableComponent, ReportTableConfig } from './reports-table.component';
import { ReportsService, HerramientaPopular } from '../service/reports.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-herramientas-populares-report',
  standalone: true,
  imports: [CommonModule, ReportsTableComponent, ToastModule],
  template: `
    <p-toast></p-toast>

    <app-reports-table
      [config]="tableConfig"
      [loading]="loading"
      (refreshRequested)="loadData()"
    >
      <!-- Contenido de la tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Herramienta</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veces Prestada</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let item of data; let i = index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ i + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.folio }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.categoria }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.veces_prestada }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.stock }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-reports-table>
  `
})
export class HerramientasPopularesReportComponent implements OnInit {
  data: HerramientaPopular[] = [];
  loading = false;

  // Configuración de rate limiting para este reporte específico
  tableConfig: ReportTableConfig = {
    endpoint: 'reports-herramientas-populares',
    title: 'Herramientas Más Prestadas',
    subtitle: 'Reporte de las herramientas con mayor demanda en el sistema',
    maxRequests: 4,        // 4 peticiones por minuto (reportes pesados)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000, // 30 segundos de cooldown
    debounceTime: 2000,    // 2 segundos de debounce
    showRefreshButton: true,
    showRateLimitInfo: true
  };

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.reportsService.getHerramientasPopulares().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Datos de herramientas populares cargados correctamente',
          life: 2000
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al cargar datos de herramientas populares',
          life: 3000
        });
      }
    });
  }
}
