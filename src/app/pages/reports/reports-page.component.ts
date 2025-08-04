import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ReportsService, Estadisticas, Prestamo, Multa, HerramientaPopular } from '../service/reports.service';
import { MessageService } from 'primeng/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OAuthService } from '../service/oauth.service';
import { CustomDateRangeComponent } from '../utils/custom-date-range.component';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
    CustomDateRangeComponent
  ]
})
export class ReportsPageComponent implements OnInit {
  // Opciones de filtros
  tiposReporte = [
    { label: 'Estadísticas Generales', value: 'estadisticas' },
    { label: 'Reporte de Préstamos', value: 'prestamos' },
    { label: 'Reporte de Multas', value: 'multas' },
    { label: 'Herramientas Más Prestadas', value: 'herramientas-populares' }
  ];

  estados = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'activo' },
    { label: 'Devuelto', value: 'devuelto' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pagada', value: 'pagada' }
  ];

  // Variables de filtros
  filtroTipoReporte: string = '';
  filtroEstado: string = '';
  filtroRangoFechas: { startDate: Date | null; endDate: Date | null } | null = null;
  limiteHerramientas: number = 10;

  // Variables de estado
  loading: boolean = false;
  reportes: any[] = [];
  estadisticas: Estadisticas | null = null;

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService,
    private oauthService: OAuthService
  ) { }

  ngOnInit() {
    this.cargarReportesGuardados();
    this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    try {
      const stats = await this.reportsService.getEstadisticas().toPromise();
      this.estadisticas = stats || null;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // Si no se pueden cargar las estadísticas, no mostramos el error al usuario
    }
  }

  scrollToConfig() {
    const configSection = document.querySelector('.config-section');
    if (configSection) {
      configSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cargarReportesGuardados() {
    const reportesGuardados = localStorage.getItem('reportes_generados');
    if (reportesGuardados) {
      this.reportes = JSON.parse(reportesGuardados);
    }
  }

  guardarReporte(nombreArchivo: string, descripcion: string) {
    const reporte = {
      nombre: nombreArchivo,
      descripcion: descripcion,
      fecha: new Date().toISOString(),
      tipo: this.filtroTipoReporte
    };

    this.reportes.unshift(reporte);
    if (this.reportes.length > 10) {
      this.reportes = this.reportes.slice(0, 10);
    }

    localStorage.setItem('reportes_generados', JSON.stringify(this.reportes));
  }

  async generarReporte() {
    if (!this.filtroTipoReporte) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor selecciona un tipo de reporte'
      });
      return;
    }

    // Verificar autenticación
    if (!this.oauthService.isAuthenticated()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debes iniciar sesión para generar reportes'
      });
      return;
    }

    this.loading = true;

    try {
      switch (this.filtroTipoReporte) {
        case 'estadisticas':
          await this.generarReporteEstadisticas();
          break;
        case 'prestamos':
          await this.generarReportePrestamos();
          break;
        case 'multas':
          await this.generarReporteMultas();
          break;
        case 'herramientas-populares':
          await this.generarReporteHerramientasPopulares();
          break;
        default:
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Tipo de reporte no válido'
          });
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al generar el reporte'
      });
    } finally {
      this.loading = false;
    }
  }

  async generarReporteEstadisticas() {
    this.reportsService.getEstadisticas().subscribe({
      next: (data: Estadisticas) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Estadísticas Generales', 20, 20);

        // Información del reporte
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Generado por: ${(this.oauthService.getCurrentUser() as any)?.email || 'Usuario'}`, 20, 45);

        // Estadísticas
        doc.setFontSize(14);
        doc.text('Estadísticas del Sistema:', 20, 65);

        doc.setFontSize(10);
        let y = 80;

        if (data.herramientas) {
          doc.text(`Total de herramientas: ${data.herramientas.total_herramientas || 0}`, 20, y);
          y += 10;
          doc.text(`Herramientas disponibles: ${data.herramientas.disponibles || 0}`, 20, y);
          y += 10;
          doc.text(`Herramientas prestadas: ${data.herramientas.prestadas || 0}`, 20, y);
          y += 15;
        }

        if (data.prestamos) {
          doc.text(`Total de préstamos: ${data.prestamos.total_prestamos || 0}`, 20, y);
          y += 10;
          doc.text(`Préstamos activos: ${data.prestamos.activos || 0}`, 20, y);
          y += 10;
          doc.text(`Préstamos vencidos: ${data.prestamos.vencidos || 0}`, 20, y);
          y += 15;
        }

        if (data.multas) {
          doc.text(`Total de multas: ${data.multas.total_multas || 0}`, 20, y);
          y += 10;
          doc.text(`Multas pagadas: ${data.multas.pagadas || 0}`, 20, y);
          y += 10;
          doc.text(`Multas pendientes: ${data.multas.pendientes || 0}`, 20, y);
          y += 15;
        }

        const nombreArchivo = `estadisticas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);

        this.guardarReporte(nombreArchivo, 'Reporte de estadísticas generales del sistema');

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de estadísticas generado correctamente'
        });
      },
      error: (error: any) => {
        console.error('Error al obtener estadísticas:', error);

        let mensaje = 'Error al obtener estadísticas';
        if (error.status === 500) {
          mensaje = 'Los endpoints de reportes no están disponibles en la API. Contacta al administrador.';
        } else if (error.status === 401) {
          mensaje = 'No tienes permisos para acceder a los reportes.';
        } else if (error.status === 403) {
          mensaje = 'Acceso denegado. Necesitas permisos de administrador.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
      }
    });
  }

  async generarReportePrestamos() {
    const params = new URLSearchParams();
    if (this.filtroEstado) params.append('estado', this.filtroEstado);
    if (this.filtroRangoFechas?.startDate) params.append('fecha_inicio', this.filtroRangoFechas.startDate.toISOString());
    if (this.filtroRangoFechas?.endDate) params.append('fecha_fin', this.filtroRangoFechas.endDate.toISOString());

    this.reportsService.getReportePrestamos(params.toString()).subscribe({
      next: (data: Prestamo[]) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Préstamos', 20, 20);

        // Información del reporte
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Generado por: ${(this.oauthService.getCurrentUser() as any)?.email || 'Usuario'}`, 20, 45);

        if (data.length > 0) {
          // Tabla de préstamos
          const tableData = data.map((prestamo: any) => [
            prestamo.id || '',
            prestamo.folio || '',
            prestamo.usuario_nombre || '',
            prestamo.fecha_solicitud ? new Date(prestamo.fecha_solicitud).toLocaleDateString() : '',
            prestamo.fecha_devolucion_estimada ? new Date(prestamo.fecha_devolucion_estimada).toLocaleDateString() : '',
            prestamo.estado || ''
          ]);

          autoTable(doc, {
            head: [['ID', 'Folio', 'Usuario', 'Fecha Solicitud', 'Fecha Devolución', 'Estado']],
            body: tableData,
            startY: 60,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
          });
        } else {
          doc.setFontSize(12);
          doc.text('No se encontraron préstamos con los filtros aplicados', 20, 60);
        }

        const nombreArchivo = `prestamos_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);

        this.guardarReporte(nombreArchivo, `Reporte de préstamos - ${data.length} registros`);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Reporte de préstamos generado con ${data.length} registros`
        });
      },
      error: (error: any) => {
        console.error('Error al obtener préstamos:', error);

        let mensaje = 'Error al obtener préstamos';
        if (error.status === 500) {
          mensaje = 'Los endpoints de reportes no están disponibles en la API. Contacta al administrador.';
        } else if (error.status === 401) {
          mensaje = 'No tienes permisos para acceder a los reportes.';
        } else if (error.status === 403) {
          mensaje = 'Acceso denegado. Necesitas permisos de administrador.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
      }
    });
  }

  async generarReporteMultas() {
    const params = new URLSearchParams();
    if (this.filtroEstado) params.append('estado', this.filtroEstado);
    if (this.filtroRangoFechas?.startDate) params.append('fecha_inicio', this.filtroRangoFechas.startDate.toISOString());
    if (this.filtroRangoFechas?.endDate) params.append('fecha_fin', this.filtroRangoFechas.endDate.toISOString());

    this.reportsService.getReporteMultas(params.toString()).subscribe({
      next: (data: Multa[]) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Multas', 20, 20);

        // Información del reporte
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Generado por: ${(this.oauthService.getCurrentUser() as any)?.email || 'Usuario'}`, 20, 45);

        if (data.length > 0) {
          // Tabla de multas
          const tableData = data.map((multa: any) => [
            multa.id || '',
            multa.usuario_nombre || '',
            multa.monto ? `$${multa.monto}` : '',
            multa.motivo || '',
            multa.fecha_creacion ? new Date(multa.fecha_creacion).toLocaleDateString() : '',
            multa.estado || ''
          ]);

          autoTable(doc, {
            head: [['ID', 'Usuario', 'Monto', 'Motivo', 'Fecha', 'Estado']],
            body: tableData,
            startY: 60,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [231, 76, 60] }
          });
        } else {
          doc.setFontSize(12);
          doc.text('No se encontraron multas con los filtros aplicados', 20, 60);
        }

        const nombreArchivo = `multas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);

        this.guardarReporte(nombreArchivo, `Reporte de multas - ${data.length} registros`);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Reporte de multas generado con ${data.length} registros`
        });
      },
      error: (error: any) => {
        console.error('Error al obtener multas:', error);

        let mensaje = 'Error al obtener multas';
        if (error.status === 500) {
          mensaje = 'Los endpoints de reportes no están disponibles en la API. Contacta al administrador.';
        } else if (error.status === 401) {
          mensaje = 'No tienes permisos para acceder a los reportes.';
        } else if (error.status === 403) {
          mensaje = 'Acceso denegado. Necesitas permisos de administrador.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
      }
    });
  }

  async generarReporteHerramientasPopulares() {
    const params = new URLSearchParams();
    if (this.limiteHerramientas) params.append('limite', this.limiteHerramientas.toString());

    this.reportsService.getHerramientasPopulares(params.toString()).subscribe({
      next: (data: HerramientaPopular[]) => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Herramientas Más Prestadas', 20, 20);

        // Información del reporte
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Generado por: ${(this.oauthService.getCurrentUser() as any)?.email || 'Usuario'}`, 20, 45);

        if (data.length > 0) {
          // Tabla de herramientas populares
          const tableData = data.map((herramienta: any) => [
            herramienta.nombre || '',
            herramienta.folio || '',
            herramienta.categoria || '',
            herramienta.subcategoria || '',
            herramienta.veces_prestada || 0,
            herramienta.stock || 0
          ]);

          autoTable(doc, {
            head: [['Herramienta', 'Folio', 'Categoría', 'Subcategoría', 'Veces Prestada', 'Stock']],
            body: tableData,
            startY: 60,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [46, 204, 113] }
          });
        } else {
          doc.setFontSize(12);
          doc.text('No se encontraron herramientas populares', 20, 60);
        }

        const nombreArchivo = `herramientas_populares_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);

        this.guardarReporte(nombreArchivo, `Reporte de herramientas populares - ${data.length} registros`);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Reporte de herramientas populares generado con ${data.length} registros`
        });
      },
      error: (error: any) => {
        console.error('Error al obtener herramientas populares:', error);

        let mensaje = 'Error al obtener herramientas populares';
        if (error.status === 500) {
          mensaje = 'Los endpoints de reportes no están disponibles en la API. Contacta al administrador.';
        } else if (error.status === 401) {
          mensaje = 'No tienes permisos para acceder a los reportes.';
        } else if (error.status === 403) {
          mensaje = 'Acceso denegado. Necesitas permisos de administrador.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
      }
    });
  }

  limpiarFiltros() {
    this.filtroTipoReporte = '';
    this.filtroEstado = '';
    this.filtroRangoFechas = null;
    this.limiteHerramientas = 10;
  }

  trackByReporte(index: number, reporte: any): string {
    return reporte.nombre || index.toString();
  }
}
