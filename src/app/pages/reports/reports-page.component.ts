import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SelectModule } from 'primeng/select';
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
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    SelectModule,
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
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Aprobado', value: 'aprobado' },
    { label: 'Rechazado', value: 'rechazado' },
    { label: 'Terminado', value: 'terminado' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Pagado', value: 'pagado' },
    { label: 'Exonerada', value: 'exonerada' }
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

  // Propiedades para el diálogo de confirmación personalizado
  showCustomConfirm: boolean = false;
  confirmMessage: string = '';
  confirmAction: (() => void) | null = null;
  confirmIcon: string = 'delete';

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

    // Set initial disabled state based on loading
    this.updateFormControlsState();
  }

  private updateFormControlsState() {
    const controls = ['estado', 'rangoFechas', 'limiteHerramientas'];
    controls.forEach(controlName => {
      const control = this.reportForm.get(controlName);
      if (control) {
        if (this.loading) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    this.updateFormControlsState();
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

     // Actualizar opciones de estado según el tipo de reporte
     this.updateEstadoOptions(tipoReporte);

           // Aplicar validadores según el tipo de reporte
      switch (tipoReporte) {
        case 'herramientas-populares':
          limiteControl?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(100),
            Validators.pattern(/^\d+$/)
          ]);
          // Para herramientas populares, el rango de fechas es opcional pero si se proporciona debe ser válido
          rangoFechasControl?.setValidators([
            this.validateOptionalDateRange.bind(this)
          ]);
          break;
        case 'prestamos':
          // Para préstamos, el rango de fechas es obligatorio
          rangoFechasControl?.setValidators([
            Validators.required,
            this.validateRequiredDateRange.bind(this)
          ]);

          // Asignar fechas por defecto si no hay fechas seleccionadas
          if (!rangoFechasControl?.value) {
            const today = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            rangoFechasControl?.setValue({
              startDate: lastMonth,
              endDate: today
            });
          }
          break;
        case 'multas':
          // Para multas, el rango de fechas es obligatorio
          rangoFechasControl?.setValidators([
            Validators.required,
            this.validateRequiredDateRange.bind(this)
          ]);

          // Asignar fechas por defecto si no hay fechas seleccionadas
          if (!rangoFechasControl?.value) {
            const today = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            rangoFechasControl?.setValue({
              startDate: lastMonth,
              endDate: today
            });
          }
          break;
        default:
          break;
      }

           // Actualizar validadores
      limiteControl?.updateValueAndValidity();
      estadoControl?.updateValueAndValidity();
      rangoFechasControl?.updateValueAndValidity();

      // Forzar la actualización del estado del formulario
      this.reportForm.updateValueAndValidity();
   }

   // Función para actualizar las opciones de estado según el tipo de reporte
   private updateEstadoOptions(tipoReporte: string) {
     const todosOption = { label: 'Todos', value: '' };

     switch (tipoReporte) {
       case 'prestamos':
         this.estados = [
           todosOption,
           { label: 'Pendiente', value: 'pendiente' },
           { label: 'Aprobado', value: 'aprobado' },
           { label: 'Rechazado', value: 'rechazado' },
           { label: 'Terminado', value: 'terminado' },
           { label: 'Vencido', value: 'vencido' }
         ];
         break;
       case 'multas':
         this.estados = [
           todosOption,
           { label: 'Pendiente', value: 'pendiente' },
           { label: 'Pagado', value: 'pagado' },
           { label: 'Exonerada', value: 'exonerada' }
         ];
         break;
       case 'herramientas-populares':
         // Para herramientas populares, usar estados de órdenes de préstamo
         this.estados = [
           todosOption,
           { label: 'Pendiente', value: 'pendiente' },
           { label: 'Aprobado', value: 'aprobado' },
           { label: 'Rechazado', value: 'rechazado' },
           { label: 'Terminado', value: 'terminado' },
           { label: 'Vencido', value: 'vencido' }
         ];
         break;
       default:
         // Estados por defecto (todos)
         this.estados = [
           todosOption,
           { label: 'Pendiente', value: 'pendiente' },
           { label: 'Aprobado', value: 'aprobado' },
           { label: 'Rechazado', value: 'rechazado' },
           { label: 'Terminado', value: 'terminado' },
           { label: 'Vencido', value: 'vencido' },
           { label: 'Pagado', value: 'pagado' },
           { label: 'Exonerada', value: 'exonerada' }
         ];
         break;
     }
   }

     // Validador personalizado para rango de fechas
   private validateDateRange(control: AbstractControl): ValidationErrors | null {
     const rangoFechas = control.get('rangoFechas')?.value;
     const tipoReporte = control.get('tipoReporte')?.value;

     if (!tipoReporte) {
       return null;
     }

     // Solo validar rango de fechas para reportes que lo requieren
     if (['prestamos', 'multas'].includes(tipoReporte)) {
       // Para estos reportes, el rango de fechas es obligatorio
       if (!rangoFechas || !rangoFechas.startDate || !rangoFechas.endDate) {
         return { required: true };
       }

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

     return null;
   }

     // Validador para rango de fechas obligatorio
   private validateRequiredDateRange(control: AbstractControl): ValidationErrors | null {
     const value = control.value;

     if (!value) {
       return { required: true };
     }

     if (!value.startDate || !value.endDate) {
       return { required: true };
     }

     const startDate = new Date(value.startDate);
     const endDate = new Date(value.endDate);
     const today = new Date();

     if (startDate > endDate) {
       return { invalidDateRange: true };
     }

     if (startDate > today || endDate > today) {
       return { futureDate: true };
     }

     // Validar que el rango no sea mayor a 1 año
     const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
     if (diffDays > 365) {
       return { dateRangeTooLarge: true };
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
     if (!this.reportForm.valid || this.loading) {
       return false;
     }

     const tipoReporte = this.reportForm.get('tipoReporte')?.value;
     const rangoFechas = this.reportForm.get('rangoFechas')?.value;

     // Para reportes de préstamos y multas, las fechas son obligatorias
     if (['prestamos', 'multas'].includes(tipoReporte)) {
       if (!rangoFechas || !rangoFechas.startDate || !rangoFechas.endDate) {
         return false;
       }
     }

     // Para herramientas populares, las fechas son opcionales
     // Si se proporcionan fechas, deben ser válidas (esto se valida en validateOptionalDateRange)

     return true;
   }

     get hasFormErrors(): boolean {
     return this.formSubmitted && this.reportForm.invalid;
   }

   get showDateRangeErrors(): boolean {
     const tipoReporte = this.reportForm.get('tipoReporte')?.value;
     const rangoFechas = this.reportForm.get('rangoFechas')?.value;

     if (['prestamos', 'multas'].includes(tipoReporte)) {
       return !rangoFechas || !rangoFechas.startDate || !rangoFechas.endDate;
     }

     return false;
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
         if (errors['required']) {
           return 'El rango de fechas es obligatorio';
         }
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
       if (this.reportForm.errors['required']) {
         errors.push('El rango de fechas es obligatorio');
       }
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
      const stats = await firstValueFrom(this.reportsService.getEstadisticas());
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

  borrarReporte(index: number) {
    // Sin diálogo de confirmación para borrado individual
    this.reportes.splice(index, 1);
    localStorage.setItem('reportes_generados', JSON.stringify(this.reportes));

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reporte eliminado correctamente'
    });
  }

  borrarTodosLosReportes() {
    // Configurar el diálogo de confirmación personalizado
    this.confirmMessage = '¿Estás seguro de que quieres eliminar todos los reportes? Esta acción no se puede deshacer.';
    this.confirmIcon = 'delete';
    this.confirmAction = () => {
      this.reportes = [];
      localStorage.removeItem('reportes_generados');

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Todos los reportes han sido eliminados'
      });
    };
    this.showCustomConfirm = true;
  }

  // Métodos para el diálogo de confirmación personalizado
  onCustomConfirmAccept() {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.showCustomConfirm = false;
  }

  onCustomConfirmReject() {
    this.showCustomConfirm = false;
  }

     async generarReporte() {
     this.formSubmitted = true;

     // Validar formulario
     if (this.reportForm.invalid || !this.isFormValid) {
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

    this.setLoading(true);

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
      this.setLoading(false);
    }
  }

  async generarReporteEstadisticas() {
    this.reportsService.getEstadisticas().subscribe({
      next: (data: Estadisticas) => {
        const doc = new jsPDF();

        // Agregar logo
        try {
          const logo = new Image();
          logo.src = 'assets/logos/logopdf.png';
          doc.addImage(logo, 'PNG', 20, 18, 30, 34);
        } catch (error) {
          console.log('No se pudo cargar el logo');
        }

                 // Título del reporte - Posicionado a la derecha del logo
         doc.setFontSize(18);
         doc.setTextColor(3, 52, 110); // Color primario #03346E
         doc.text('Reporte de Estadísticas Generales', 65, 25);

         // Información del reporte - Posicionada debajo del título
         doc.setFontSize(12);
         doc.setTextColor(0, 0, 0); // Color negro para texto normal
         doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 65, 40);
         doc.text(`Generado por: ${this.getNombreCompletoUsuario()}`, 65, 50);

         // Estadísticas de Herramientas
         doc.setFontSize(14);
         doc.setTextColor(3, 52, 110); // Color primario
         doc.text('Estadísticas de Herramientas:', 20, 70);

         let currentY = 80;

         if (data.herramientas) {
           const herramientasData = [
             ['Métrica', 'Cantidad'],
             ['Total de herramientas', data.herramientas.total_herramientas || 0],
             ['Herramientas disponibles', data.herramientas.disponibles || 0],
             ['Herramientas prestadas', data.herramientas.prestadas || 0],
             ['Herramientas dañadas', data.herramientas.danadas || 0]
           ];

           autoTable(doc, {
             head: [['Métrica', 'Cantidad']],
             body: herramientasData.slice(1), // Excluir el header que ya está en head
             startY: currentY,
             styles: { fontSize: 10 },
             headStyles: {
               fillColor: [3, 52, 110], // Color primario
               textColor: [255, 255, 255] // Texto blanco
             },
             alternateRowStyles: {
               fillColor: [248, 250, 252] // Color gris claro para filas alternas
             }
           });

           // Calcular la posición Y después de la tabla
           currentY = currentY + (herramientasData.length * 8) + 25;
         }

         // Estadísticas de Préstamos
         doc.setFontSize(14);
         doc.setTextColor(3, 52, 110); // Color primario
         doc.text('Estadísticas de Préstamos:', 20, currentY);

         if (data.prestamos) {
           const prestamosData = [
             ['Métrica', 'Cantidad'],
             ['Total de préstamos', data.prestamos.total_prestamos || 0],
             ['Préstamos activos', data.prestamos.activos || 0],
             ['Préstamos devueltos', data.prestamos.devueltos || 0],
             ['Préstamos vencidos', data.prestamos.vencidos || 0]
           ];

           autoTable(doc, {
             head: [['Métrica', 'Cantidad']],
             body: prestamosData.slice(1),
             startY: currentY + 10,
             styles: { fontSize: 10 },
             headStyles: {
               fillColor: [3, 52, 110], // Color primario
               textColor: [255, 255, 255] // Texto blanco
             },
             alternateRowStyles: {
               fillColor: [248, 250, 252] // Color gris claro para filas alternas
             }
           });

           currentY = currentY + (prestamosData.length * 8) + 35;
         }

         // Estadísticas de Multas
         doc.setFontSize(14);
         doc.setTextColor(3, 52, 110); // Color primario
         doc.text('Estadísticas de Multas:', 20, currentY);

         if (data.multas) {
           const multasData = [
             ['Métrica', 'Cantidad', 'Monto'],
             ['Total de multas', data.multas.total_multas || 0, `$${data.multas.monto_pendiente + data.multas.monto_cobrado || 0}`],
             ['Multas pagadas', data.multas.pagadas || 0, `$${data.multas.monto_cobrado || 0}`],
             ['Multas pendientes', data.multas.pendientes || 0, `$${data.multas.monto_pendiente || 0}`]
           ];

           autoTable(doc, {
             head: [['Métrica', 'Cantidad', 'Monto']],
             body: multasData.slice(1),
             startY: currentY + 10,
             styles: { fontSize: 10 },
             headStyles: {
               fillColor: [3, 52, 110], // Color primario
               textColor: [255, 255, 255] // Texto blanco
             },
             alternateRowStyles: {
               fillColor: [248, 250, 252] // Color gris claro para filas alternas
             }
           });

           currentY = currentY + (multasData.length * 8) + 35;
         }

         // Estadísticas de Usuarios
         doc.setFontSize(14);
         doc.setTextColor(3, 52, 110); // Color primario
         doc.text('Estadísticas de Usuarios:', 20, currentY);

         if (data.usuarios) {
           const usuariosData = [
             ['Métrica', 'Cantidad'],
             ['Total de usuarios', data.usuarios.total_usuarios || 0],
             ['Usuarios activos', data.usuarios.activos || 0]
           ];

           autoTable(doc, {
             head: [['Métrica', 'Cantidad']],
             body: usuariosData.slice(1),
             startY: currentY + 10,
             styles: { fontSize: 10 },
             headStyles: {
               fillColor: [3, 52, 110], // Color primario
               textColor: [255, 255, 255] // Texto blanco
             },
             alternateRowStyles: {
               fillColor: [248, 250, 252] // Color gris claro para filas alternas
             }
           });

           currentY = currentY + (usuariosData.length * 8) + 35;
         }

         // Resumen ejecutivo
         currentY = currentY + 20;
         doc.setFontSize(12);
         doc.setTextColor(3, 52, 110); // Color primario
         doc.text('Resumen Ejecutivo:', 20, currentY);

         doc.setFontSize(10);
         doc.setTextColor(0, 0, 0); // Color negro
         doc.text(`• El sistema cuenta con ${data.herramientas?.total_herramientas || 0} herramientas en total`, 20, currentY + 10);
         doc.text(`• Se han realizado ${data.prestamos?.total_prestamos || 0} préstamos en total`, 20, currentY + 20);
         doc.text(`• Se han generado ${data.multas?.total_multas || 0} multas por un total de $${(data.multas?.monto_pendiente || 0) + (data.multas?.monto_cobrado || 0)}`, 20, currentY + 30);
         doc.text(`• El sistema tiene ${data.usuarios?.total_usuarios || 0} usuarios registrados`, 20, currentY + 40);

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
    if (formValue.estado && formValue.estado !== '') params.append('estado', formValue.estado);
    if (formValue.rangoFechas?.startDate) params.append('fecha_inicio', formValue.rangoFechas.startDate.toISOString());
    if (formValue.rangoFechas?.endDate) params.append('fecha_fin', formValue.rangoFechas.endDate.toISOString());

    this.reportsService.getReportePrestamos(params.toString()).subscribe({
      next: (data: Prestamo[]) => {
        const doc = new jsPDF();

        // Agregar logo
        try {
          const logo = new Image();
          logo.src = 'assets/logos/logopdf.png';
          doc.addImage(logo, 'PNG', 20, 18, 30, 34);
        } catch (error) {
          console.log('No se pudo cargar el logo');
        }

        // Título del reporte - Posicionado a la derecha del logo
        doc.setFontSize(18);
        doc.setTextColor(3, 52, 110); // Color primario #03346E
        doc.text('Reporte de Préstamos', 65, 25);

        // Información del reporte - Posicionada debajo del título
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 65, 40);
        doc.text(`Generado por: ${this.getNombreCompletoUsuario()}`, 65, 50);

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
            startY: 90,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [3, 52, 110] }
          });
        } else {
          doc.setFontSize(12);
          doc.text('No se encontraron préstamos con los filtros aplicados', 20, 90);
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
    if (formValue.estado && formValue.estado !== '') params.append('estado', formValue.estado);
    if (formValue.rangoFechas?.startDate) params.append('fecha_inicio', formValue.rangoFechas.startDate.toISOString());
    if (formValue.rangoFechas?.endDate) params.append('fecha_fin', formValue.rangoFechas.endDate.toISOString());

    this.reportsService.getReporteMultas(params.toString()).subscribe({
      next: (data: Multa[]) => {
        const doc = new jsPDF();

        // Agregar logo
        try {
          const logo = new Image();
          logo.src = 'assets/logos/logopdf.png';
          doc.addImage(logo, 'PNG', 20, 18, 30, 34);
        } catch (error) {
          console.log('No se pudo cargar el logo');
        }

        // Título del reporte - Posicionado a la derecha del logo
        doc.setFontSize(18);
        doc.setTextColor(3, 52, 110); // Color primario #03346E
        doc.text('Reporte de Multas', 65, 25);

        // Información del reporte - Posicionada debajo del título
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 65, 40);
        doc.text(`Generado por: ${this.getNombreCompletoUsuario()}`, 65, 50);

        if (data.length > 0) {
          // Tabla de multas
          const tableData = data.map((multa: any) => [
            multa.id || '',
            multa.usuario_nombre || '',
            multa.monto ? `$${multa.monto}` : '',
            multa.motivo || 'N/A', // Mostrar "N/A" cuando no hay motivo
            multa.fecha_creacion ? new Date(multa.fecha_creacion).toLocaleDateString() : '',
            multa.estado || ''
          ]);

          autoTable(doc, {
            head: [['ID', 'Usuario', 'Monto', 'Motivo', 'Fecha', 'Estado']],
            body: tableData,
            startY: 90,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [3, 52, 110] }
          });
        } else {
          doc.setFontSize(12);
          doc.text('No se encontraron multas con los filtros aplicados', 20, 90);
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
    try {
      this.setLoading(true);
      const limite = formValue.limiteHerramientas || 10;

      // Obtener herramientas populares
      const data = await firstValueFrom(this.reportsService.getHerramientasPopulares(`?limite=${limite}`));

      if (data && data.length > 0) {
        // Debug: Verificar qué datos llegan del backend
        console.log('Datos de herramientas populares:', data);
        console.log('Primera herramienta:', data[0]);
        console.log('foto_url de la primera herramienta:', data[0]?.foto_url);
        console.log('Tipo de foto_url:', typeof data[0]?.foto_url);
        console.log('Longitud de foto_url:', data[0]?.foto_url?.length);
        
        // Verificar todas las foto_url
        console.log('Todas las foto_url:');
        data.forEach((herramienta, idx) => {
          console.log(`${idx + 1}. ${herramienta.nombre}: "${herramienta.foto_url}" (tipo: ${typeof herramienta.foto_url})`);
          console.log(`   - ID: ${herramienta.id}`);
          console.log(`   - Folio: ${herramienta.folio}`);
          console.log(`   - Categoría: ${herramienta.categoria} - ${herramienta.subcategoria}`);
        });

        // Probar URLs de imágenes
        this.testImageUrls(data);

        // Crear tabla de herramientas con imágenes en columna
        const tableData = [];
        const imagenesBase64: (string | null)[] = [];

        // Cargar todas las imágenes primero y esperar a que se completen
        console.log('Iniciando carga de imágenes...');
        for (let i = 0; i < data.length; i++) {
          const herramienta = data[i];
          let imagenBase64: string | null = null;

          console.log(`\n--- Procesando herramienta ${i + 1}/${data.length} ---`);
          console.log(`Nombre: ${herramienta.nombre}`);
          console.log(`foto_url original: ${herramienta.foto_url}`);
          console.log(`foto_url tipo: ${typeof herramienta.foto_url}`);

          if (herramienta.foto_url && herramienta.foto_url.trim() !== '') {
            const imagenUrl = this.getImagenUrl(herramienta.foto_url);
            console.log(`URL construida: ${imagenUrl}`);
            
            if (imagenUrl && imagenUrl.trim() !== '') {
              try {
                imagenBase64 = await this.cargarImagenComoBase64(imagenUrl);
                console.log(`Resultado carga: ${imagenBase64 ? 'EXITOSO' : 'FALLIDO'}`);
                if (imagenBase64) {
                  console.log(`Tamaño base64: ${imagenBase64.length} caracteres`);
                }
              } catch (error) {
                console.warn(`Error al cargar imagen para ${herramienta.nombre}:`, error);
              }
            } else {
              console.warn(`URL construida está vacía para ${herramienta.nombre}`);
            }
          } else {
            console.log(`Herramienta ${i + 1} (${herramienta.nombre}) no tiene foto_url válida`);
          }

          imagenesBase64.push(imagenBase64);
        }

        console.log('Array de imágenes base64:', imagenesBase64.map((img, idx) => `${idx}: ${img ? 'OK' : 'NULL'}`));

        // Resumen final de carga de imágenes
        console.log('\n=== RESUMEN DE CARGA DE IMÁGENES ===');
        const imagenesExitosas = imagenesBase64.filter(img => img !== null && img.trim() !== '').length;
        const imagenesFallidas = imagenesBase64.filter(img => img === null || img.trim() === '').length;
        console.log(`Total de herramientas: ${data.length}`);
        console.log(`Imágenes cargadas exitosamente: ${imagenesExitosas}`);
        console.log(`Imágenes fallidas: ${imagenesFallidas}`);
        console.log(`Porcentaje de éxito: ${((imagenesExitosas / data.length) * 100).toFixed(1)}%`);
        
        if (imagenesFallidas > 0) {
          console.warn('Herramientas sin imágenes:');
          data.forEach((herramienta, idx) => {
            const imagen = imagenesBase64[idx];
            if (imagen === null || imagen.trim() === '') {
              console.warn(`- ${herramienta.nombre} (ID: ${herramienta.id}):`);
              console.warn(`  * foto_url original: ${herramienta.foto_url}`);
              console.warn(`  * URL construida: ${this.getImagenUrl(herramienta.foto_url)}`);
              console.warn(`  * Estado: ${imagen === null ? 'NULL' : 'VACÍA'}`);
            }
          });
        }
        
        console.log('\nDetalle de todas las herramientas:');
        data.forEach((herramienta, idx) => {
          const imagen = imagenesBase64[idx];
          const estado = imagen && imagen.trim() !== '' ? '✅' : '❌';
          console.log(`${estado} ${idx + 1}. ${herramienta.nombre}: ${imagen ? 'Imagen OK' : 'Sin imagen'}`);
        });
        console.log('=====================================\n');

        // Crear filas de datos
        for (let i = 0; i < data.length; i++) {
          const herramienta = data[i];
          const row = [
            i + 1, // Número
            '', // Celda vacía para la imagen (sin texto de fondo)
            herramienta.nombre,
            herramienta.folio,
            `${herramienta.categoria} - ${herramienta.subcategoria}`,
            herramienta.veces_prestada,
            herramienta.stock
          ];
          tableData.push(row);
        }

        // Crear el documento PDF
        const doc = new jsPDF();

        // Agregar logo
        try {
          const logo = new Image();
          logo.src = 'assets/logos/logopdf.png';
          doc.addImage(logo, 'PNG', 20, 18, 30, 34);
        } catch (error) {
          console.log('No se pudo cargar el logo');
        }

        // Título del reporte - Posicionado a la derecha del logo
        doc.setFontSize(18);
        doc.setTextColor(3, 52, 110); // Color primario #03346E
        doc.text('Reporte de Herramientas Más Prestadas', 65, 25);

        // Información del reporte - Posicionada debajo del título
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 65, 40);
        doc.text(`Generado por: ${this.getNombreCompletoUsuario()}`, 65, 50);

        // Agregar información de filtros aplicados
        let filtrosInfo = '';
        if (formValue.rangoFechas && formValue.rangoFechas.startDate && formValue.rangoFechas.endDate) {
          const startDate = new Date(formValue.rangoFechas.startDate).toLocaleDateString();
          const endDate = new Date(formValue.rangoFechas.endDate).toLocaleDateString();
          filtrosInfo += `Período: ${startDate} - ${endDate}`;
        }
        if (formValue.estado && formValue.estado !== '') {
          filtrosInfo += filtrosInfo ? ` | Estado: ${formValue.estado}` : `Estado: ${formValue.estado}`;
        }
        if (filtrosInfo) {
          doc.text(`Filtros aplicados: ${filtrosInfo}`, 65, 60);
        }

        // Crear la tabla con columna de imagen
        autoTable(doc, {
          head: [['#', 'Imagen', 'Herramienta', 'Folio', 'Categoría', 'Veces Prestada', 'Stock']],
          body: tableData,
          startY: filtrosInfo ? 80 : 70,
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: [3, 52, 110], // Color primario
            textColor: [255, 255, 255] // Texto blanco
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252] // Color gris claro para filas alternas
          },
          columnStyles: {
            0: { cellWidth: 10 }, // Número
            1: { cellWidth: 20 }, // Imagen
            2: { cellWidth: 45 }, // Nombre
            3: { cellWidth: 25 }, // Folio
            4: { cellWidth: 40 }, // Categoría
            5: { cellWidth: 20 }, // Veces prestada
            6: { cellWidth: 15 }  // Stock
          },
          didDrawCell: (cellData) => {
            // Agregar imágenes en la columna de imagen
            // Solo procesar filas de datos (no el encabezado) y asegurar que hay imagen disponible
            if (cellData.column.index === 1 && cellData.row.index > 0) {
              const rowIndex = cellData.row.index - 1; // Ajustar índice porque las filas de datos empiezan en 1
              
              // Verificar que el índice esté dentro del rango válido
              if (rowIndex >= 0 && rowIndex < imagenesBase64.length) {
                const imagenBase64 = imagenesBase64[rowIndex];
                const herramienta = data[rowIndex];

                // Debug: Verificar el mapeo de índices
                console.log(`Procesando celda - Fila tabla: ${cellData.row.index}, Índice array: ${rowIndex}, Herramienta: ${herramienta?.nombre}, Imagen: ${imagenBase64 ? 'OK' : 'NULL'}`);

                if (imagenBase64 && herramienta && imagenBase64.trim() !== '') {
                  try {
                    // Calcular posición para centrar la imagen en la celda
                    const cellWidth = cellData.cell.width;
                    const cellHeight = cellData.cell.height;

                    // Reducir el tamaño de la imagen para que quepa bien en la celda
                    const maxWidth = Math.min(cellWidth - 2, 16); // 2px de margen, aumentado de 12 a 16
                    const maxHeight = Math.min(cellHeight - 2, 16); // 2px de margen, aumentado de 12 a 16

                    // Mantener proporción de aspecto
                    const aspectRatio = 1; // Asumimos imágenes cuadradas
                    let width = maxWidth;
                    let height = maxHeight;

                    if (width / aspectRatio > height) {
                      width = height * aspectRatio;
                    } else {
                      height = width / aspectRatio;
                    }

                    // Centrar la imagen en la celda
                    const x = cellData.cell.x + (cellWidth - width) / 2;
                    const y = cellData.cell.y + (cellHeight - height) / 2;

                    console.log(`Agregando imagen para ${herramienta.nombre} en posición (${x}, ${y}) con tamaño (${width}, ${height})`);
                    doc.addImage(imagenBase64, 'JPEG', x, y, width, height);
                  } catch (error) {
                    console.warn(`Error al agregar imagen en celda para fila ${rowIndex} (${herramienta?.nombre}):`, error);
                  }
                } else {
                  console.log(`No se pudo agregar imagen para fila ${rowIndex}: imagen=${imagenBase64 ? 'OK' : 'NULL'}, herramienta=${herramienta ? 'OK' : 'NULL'}`);
                  if (imagenBase64 && imagenBase64.trim() === '') {
                    console.warn(`Imagen base64 está vacía para ${herramienta?.nombre}`);
                  }
                }
              } else {
                console.warn(`Índice fuera de rango: rowIndex=${rowIndex}, imagenesBase64.length=${imagenesBase64.length}`);
              }
            }
          }
        });

        // Guardar el PDF
        const nombreArchivo = `herramientas_populares_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);

        this.guardarReporte(nombreArchivo, `Reporte de herramientas populares - ${data.length} registros`);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Reporte de herramientas populares generado con ${data.length} registros`
        });
      } else {
        // Crear PDF vacío si no hay datos
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text('No se encontraron herramientas populares', 20, 70);
        
        const nombreArchivo = `herramientas_populares_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        this.messageService.add({
          severity: 'info',
          summary: 'Información',
          detail: 'No se encontraron herramientas populares para generar el reporte'
        });
      }
    } catch (error: any) {
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
    } finally {
      this.setLoading(false);
    }
  }

     limpiarFiltros() {
     this.formSubmitted = false;
     const currentTipoReporte = this.reportForm.get('tipoReporte')?.value;

     this.reportForm.reset({
       tipoReporte: '',
       estado: '',
       rangoFechas: null,
       limiteHerramientas: 10
     });

     // Si había un tipo de reporte seleccionado, restaurarlo y aplicar fechas por defecto
     if (currentTipoReporte && ['prestamos', 'multas'].includes(currentTipoReporte)) {
       this.reportForm.patchValue({
         tipoReporte: currentTipoReporte
       });
       this.updateValidators(currentTipoReporte);
     }
   }

  trackByReporte(index: number, reporte: any): string {
    return reporte.nombre || index.toString();
  }

  // Función helper para obtener el nombre completo del usuario
  private getNombreCompletoUsuario(): string {
    const currentUser = this.oauthService.getCurrentUser() as any;
    let nombreCompleto = 'Usuario';

    if (currentUser) {
      const nombre = currentUser.nombre || '';
      const apellidoPaterno = currentUser.apellido_paterno || '';
      const apellidoMaterno = currentUser.apellido_materno || '';

      if (nombre || apellidoPaterno || apellidoMaterno) {
        nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      } else if (currentUser.email) {
        nombreCompleto = currentUser.email;
      }
    }

    return nombreCompleto;
  }

  // Función helper para obtener la URL completa de la imagen
  private getImagenUrl(imagen: string | null | undefined): string {
    if (!imagen) {
      return '';
    }

    // Si ya es una URL completa, retornarla
    if (imagen.startsWith('http')) {
      return imagen;
    }

    // Si es solo el nombre del archivo, construir la URL completa
    const baseUrl = environment.apiServiceGeneralUrl;
    return `${baseUrl}/uploads/${imagen}`;
  }

  // Función helper para cargar imagen como base64
  private async cargarImagenComoBase64(url: string): Promise<string | null> {
    try {
      console.log(`Intentando cargar imagen desde: ${url}`);
      
      // Validar que la URL no esté vacía
      if (!url || url.trim() === '') {
        console.warn('URL de imagen vacía o inválida');
        return null;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        console.warn(`No se pudo cargar la imagen: ${url} - Status: ${response.status} ${response.statusText}`);
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.warn(`URL no es una imagen válida: ${url} - Content-Type: ${contentType}`);
        return null;
      }

      const blob = await response.blob();
      
      // Validar que el blob tenga contenido
      if (blob.size === 0) {
        console.warn(`Imagen vacía: ${url} - Tamaño: 0 bytes`);
        return null;
      }
      
      console.log(`Imagen cargada correctamente: ${url} - Tamaño: ${blob.size} bytes, Tipo: ${blob.type}`);
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          if (base64 && base64.length > 0) {
            console.log(`Imagen convertida a base64: ${url} - Longitud: ${base64.length}`);
            resolve(base64);
          } else {
            console.warn(`Error: base64 vacío para imagen: ${url}`);
            resolve(null);
          }
        };
        reader.onerror = () => {
          console.warn(`Error al leer la imagen como base64: ${url}`, reader.error);
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn(`Error al cargar imagen ${url}:`, error);
      return null;
    }
  }

  // Función de prueba para verificar URLs de imágenes
  private async testImageUrls(data: any[]) {
    console.log('\n=== PRUEBA DE CONSTRUCCIÓN DE URLs ===');
    
    for (let i = 0; i < data.length; i++) {
      const herramienta = data[i];
      console.log(`\nHerramienta ${i + 1}: ${herramienta.nombre}`);
      console.log(`foto_url original: ${herramienta.foto_url}`);
      
      if (herramienta.foto_url) {
        const urlConstruida = this.getImagenUrl(herramienta.foto_url);
        console.log(`URL construida: ${urlConstruida}`);
        
        // Probar si la URL es accesible
        try {
          const response = await fetch(urlConstruida, { 
            method: 'HEAD',
            mode: 'cors',
            cache: 'no-cache'
          });
          
          if (response.ok) {
            console.log(`✅ URL accesible: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            console.log(`Content-Length: ${response.headers.get('content-length')} bytes`);
          } else {
            console.warn(`❌ URL no accesible: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error(`❌ Error al acceder a URL: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        console.log('❌ No tiene foto_url');
      }
    }
    console.log('=====================================\n');
  }
}
