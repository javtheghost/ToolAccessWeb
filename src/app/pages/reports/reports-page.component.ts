import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
    CustomDateRangeComponent
  ]
})
export class ReportsPageComponent implements OnInit, OnDestroy {
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

  // Formulario reactivo
  reportForm!: FormGroup;

  // Variables de estado
  loading: boolean = false;
  reportes: any[] = [];
  estadisticas: Estadisticas | null = null;
  formSubmitted: boolean = false;

  // Subject para manejo de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService,
    private oauthService: OAuthService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.cargarReportesGuardados();
    this.cargarEstadisticas();
    this.setupFormListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.reportForm = this.fb.group({
      tipoReporte: ['', [Validators.required]],
      estado: [''],
      rangoFechas: [null],
      limiteHerramientas: [10, [
        Validators.min(1),
        Validators.max(100),
        Validators.pattern(/^\d+$/)
      ]]
    }, {
      validators: [this.validateDateRange.bind(this)]
    });
  }

  private setupFormListeners() {
    // Escuchar cambios en el tipo de reporte para validaciones condicionales
    this.reportForm.get('tipoReporte')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tipo => {
        this.updateValidators(tipo);
      });

    // Escuchar cambios en el límite de herramientas
    this.reportForm.get('limiteHerramientas')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value && (value < 1 || value > 100)) {
          this.reportForm.get('limiteHerramientas')?.setErrors({
            invalidRange: true
          });
        }
      });
  }

  private updateValidators(tipoReporte: string) {
    const limiteControl = this.reportForm.get('limiteHerramientas');
    const estadoControl = this.reportForm.get('estado');
    const rangoFechasControl = this.reportForm.get('rangoFechas');

    // Resetear validadores
    limiteControl?.clearValidators();
    estadoControl?.clearValidators();
    rangoFechasControl?.clearValidators();

    // Aplicar validadores según el tipo de reporte
    switch (tipoReporte) {
      case 'herramientas-populares':
        limiteControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100),
          Validators.pattern(/^\d+$/)
        ]);
        break;
      case 'prestamos':
      case 'multas':
        // Para préstamos y multas, el rango de fechas es opcional pero debe ser válido si se proporciona
        rangoFechasControl?.setValidators([this.validateOptionalDateRange.bind(this)]);
        break;
      default:
        break;
    }

    // Actualizar validadores
    limiteControl?.updateValueAndValidity();
    estadoControl?.updateValueAndValidity();
    rangoFechasControl?.updateValueAndValidity();
  }

  // Validador personalizado para rango de fechas
  private validateDateRange(control: AbstractControl): ValidationErrors | null {
    const rangoFechas = control.get('rangoFechas')?.value;
    const tipoReporte = control.get('tipoReporte')?.value;

    if (!rangoFechas || !tipoReporte) {
      return null;
    }

    // Solo validar rango de fechas para reportes que lo requieren
    if (['prestamos', 'multas'].includes(tipoReporte)) {
      if (rangoFechas.startDate && rangoFechas.endDate) {
        const startDate = new Date(rangoFechas.startDate);
        const endDate = new Date(rangoFechas.endDate);
        const today = new Date();

        // Validar que la fecha de inicio no sea futura
        if (startDate > today) {
          return { futureStartDate: true };
        }

        // Validar que la fecha de fin no sea futura
        if (endDate > today) {
          return { futureEndDate: true };
        }

        // Validar que la fecha de inicio no sea mayor que la fecha de fin
        if (startDate > endDate) {
          return { invalidDateRange: true };
        }

        // Validar que el rango no sea mayor a 1 año
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 365) {
          return { dateRangeTooLarge: true };
        }
      }
    }

    return null;
  }

  // Validador para rango de fechas opcional
  private validateOptionalDateRange(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null; // Es opcional
    }

    if (value.startDate && value.endDate) {
      const startDate = new Date(value.startDate);
      const endDate = new Date(value.endDate);
      const today = new Date();

      if (startDate > endDate) {
        return { invalidDateRange: true };
      }

      if (startDate > today || endDate > today) {
        return { futureDate: true };
      }
    }

    return null;
  }

  // Getters para facilitar el acceso a los controles del formulario
  get f() {
    return this.reportForm.controls;
  }

  get isFormValid(): boolean {
    return this.reportForm.valid && !this.loading;
  }

  get hasFormErrors(): boolean {
    return this.formSubmitted && this.reportForm.invalid;
  }

  // Métodos para obtener mensajes de error
  getErrorMessage(controlName: string): string {
    const control = this.reportForm.get(controlName);
    if (!control || !control.errors || !this.formSubmitted) {
      return '';
    }

    const errors = control.errors;

    switch (controlName) {
      case 'tipoReporte':
        if (errors['required']) {
          return 'El tipo de reporte es obligatorio';
        }
        break;
      case 'limiteHerramientas':
        if (errors['required']) {
          return 'El límite de herramientas es obligatorio';
        }
        if (errors['min']) {
          return 'El límite debe ser al menos 1';
        }
        if (errors['max']) {
          return 'El límite no puede ser mayor a 100';
        }
        if (errors['pattern']) {
          return 'El límite debe ser un número entero';
        }
        if (errors['invalidRange']) {
          return 'El límite debe estar entre 1 y 100';
        }
        break;
      case 'rangoFechas':
        if (errors['futureStartDate']) {
          return 'La fecha de inicio no puede ser futura';
        }
        if (errors['futureEndDate']) {
          return 'La fecha de fin no puede ser futura';
        }
        if (errors['invalidDateRange']) {
          return 'La fecha de inicio no puede ser mayor que la fecha de fin';
        }
        if (errors['dateRangeTooLarge']) {
          return 'El rango de fechas no puede ser mayor a 1 año';
        }
        if (errors['futureDate']) {
          return 'Las fechas no pueden ser futuras';
        }
        break;
    }

    return '';
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.reportForm.errors) {
      if (this.reportForm.errors['futureStartDate']) {
        errors.push('La fecha de inicio no puede ser futura');
      }
      if (this.reportForm.errors['futureEndDate']) {
        errors.push('La fecha de fin no puede ser futura');
      }
      if (this.reportForm.errors['invalidDateRange']) {
        errors.push('La fecha de inicio no puede ser mayor que la fecha de fin');
      }
      if (this.reportForm.errors['dateRangeTooLarge']) {
        errors.push('El rango de fechas no puede ser mayor a 1 año');
      }
    }

    return errors;
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
      tipo: this.reportForm.get('tipoReporte')?.value
    };

    this.reportes.unshift(reporte);
    if (this.reportes.length > 10) {
      this.reportes = this.reportes.slice(0, 10);
    }

    localStorage.setItem('reportes_generados', JSON.stringify(this.reportes));
  }

  async generarReporte() {
    this.formSubmitted = true;

    // Validar formulario
    if (this.reportForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor corrige los errores en el formulario'
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
      const formValue = this.reportForm.value;

      switch (formValue.tipoReporte) {
        case 'estadisticas':
          await this.generarReporteEstadisticas();
          break;
        case 'prestamos':
          await this.generarReportePrestamos(formValue);
          break;
        case 'multas':
          await this.generarReporteMultas(formValue);
          break;
        case 'herramientas-populares':
          await this.generarReporteHerramientasPopulares(formValue);
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

  async generarReportePrestamos(formValue: any) {
    const params = new URLSearchParams();
    if (formValue.estado) params.append('estado', formValue.estado);
    if (formValue.rangoFechas?.startDate) params.append('fecha_inicio', formValue.rangoFechas.startDate.toISOString());
    if (formValue.rangoFechas?.endDate) params.append('fecha_fin', formValue.rangoFechas.endDate.toISOString());

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

  async generarReporteMultas(formValue: any) {
    const params = new URLSearchParams();
    if (formValue.estado) params.append('estado', formValue.estado);
    if (formValue.rangoFechas?.startDate) params.append('fecha_inicio', formValue.rangoFechas.startDate.toISOString());
    if (formValue.rangoFechas?.endDate) params.append('fecha_fin', formValue.rangoFechas.endDate.toISOString());

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

  async generarReporteHerramientasPopulares(formValue: any) {
    const params = new URLSearchParams();
    if (formValue.limiteHerramientas) params.append('limite', formValue.limiteHerramientas.toString());

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
    this.formSubmitted = false;
    this.reportForm.reset({
      tipoReporte: '',
      estado: '',
      rangoFechas: null,
      limiteHerramientas: 10
    });
  }

  trackByReporte(index: number, reporte: any): string {
    return reporte.nombre || index.toString();
  }
}
