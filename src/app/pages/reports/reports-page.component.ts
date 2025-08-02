import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CustomDateRangeComponent } from '../utils/custom-date-range.component';

interface Reporte {
  nombre: string;
  fecha: string;
  descripcion: string;
  descargarUrl: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, CustomDateRangeComponent],
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsPageComponent {
  tiposReporte = [
    { label: 'Seleccionar...', value: '' },
    { label: 'Préstamos', value: 'prestamos' },
    { label: 'Multas', value: 'multas' },
    { label: 'Daños', value: 'danos' }
  ];
  estados = [
    { label: 'Todos', value: '' },
    { label: 'Pendientes', value: 'pendientes' },
    { label: 'Pagados', value: 'pagados' },
    { label: 'No reparados', value: 'no_reparados' }
  ];
  categorias = [
    { label: 'Todas', value: '' },
    { label: 'Herramientas eléctricas', value: 'electricas' },
    { label: 'Manuales', value: 'manuales' }
  ];
  usuarios = [
    { label: 'Todos', value: '' },
    { label: 'Juan Pérez', value: 'juan' },
    { label: 'Ana López', value: 'ana' }
  ];

  filtroTipoReporte: string = '';
  filtroEstado: string = '';
  filtroCategoria: string = '';
  filtroUsuario: string = '';
  filtroFechaInicio: Date | null = null;
  filtroFechaFin: Date | null = null;
  filtroRangoFechas: { startDate: Date | null; endDate: Date | null } = { startDate: null, endDate: null };

  reportes: Reporte[] = [
    {
      nombre: 'Reporte_Préstamos_2023-10-28.pdf',
      fecha: '26 Oct 2023, 10:30 AM',
      descripcion: 'Préstamos, Últimos 30 días, Pendientes',
      descargarUrl: '#'
    },
    {
      nombre: 'Reporte_Multas_Pendientes.pdf',
      fecha: '25 Oct 2023, 02:15 PM',
      descripcion: 'Multas, Pendientes de pago',
      descargarUrl: '#'
    },
    {
      nombre: 'Reporte_Daños_Herramientas.pdf',
      fecha: '24 Oct 2023, 09:00 AM',
      descripcion: 'Daños, Reportados no reparados',
      descargarUrl: '#'
    }
  ];

  generarReporte() {
    // Lógica para generar reporte
    console.log('Generando reporte con filtros:', {
      tipoReporte: this.filtroTipoReporte,
      estado: this.filtroEstado,
      categoria: this.filtroCategoria,
      usuario: this.filtroUsuario,
      fechaInicio: this.filtroFechaInicio,
      fechaFin: this.filtroFechaFin,
      rangoFechas: this.filtroRangoFechas
    });
  }

  descargarReporte(url: string) {
    // Lógica para descargar reporte
  }
}
