import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CustomDateRangeComponent } from '../utils/custom-date-range.component';
import { ReportsService, Estadisticas, ReportePrestamos, ReporteMultas, ReporteHerramientasPopulares } from '../service/reports.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Reporte {
  nombre: string;
  fecha: string;
  descripcion: string;
  descargarUrl: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DropdownModule, 
    ButtonModule, 
    CustomDateRangeComponent,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsPageComponent implements OnInit {
  tiposReporte = [
    { label: 'Seleccionar...', value: '' },
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

  filtroTipoReporte: string = '';
  filtroEstado: string = '';
  filtroFechaInicio: Date | null = null;
  filtroFechaFin: Date | null = null;
  filtroRangoFechas: { startDate: Date | null; endDate: Date | null } = { startDate: null, endDate: null };
  limiteHerramientas: number = 10;

  reportes: Reporte[] = [];
  loading = false;
  usandoDatosPrueba = false;

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarReportesGuardados();
    
    // Suscribirse a cambios en el uso de datos de prueba
    this.reportsService.usingMockData$.subscribe(usingMock => {
      this.usandoDatosPrueba = usingMock;
      console.log('📊 Usando datos de prueba:', usingMock);
    });
  }

  cargarReportesGuardados() {
    // Cargar reportes guardados desde localStorage
    const reportesGuardados = localStorage.getItem('reportes_generados');
    if (reportesGuardados) {
      this.reportes = JSON.parse(reportesGuardados);
    }
  }

  guardarReporte(nombre: string, descripcion: string) {
    const nuevoReporte: Reporte = {
      nombre: nombre,
      fecha: new Date().toLocaleString('es-ES'),
      descripcion: descripcion,
      descargarUrl: '#'
    };

    this.reportes.unshift(nuevoReporte);
    
    // Guardar en localStorage
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
    const isAuthenticated = this.reportsService['oauthService'].isAuthenticated();
    const token = this.reportsService['oauthService'].getToken();
    const user = this.reportsService['oauthService'].getCurrentUser();

    console.log('🔍 Estado de autenticación:', {
      isAuthenticated,
      hasToken: !!token,
      user: user ? (user as any).username || user.email || 'Usuario' : 'No user'
    });

    if (!isAuthenticated || !token) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Autenticación',
        detail: 'Debes estar autenticado para generar reportes'
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
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al generar el reporte. Por favor intenta de nuevo.'
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
        
        // Indicador de datos de prueba si es necesario
        if (data.fecha_reporte) {
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text('* Datos de prueba - API no disponible', 20, 45);
          doc.setTextColor(0, 0, 0);
        }
        
        // Estadísticas de herramientas
        doc.setFontSize(16);
        doc.text('Estadísticas de Herramientas', 20, 60);
        doc.setFontSize(12);
        doc.text(`Total de herramientas: ${data.herramientas.total_herramientas}`, 30, 75);
        doc.text(`Herramientas activas: ${data.herramientas.herramientas_activas}`, 30, 85);
        doc.text(`Herramientas disponibles: ${data.herramientas.disponibles}`, 30, 95);
        doc.text(`Herramientas prestadas: ${data.herramientas.prestadas}`, 30, 105);
        doc.text(`Herramientas dañadas: ${data.herramientas.danadas}`, 30, 115);
        
        // Estadísticas de préstamos
        doc.setFontSize(16);
        doc.text('Estadísticas de Préstamos', 20, 135);
        doc.setFontSize(12);
        doc.text(`Total de préstamos: ${data.prestamos.total_prestamos}`, 30, 150);
        doc.text(`Préstamos activos: ${data.prestamos.activos}`, 30, 160);
        doc.text(`Préstamos devueltos: ${data.prestamos.devueltos}`, 30, 170);
        doc.text(`Préstamos vencidos: ${data.prestamos.vencidos}`, 30, 180);
        
        // Estadísticas de multas
        doc.setFontSize(16);
        doc.text('Estadísticas de Multas', 20, 200);
        doc.setFontSize(12);
        doc.text(`Total de multas: ${data.multas.total_multas}`, 30, 215);
        doc.text(`Multas pendientes: ${data.multas.pendientes}`, 30, 225);
        doc.text(`Multas pagadas: ${data.multas.pagadas}`, 30, 235);
        
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
    const fechaInicio = this.filtroRangoFechas.startDate?.toISOString().split('T')[0];
    const fechaFin = this.filtroRangoFechas.endDate?.toISOString().split('T')[0];
    
    this.reportsService.getReportePrestamos(fechaInicio, fechaFin, this.filtroEstado).subscribe({
      next: (data: ReportePrestamos) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Préstamos', 20, 20);
        
        // Fecha
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        
        // Filtros aplicados
        if (fechaInicio || fechaFin || this.filtroEstado) {
          doc.text('Filtros aplicados:', 20, 50);
          let yPos = 60;
          if (fechaInicio) doc.text(`Fecha inicio: ${fechaInicio}`, 30, yPos);
          if (fechaFin) doc.text(`Fecha fin: ${fechaFin}`, 30, yPos + 10);
          if (this.filtroEstado) doc.text(`Estado: ${this.filtroEstado}`, 30, yPos + 20);
        }
        
        // Tabla de préstamos
        if (data.prestamos && data.prestamos.length > 0) {
          const tableData = data.prestamos.map(prestamo => [
            prestamo.herramienta_nombre,
            prestamo.username,
            prestamo.categoria_nombre,
            new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES'),
            prestamo.estado
          ]);
          
          autoTable(doc, {
            head: [['Herramienta', 'Usuario', 'Categoría', 'Fecha Préstamo', 'Estado']],
            body: tableData,
            startY: 80,
            styles: {
              fontSize: 8
            },
            headStyles: {
              fillColor: [41, 128, 185]
            }
          });
        } else {
          doc.text('No se encontraron préstamos con los filtros aplicados', 20, 80);
        }
        
        const nombreArchivo = `Reporte_Prestamos_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, `Reporte de préstamos - Total: ${data.total}`);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de préstamos generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo reporte de préstamos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener el reporte de préstamos'
        });
      }
    });
  }

  async generarReporteMultas() {
    const fechaInicio = this.filtroRangoFechas.startDate?.toISOString().split('T')[0];
    const fechaFin = this.filtroRangoFechas.endDate?.toISOString().split('T')[0];
    
    this.reportsService.getReporteMultas(fechaInicio, fechaFin, this.filtroEstado).subscribe({
      next: (data: ReporteMultas) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Multas', 20, 20);
        
        // Fecha
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        
        // Filtros aplicados
        if (fechaInicio || fechaFin || this.filtroEstado) {
          doc.text('Filtros aplicados:', 20, 50);
          let yPos = 60;
          if (fechaInicio) doc.text(`Fecha inicio: ${fechaInicio}`, 30, yPos);
          if (fechaFin) doc.text(`Fecha fin: ${fechaFin}`, 30, yPos + 10);
          if (this.filtroEstado) doc.text(`Estado: ${this.filtroEstado}`, 30, yPos + 20);
        }
        
        // Tabla de multas
        if (data.multas && data.multas.length > 0) {
          const tableData = data.multas.map(multa => [
            multa.username,
            multa.herramienta_nombre || 'N/A',
            `$${multa.monto.toFixed(2)}`,
            new Date(multa.fecha_multa).toLocaleDateString('es-ES'),
            multa.estado
          ]);
          
          autoTable(doc, {
            head: [['Usuario', 'Herramienta', 'Monto', 'Fecha Multa', 'Estado']],
            body: tableData,
            startY: 80,
            styles: {
              fontSize: 8
            },
            headStyles: {
              fillColor: [231, 76, 60]
            }
          });
        } else {
          doc.text('No se encontraron multas con los filtros aplicados', 20, 80);
        }
        
        const nombreArchivo = `Reporte_Multas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, `Reporte de multas - Total: ${data.total}`);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de multas generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo reporte de multas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener el reporte de multas'
        });
      }
    });
  }

  async generarReporteHerramientasPopulares() {
    this.reportsService.getHerramientasPopulares(this.limiteHerramientas).subscribe({
      next: (data: ReporteHerramientasPopulares) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Reporte de Herramientas Más Prestadas', 20, 20);
        
        // Fecha
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
        doc.text(`Límite: ${data.limite} herramientas`, 20, 45);
        
        // Tabla de herramientas populares
        if (data.herramientas_populares && data.herramientas_populares.length > 0) {
          const tableData = data.herramientas_populares.map(herramienta => [
            herramienta.nombre,
            herramienta.categoria,
            herramienta.subcategoria,
            herramienta.total_prestamos.toString(),
            herramienta.prestamos_activos.toString()
          ]);
          
          autoTable(doc, {
            head: [['Herramienta', 'Categoría', 'Subcategoría', 'Total Préstamos', 'Préstamos Activos']],
            body: tableData,
            startY: 60,
            styles: {
              fontSize: 8
            },
            headStyles: {
              fillColor: [46, 204, 113]
            }
          });
        } else {
          doc.text('No se encontraron herramientas populares', 20, 60);
        }
        
        const nombreArchivo = `Reporte_Herramientas_Populares_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.guardarReporte(nombreArchivo, `Herramientas más prestadas - Top ${data.limite}`);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte de herramientas populares generado exitosamente'
        });
      },
      error: (error) => {
        console.error('Error obteniendo reporte de herramientas populares:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener el reporte de herramientas populares'
        });
      }
    });
  }

  descargarReporte(url: string) {
    // Lógica para descargar reporte
    console.log('Descargando reporte:', url);
  }

  limpiarFiltros() {
    this.filtroTipoReporte = '';
    this.filtroEstado = '';
    this.filtroFechaInicio = null;
    this.filtroFechaFin = null;
    this.filtroRangoFechas = { startDate: null, endDate: null };
    this.limiteHerramientas = 10;
  }

  trackByReporte(index: number, reporte: Reporte): string {
    return reporte.nombre;
  }
}
