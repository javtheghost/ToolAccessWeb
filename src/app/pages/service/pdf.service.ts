import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Estadisticas, Prestamo, Multa, HerramientaPopular } from './reports.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
   * Generar PDF de estadísticas generales
   */
  generarEstadisticasPdf(estadisticas: Estadisticas): void {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Estadísticas Generales', 20, 20);

    doc.setFontSize(12);
    doc.text(`Fecha del reporte: ${new Date(estadisticas.fecha_reporte).toLocaleDateString('es-ES')}`, 20, 35);

    // Herramientas
    doc.setFontSize(16);
    doc.text('Estadísticas de Herramientas', 20, 55);
    doc.setFontSize(12);
    doc.text(`Total de herramientas: ${estadisticas.herramientas.total_herramientas}`, 20, 70);
    doc.text(`Herramientas activas: ${estadisticas.herramientas.herramientas_activas}`, 20, 80);
    doc.text(`Disponibles: ${estadisticas.herramientas.disponibles}`, 20, 90);
    doc.text(`Prestadas: ${estadisticas.herramientas.prestadas}`, 20, 100);
    doc.text(`Dañadas: ${estadisticas.herramientas.danadas}`, 20, 110);

    // Préstamos
    doc.setFontSize(16);
    doc.text('Estadísticas de Préstamos', 20, 135);
    doc.setFontSize(12);
    doc.text(`Total de préstamos: ${estadisticas.prestamos.total_prestamos}`, 20, 150);
    doc.text(`Préstamos activos: ${estadisticas.prestamos.activos}`, 20, 160);
    doc.text(`Préstamos devueltos: ${estadisticas.prestamos.devueltos}`, 20, 170);
    doc.text(`Préstamos vencidos: ${estadisticas.prestamos.vencidos}`, 20, 180);

    // Multas
    doc.setFontSize(16);
    doc.text('Estadísticas de Multas', 20, 205);
    doc.setFontSize(12);
    doc.text(`Total de multas: ${estadisticas.multas.total_multas}`, 20, 220);
    doc.text(`Multas pendientes: ${estadisticas.multas.pendientes}`, 20, 230);
    doc.text(`Multas pagadas: ${estadisticas.multas.pagadas}`, 20, 240);
    doc.text(`Monto pendiente: $${estadisticas.multas.monto_pendiente}`, 20, 250);
    doc.text(`Monto cobrado: $${estadisticas.multas.monto_cobrado}`, 20, 260);

    this.descargarPdf(doc, 'estadisticas_generales.pdf');
  }

  /**
   * Generar PDF de reporte de préstamos
   */
  generarPrestamosPdf(prestamos: Prestamo[], filtros: any): void {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Préstamos', 20, 20);

    doc.setFontSize(12);
    doc.text(`Total de registros: ${prestamos.length}`, 20, 35);

    if (filtros.fecha_inicio || filtros.fecha_fin) {
      doc.text(`Período: ${filtros.fecha_inicio || 'Sin fecha'} - ${filtros.fecha_fin || 'Sin fecha'}`, 20, 45);
    }

    if (filtros.estado) {
      doc.text(`Estado filtrado: ${filtros.estado}`, 20, 55);
    }

    // Tabla de préstamos
    const tableData = prestamos.map(p => [
      p.herramienta_nombre,
      p.username,
      `${p.categoria_nombre} / ${p.subcategoria_nombre}`,
      new Date(p.fecha_prestamo).toLocaleDateString('es-ES'),
      new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-ES'),
      p.estado
    ]);

    autoTable(doc, {
      head: [['Herramienta', 'Usuario', 'Categoría', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    });

    this.descargarPdf(doc, 'reporte_prestamos.pdf');
  }

  /**
   * Generar PDF de herramientas populares
   */
  generarHerramientasPopularesPdf(herramientas: HerramientaPopular[]): void {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Herramientas Más Prestadas', 20, 20);

    doc.setFontSize(12);
    doc.text(`Top ${herramientas.length} herramientas más populares`, 20, 35);

    // Tabla de herramientas populares
    const tableData = herramientas.map(h => [
      h.nombre,
      h.categoria,
      h.subcategoria,
      h.total_prestamos.toString(),
      h.prestamos_activos.toString()
    ]);

    autoTable(doc, {
      head: [['Herramienta', 'Categoría', 'Subcategoría', 'Total Préstamos', 'Préstamos Activos']],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    });

    this.descargarPdf(doc, 'herramientas_populares.pdf');
  }

  /**
   * Generar PDF de reporte de multas
   */
  generarMultasPdf(multas: Multa[], filtros: any): void {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Multas', 20, 20);

    doc.setFontSize(12);
    doc.text(`Total de multas: ${multas.length}`, 20, 35);

    if (filtros.fecha_inicio || filtros.fecha_fin) {
      doc.text(`Período: ${filtros.fecha_inicio || 'Sin fecha'} - ${filtros.fecha_fin || 'Sin fecha'}`, 20, 45);
    }

    if (filtros.estado) {
      doc.text(`Estado filtrado: ${filtros.estado}`, 20, 55);
    }

    // Calcular totales
    const montoTotal = multas.reduce((sum, m) => sum + m.monto, 0);
    const montoPendiente = multas.filter(m => m.estado === 'pendiente').reduce((sum, m) => sum + m.monto, 0);
    const montoPagado = multas.filter(m => m.estado === 'pagada').reduce((sum, m) => sum + m.monto, 0);

    doc.text(`Monto total: $${montoTotal}`, 20, 65);
    doc.text(`Monto pendiente: $${montoPendiente}`, 20, 75);
    doc.text(`Monto pagado: $${montoPagado}`, 20, 85);

    // Tabla de multas
    const tableData = multas.map(m => [
      m.username,
      m.herramienta_nombre,
      `$${m.monto}`,
      m.estado,
      new Date(m.fecha_multa).toLocaleDateString('es-ES')
    ]);

    autoTable(doc, {
      head: [['Usuario', 'Herramienta', 'Monto', 'Estado', 'Fecha Multa']],
      body: tableData,
      startY: 100,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    });

    this.descargarPdf(doc, 'reporte_multas.pdf');
  }

  /**
   * Descargar el PDF generado
   */
  private descargarPdf(doc: jsPDF, nombreArchivo: string): void {
    doc.save(nombreArchivo);
  }
}
