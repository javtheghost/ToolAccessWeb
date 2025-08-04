import { Component, OnInit } from '@angular/core';
import { ReportsService, Estadisticas, Prestamo, Multa, HerramientaPopular } from '../../service/reports.service';
import { MessageService } from 'primeng/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OAuthService } from '../../service/oauth.service';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
  providers: [MessageService]
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
  filtroFechaInicio: Date | null = null;
  filtroFechaFin: Date | null = null;
  filtroRangoFechas: any = null;
  limiteHerramientas: number = 10;

  // Variables de estado
  loading: boolean = false;
  reportes: any[] = [];

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService,
    private oauthService: OAuthService
  ) { }

  ngOnInit() {
    this.cargarReportesGuardados();
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
    } catch (error) {
      console.error('Error generando reporte:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al generar el reporte'
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
        
        // Fecha
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        
        // Estadísticas de Herramientas
        doc.setFontSize(16);
        doc.text('Estadísticas de Herramientas', 20, 50);
        doc.setFontSize(12);
        doc.text(`Total de herramientas: ${data.herramientas.total_herramientas}`, 30, 65);
        doc.text(`Herramientas activas: ${data.herramientas.herramientas_activas}`, 30, 75);
        doc.text(`Herramientas disponibles: ${data.herramientas.disponibles}`, 30, 85);
        doc.text(`Herramientas prestadas: ${data.herramientas.prestadas}`, 30, 95);
        doc.text(`Herramientas dañadas: ${data.herramientas.danadas}`, 30, 105);
        
        // Estadísticas de Préstamos
        doc.setFontSize(16);
        doc.text('Estadísticas de Préstamos', 20, 125);
        doc.setFontSize(12);
        doc.text(`Total de préstamos: ${data.prestamos.total_prestamos}`, 30, 140);
        doc.text(`Préstamos activos: ${data.prestamos.activos}`, 30, 150);
        doc.text(`Préstamos devueltos: ${data.prestamos.devueltos}`, 30, 160);
        doc.text(`Préstamos vencidos: ${data.prestamos.vencidos}`, 30, 170);
        
        // Estadísticas de Multas
        doc.setFontSize(16);
        doc.text('Estadísticas de Multas', 20, 190);
        doc.setFontSize(12);
        doc.text(`Total de multas: ${data.multas.total_multas}`, 30, 205);
        doc.text(`Multas pendientes: ${data.multas.pendientes}`, 30, 215);
        doc.text(`Multas pagadas: ${data.multas.pagadas}`, 30, 225);
        doc.text(`Monto pendiente: $${data.multas.monto_pendiente}`, 30, 235);
        doc.text(`Monto cobrado: $${data.multas.monto_cobrado}`, 30, 245);
        
        const nombreArchivo = `Reporte_Estadisticas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, 'Estadísticas generales del sistema');
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de estadísticas generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo estadísticas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener las estadísticas'
        });
      }
    });
  }

  async generarReportePrestamos() {
    const fechaInicio = this.filtroFechaInicio ? this.filtroFechaInicio.toISOString() : undefined;
    const fechaFin = this.filtroFechaFin ? this.filtroFechaFin.toISOString() : undefined;
    
    this.reportsService.getReportePrestamos(fechaInicio, fechaFin, this.filtroEstado).subscribe({
      next: (prestamos: Prestamo[]) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Préstamos', 20, 20);
        
        // Filtros aplicados
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        if (fechaInicio || fechaFin || this.filtroEstado) {
          doc.text('Filtros aplicados:', 20, 45);
          let y = 55;
          if (fechaInicio) doc.text(`Desde: ${new Date(fechaInicio).toLocaleDateString()}`, 30, y);
          if (fechaFin) doc.text(`Hasta: ${new Date(fechaFin).toLocaleDateString()}`, 30, y + 10);
          if (this.filtroEstado) doc.text(`Estado: ${this.filtroEstado}`, 30, y + 20);
        }
        
        // Tabla de préstamos
        if (prestamos.length > 0) {
          const tableData = prestamos.map(p => [
            p.herramienta_nombre,
            p.username,
            p.categoria_nombre,
            new Date(p.fecha_prestamo).toLocaleDateString(),
            new Date(p.fecha_devolucion_estimada).toLocaleDateString(),
            p.estado
          ]);
          
          autoTable(doc, {
            head: [['Herramienta', 'Usuario', 'Categoría', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']],
            body: tableData,
            startY: 80,
            styles: { fontSize: 8 }
          });
        } else {
          doc.text('No se encontraron préstamos con los filtros aplicados', 20, 80);
        }
        
        const nombreArchivo = `Reporte_Prestamos_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, `Reporte de préstamos (${prestamos.length} registros)`);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de préstamos generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo préstamos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener los préstamos'
        });
      }
    });
  }

  async generarReporteMultas() {
    const fechaInicio = this.filtroFechaInicio ? this.filtroFechaInicio.toISOString() : undefined;
    const fechaFin = this.filtroFechaFin ? this.filtroFechaFin.toISOString() : undefined;
    
    this.reportsService.getReporteMultas(fechaInicio, fechaFin, this.filtroEstado).subscribe({
      next: (multas: Multa[]) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Multas', 20, 20);
        
        // Filtros aplicados
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        if (fechaInicio || fechaFin || this.filtroEstado) {
          doc.text('Filtros aplicados:', 20, 45);
          let y = 55;
          if (fechaInicio) doc.text(`Desde: ${new Date(fechaInicio).toLocaleDateString()}`, 30, y);
          if (fechaFin) doc.text(`Hasta: ${new Date(fechaFin).toLocaleDateString()}`, 30, y + 10);
          if (this.filtroEstado) doc.text(`Estado: ${this.filtroEstado}`, 30, y + 20);
        }
        
        // Tabla de multas
        if (multas.length > 0) {
          const tableData = multas.map(m => [
            m.prestamo_id,
            `$${m.monto}`,
            m.motivo,
            m.estado,
            new Date(m.fecha_creacion).toLocaleDateString(),
            m.fecha_pago ? new Date(m.fecha_pago).toLocaleDateString() : '-'
          ]);
          
          autoTable(doc, {
            head: [['Préstamo ID', 'Monto', 'Motivo', 'Estado', 'Fecha Creación', 'Fecha Pago']],
            body: tableData,
            startY: 80,
            styles: { fontSize: 8 }
          });
        } else {
          doc.text('No se encontraron multas con los filtros aplicados', 20, 80);
        }
        
        const nombreArchivo = `Reporte_Multas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, `Reporte de multas (${multas.length} registros)`);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de multas generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo multas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener las multas'
        });
      }
    });
  }

  async generarReporteHerramientasPopulares() {
    this.reportsService.getHerramientasPopulares(this.limiteHerramientas).subscribe({
      next: (herramientas: HerramientaPopular[]) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Herramientas Más Prestadas', 20, 20);
        
        // Información del reporte
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        doc.text(`Límite: ${this.limiteHerramientas} herramientas`, 20, 45);
        
        // Tabla de herramientas
        if (herramientas.length > 0) {
          const tableData = herramientas.map(h => [
            h.nombre,
            h.categoria,
            h.subcategoria,
            h.veces_prestada.toString()
          ]);
          
          autoTable(doc, {
            head: [['Herramienta', 'Categoría', 'Subcategoría', 'Veces Prestada']],
            body: tableData,
            startY: 60,
            styles: { fontSize: 8 }
          });
        } else {
          doc.text('No se encontraron herramientas populares', 20, 60);
        }
        
        const nombreArchivo = `Reporte_Herramientas_Populares_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, `Herramientas más prestadas (${herramientas.length} registros)`);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de herramientas populares generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo herramientas populares:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener las herramientas populares'
        });
      }
    });
  }

  limpiarFiltros() {
    this.filtroTipoReporte = '';
    this.filtroEstado = '';
    this.filtroFechaInicio = null;
    this.filtroFechaFin = null;
    this.filtroRangoFechas = null;
    this.limiteHerramientas = 10;
  }

  trackByReporte(index: number, reporte: any): string {
    return reporte.nombre;
  }
}
