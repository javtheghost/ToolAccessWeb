import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MobileDetectionService } from '../service/mobile-detection.service';
import { DamageTypesService, DamageType, DamageTypeCreateRequest, DamageTypeUpdateRequest } from '../service/damage-types.service';

@Component({
    selector: 'app-damage-types-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        ConfirmDialogModule,
        InputSwitchModule,
        InputIconModule,
        IconFieldModule,
        InputNumberModule,
        TooltipModule,
        SkeletonModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <p-table
        #dt
        [value]="damageTypes"
        [rows]="isMobile ? 3 : 5"
        [paginator]="true"
                    [globalFilterFields]="['nombre', 'descripcion']"
        [tableStyle]="{ 'min-width': '100%' }"
        [(selection)]="selectedDamageTypes"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="isMobile ? [3, 5, 10] : [5, 10, 15, 25]"
        [scrollable]="true"
        scrollHeight="300px"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <div>
                    <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Tipos de Daño</h5>
                    <p class="text-sm text-[var(--primary-color)] mt-1 px-2">
                        Gestiona los diferentes tipos de daños que pueden ocurrir en las herramientas.
                    </p>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1 w-full sm:w-auto">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end w-full sm:w-auto gap-2">
                    <p-button label="Nuevo Tipo de daño" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                    <p-button
                        [label]="showOnlyActive ? 'Ver Todas' : 'Solo Activos'"
                        [icon]="showOnlyActive ? 'pi pi-eye' : 'pi pi-eye-slash'"
                        (onClick)="toggleActiveView()"
                        styleClass="w-full sm:w-auto p-button-outlined">
                    </p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Porcentaje</th>
                <th>Activo</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-damageType>
            <tr class="hover:bg-gray-50" [ngClass]="{'opacity-60 bg-gray-100': !damageType.is_active}">
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600" [ngClass]="{'text-gray-400': !damageType.is_active}">{{ damageType.id }}</span>
                </td>
                <td class="p-3">
                    <div class="font-medium" [ngClass]="{'text-gray-500': !damageType.is_active}">{{ damageType.nombre }}</div>
                    <div *ngIf="damageType.is_active" class="text-xs text-green-600 mt-1">Activo</div>
                    <div *ngIf="!damageType.is_active" class="text-xs text-red-500 mt-1">Inactivo</div>
                </td>
                <td class="p-3">
                    <span *ngIf="damageType.descripcion && damageType.descripcion.trim()" [ngClass]="{'text-gray-500': !damageType.is_active}">{{ damageType.descripcion }}</span>
                    <span *ngIf="!damageType.descripcion || !damageType.descripcion.trim()" class="text-gray-400 font-bold">Sin descripción</span>
                </td>
                <td class="text-center p-3" [ngClass]="{'text-gray-500': !damageType.is_active}">
                    <span class="font-medium">{{ damageType.porcentaje_aplicar }}%</span>
                </td>
                <td class="text-center p-3">
                    <p-inputswitch
                        [(ngModel)]="damageType.is_active"
                        (onChange)="toggleDamageTypeStatus(damageType)"
                        [disabled]="loading"
                        pTooltip="Cambiar estado del tipo de daño"
                        tooltipPosition="top">
                    </p-inputswitch>
                </td>
                <td>
                    <p-button
                        (click)="editDamageType(damageType)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                        pTooltip="Editar tipo de daño"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <!-- Botón de eliminar removido - ahora se maneja con el switch -->
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <i class="material-symbols-outlined text-6xl text-gray-300">database</i>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay tipos de daño</h3>
                            <p class="text-gray-500">Aún no se han registrado tipos de daño. Utiliza el botón "Nuevo Tipo de daño" para agregar el primer tipo.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>
<p-dialog
  [(visible)]="damageTypeDialog"
  [style]="{ width: '95vw', maxWidth: '600px' }"
  [modal]="true"
  [draggable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Tipo de Daño' : 'Nuevo Tipo de Daño' }}
    </span>
  </ng-template>
  <ng-template pTemplate="content">
    <form [formGroup]="damageTypeForm" (ngSubmit)="saveDamageType()">
        <div class="grid grid-cols-1 gap-4">
            <!-- Nombre del tipo de daño -->
            <div class="relative col-span-1 py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">edit</span>
                <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Nombre"
                    [class.border-red-500]="isFieldInvalid('nombre')"
                    [class.border-gray-300]="!isFieldInvalid('nombre')" />
                <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre <span class="text-red-500">*</span></label>
                <div *ngIf="isFieldInvalid('nombre')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('nombre') }}</div>
            </div>

            <!-- Descripción -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_document</span>
                <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="3"
                    class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Descripción"
                    [class.border-red-500]="isFieldInvalid('descripcion')"
                    [class.border-gray-300]="!isFieldInvalid('descripcion')"></textarea>
                <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción</label>
                <div *ngIf="isFieldInvalid('descripcion')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('descripcion') }}</div>
            </div>

            <!-- Porcentaje a aplicar -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-10">percent</span>
                <label for="porcentaje_aplicar" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Porcentaje <span class="text-red-500">*</span></label>
                <p-inputnumber
                    formControlName="porcentaje_aplicar"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    [min]="0"
                    [max]="100"
                    placeholder="0.00%"
                    class="w-full"
                    [showButtons]="false"
                    [useGrouping]="false"
                    [locale]="'es-MX'"
                    styleClass="custom-inputnumber"
                    [class.border-red-500]="isFieldInvalid('porcentaje_aplicar')"
                    [class.border-gray-300]="!isFieldInvalid('porcentaje_aplicar')"
                    (onBlur)="onPorcentajeBlur()">
                </p-inputnumber>
                <div *ngIf="isFieldInvalid('porcentaje_aplicar')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('porcentaje_aplicar') }}</div>
            </div>

            <!-- Estado activo -->
            <div class="flex flex-col items-center justify-center col-span-1">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" formControlName="is_active" />
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="submit" class="p-button w-full sm:w-24" [disabled]="damageTypeForm.invalid || saving">
                <span *ngIf="saving">Guardando...</span>
                <span *ngIf="!saving">Guardar</span>
            </button>
        </div>
    </form>
  </ng-template>
</p-dialog>
<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative" style="background: #fff;">
    <button type="button" (click)="onCustomConfirmReject()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="flex flex-col items-start">
      <i class="material-symbols-outlined text-6xl mb-4"
        [ngClass]="{
          'text-danger': confirmIcon === 'delete',
          'text-warning': confirmIcon === 'warning'
        }"
      >{{ confirmIcon }}</i>
      <div class="text-left mb-6">
        <div [innerHTML]="confirmMessage"></div>
      </div>
      <div class="flex gap-4 self-end">
        <button type="button"
          class="custom-cancel-btn px-4 py-2 font-semibold w-24 text-center"
          (click)="onCustomConfirmReject()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning'"
          class="px-4 py-2 rounded font-semibold w-24 text-center"
          (click)="onCustomConfirmAccept()"
        >Aceptar</button>
      </div>
    </div>
  </div>
</div>
    `,
    providers: [MessageService],
    styles: [
        `/* Estilos para hacer el modal más suave y sin aspecto cuadrado */
        :host ::ng-deep .p-dialog {
            border-radius: 12px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-header {
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
            background: #fff !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
            background: #fff !important;
        }

        /* Estilos personalizados para p-inputnumber */
        :host ::ng-deep .custom-inputnumber {
            width: 100% !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext {
            padding-left: 2.5rem !important;
            padding-top: 1rem !important;
            height: 3rem !important;
            border-radius: 0.5rem !important;
            border: 1px solid #d1d5db !important;
            background-color: transparent !important;
            font-size: 0.875rem !important;
            color: #111827 !important;
            transition: all 0.3s ease !important;
            width: 100% !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext:focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext::placeholder {
            color: #9ca3af !important;
            font-size: 0.875rem !important;
            font-weight: 400 !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext:hover {
            border-color: #9ca3af !important;
        }

        /* Estilos para el label del porcentaje */
        :host ::ng-deep .custom-inputnumber .p-inputtext:focus + label,
        :host ::ng-deep .custom-inputnumber .p-inputtext:not(:placeholder-shown) + label {
            transform: translateY(-0.5rem) scale(0.75) !important;
            color: var(--primary-color) !important;
        }

        /* Estilos para campos con errores */
        .border-red-500 {
            border-color: #ef4444 !important;
        }

        .border-gray-300 {
            border-color: #d1d5db !important;
        }

        /* Estilos para mensajes de error */
        .text-red-500 {
            color: #ef4444 !important;
        }

        .text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
        }

        .mt-1 {
            margin-top: 0.25rem !important;
        }

        .ml-10 {
            margin-left: 2.5rem !important;
        }

        /* Estilos del switch removidos - usar estilos por defecto de PrimeNG */
    `]
})
export class DamageTypesCrudComponent implements OnInit {
    damageTypes: DamageType[] = [];
    damageTypeDialog: boolean = false;
    damageType: DamageType = this.emptyDamageType();
    selectedDamageTypes: DamageType[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // Formulario
    damageTypeForm!: FormGroup;

    // Detección de dispositivo móvil
    isMobile = false;

    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    // Estados
    loading: boolean = false;
    saving: boolean = false;
    showOnlyActive: boolean = true;

    constructor(
        private messageService: MessageService,
        private mobileDetectionService: MobileDetectionService,
        private damageTypesService: DamageTypesService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadDamageTypes();
        this.setupMobileDetection();
    }

    initForm() {
        this.damageTypeForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            descripcion: ['', [Validators.maxLength(300)]],
            porcentaje_aplicar: [0, [
                Validators.required,
                Validators.min(0),
                Validators.max(100),
                this.validateDecimalPlaces.bind(this)
            ]],
            is_active: [true]
        });
    }

    // Validador personalizado para decimales
    validateDecimalPlaces(control: any) {
        if (control.value === null || control.value === undefined) {
            return null;
        }

        const value = control.value;
        const decimalPlaces = (value.toString().split('.')[1] || '').length;

        if (decimalPlaces > 2) {
            return { maxDecimalPlaces: { max: 2, actual: decimalPlaces } };
        }

        return null;
    }

    // Getters para validación
    get nombre() { return this.damageTypeForm.get('nombre'); }
    get descripcion() { return this.damageTypeForm.get('descripcion'); }
    get porcentaje_aplicar() { return this.damageTypeForm.get('porcentaje_aplicar'); }
    get is_active() { return this.damageTypeForm.get('is_active'); }

    getErrorMessage(controlName: string): string {
        const control = this.damageTypeForm.get(controlName);
        if (control?.errors) {
            if (control.errors['required']) {
                if (controlName === 'nombre') {
                    return 'El nombre es obligatorio';
                }
                if (controlName === 'porcentaje_aplicar') {
                    return 'El porcentaje es obligatorio';
                }
                return 'Este campo es obligatorio';
            }
            if (control.errors['minlength']) {
                if (controlName === 'nombre') {
                    return 'Mínimo 2 caracteres';
                }
                return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
            }
            if (control.errors['maxlength']) {
                if (controlName === 'nombre') {
                    return 'Máximo 50 caracteres';
                }
                if (controlName === 'descripcion') {
                    return 'Máximo 300 caracteres';
                }
                return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
            }
            if (control.errors['min']) {
                if (controlName === 'porcentaje_aplicar') {
                    return 'El porcentaje debe ser mayor o igual a 0%';
                }
                return `Valor mínimo: ${control.errors['min'].min}`;
            }
            if (control.errors['max']) {
                if (controlName === 'porcentaje_aplicar') {
                    return 'El porcentaje no puede exceder 100%';
                }
                return `Valor máximo: ${control.errors['max'].max}`;
            }
            if (control.errors['pattern']) {
                if (controlName === 'porcentaje_aplicar') {
                    return 'Formato inválido. Use números del 0 al 100 con máximo 2 decimales';
                }
                return 'Formato inválido';
            }
            if (control.errors['maxDecimalPlaces']) {
                if (controlName === 'porcentaje_aplicar') {
                    return `El porcentaje debe tener máximo 2 decimales (tiene ${control.errors['maxDecimalPlaces'].actual})`;
                }
                return `Máximo ${control.errors['maxDecimalPlaces'].max} decimales permitidos`;
            }
        }
        return '';
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.damageTypeForm.get(controlName);
        return !!(control?.invalid && control?.touched);
    }

    loadDamageTypes() {
        this.loading = true;
        this.damageTypesService.getDamageTypes(undefined, this.showOnlyActive).subscribe({
            next: (data) => {
                this.damageTypes = data;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar tipos de daño'
                });
                this.loading = false;
            }
        });
    }

    toggleActiveView() {
        this.showOnlyActive = !this.showOnlyActive;
        this.loadDamageTypes();
        this.messageService.add({
            severity: 'info',
            summary: 'Vista cambiada',
            detail: this.showOnlyActive ? 'Mostrando solo tipos de daño activos' : 'Mostrando todos los tipos de daño',
            life: 2000
        });
    }

    // Método para cambiar el estado del tipo de daño directamente
    toggleDamageTypeStatus(damageType: DamageType) {
        const newStatus = damageType.is_active;

        if (newStatus) {
            // Activar tipo de daño
            this.damageTypesService.reactivateDamageType(damageType.id).subscribe({
                next: (updatedDamageType) => {
                    const idx = this.damageTypes.findIndex(d => d.id === damageType.id);
                    if (idx > -1) this.damageTypes[idx] = updatedDamageType;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tipo de daño activado',
                        life: 3000
                    });
                },
                error: (error) => {
                    // Revertir el switch si hay error
                    damageType.is_active = !newStatus;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al activar tipo de daño',
                        life: 3000
                    });
                }
            });
        } else {
            // Desactivar tipo de daño (eliminar)
            this.damageTypesService.deleteDamageType(damageType.id).subscribe({
                next: () => {
                    // Actualizar el estado local
                    damageType.is_active = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tipo de daño desactivado',
                        life: 3000
                    });
                },
                error: (error) => {
                    // Revertir el switch si hay error
                    damageType.is_active = !newStatus;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al desactivar tipo de daño',
                        life: 3000
                    });
                }
            });
        }
    }

    private setupMobileDetection() {
        // Suscribirse a los cambios de detección móvil
        this.mobileDetectionService.isMobile$.subscribe(isMobile => {
            this.isMobile = isMobile;
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.damageType = this.emptyDamageType();
        this.isEditMode = false;
        this.damageTypeForm.reset({
            nombre: '',
            descripcion: '',
            porcentaje_aplicar: 0,
            is_active: true
        });
        this.damageTypeDialog = true;
    }

    editDamageType(damageType: DamageType) {
        this.damageType = { ...damageType };
        this.isEditMode = true;
        this.damageTypeForm.patchValue({
            nombre: damageType.nombre,
            descripcion: damageType.descripcion || '',
            porcentaje_aplicar: damageType.porcentaje_aplicar,
            is_active: damageType.is_active
        });
        this.damageTypeDialog = true;
    }

    deleteDamageType(damageType: DamageType) {
        this.confirmMessage = `¿Estás seguro de que deseas eliminar el tipo de daño "${damageType.nombre}"? Esta acción no se puede deshacer.`;
        this.confirmIcon = 'delete';
        this.confirmAction = () => {
            this.damageTypesService.deleteDamageType(damageType.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tipo de daño eliminado correctamente'
                    });
                    this.loadDamageTypes();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al eliminar tipo de daño'
                    });
                }
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.damageTypeDialog = false;
        this.damageTypeForm.reset();
    }

    saveDamageType() {
        if (this.damageTypeForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.saving = true;
        const formValue = this.damageTypeForm.value;

        // Asegurar que el porcentaje tenga máximo 2 decimales y esté dentro del rango válido
        let porcentajeRedondeado = Math.round(formValue.porcentaje_aplicar * 100) / 100;

        // Validar que esté dentro del rango 0-100
        if (porcentajeRedondeado < 0) porcentajeRedondeado = 0;
        if (porcentajeRedondeado > 100) porcentajeRedondeado = 100;

        // Verificar que no tenga más de 2 decimales
        const decimalPlaces = (porcentajeRedondeado.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de validación',
                detail: 'El porcentaje debe tener máximo 2 decimales'
            });
            this.saving = false;
            return;
        }

        if (this.isEditMode) {
            const updateRequest: DamageTypeUpdateRequest = {
                nombre: formValue.nombre,
                descripcion: formValue.descripcion,
                porcentaje_aplicar: porcentajeRedondeado,
                is_active: formValue.is_active
            };

            this.damageTypesService.updateDamageType(this.damageType.id, updateRequest).subscribe({
                next: (updatedDamageType) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tipo de daño actualizado correctamente'
                    });
                    this.hideDialog();
                    this.loadDamageTypes();
                    this.saving = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al actualizar tipo de daño'
                    });
                    this.saving = false;
                }
            });
        } else {
            const createRequest: DamageTypeCreateRequest = {
                nombre: formValue.nombre,
                descripcion: formValue.descripcion,
                porcentaje_aplicar: porcentajeRedondeado,
                is_active: formValue.is_active
            };

            this.damageTypesService.createDamageType(createRequest).subscribe({
                next: (newDamageType) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tipo de daño creado correctamente'
                    });
                    this.hideDialog();
                    this.loadDamageTypes();
                    this.saving = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al crear tipo de daño'
                    });
                    this.saving = false;
                }
            });
        }
    }

    markFormGroupTouched() {
        Object.keys(this.damageTypeForm.controls).forEach(key => {
            const control = this.damageTypeForm.get(key);
            control?.markAsTouched();
        });
    }

    onCustomConfirmAccept() {
        if (this.confirmAction) this.confirmAction();
        this.showCustomConfirm = false;
    }
    onCustomConfirmReject() {
        this.showCustomConfirm = false;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    emptyDamageType(): DamageType {
        return {
            id: 0,
            nombre: '',
            descripcion: '',
            porcentaje_aplicar: 0,
            is_active: true
        };
    }

    onPorcentajeBlur() {
        const control = this.damageTypeForm.get('porcentaje_aplicar');
        if (control && control.value !== null && control.value !== undefined) {
            // Redondear a 2 decimales
            const valorRedondeado = Math.round(control.value * 100) / 100;

            // Asegurar que esté dentro del rango válido
            const valorFinal = Math.max(0, Math.min(100, valorRedondeado));

            control.setValue(valorFinal);

            // Validar el campo después del cambio
            control.updateValueAndValidity();
        }
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.damageTypeDialog) {
            this.hideDialog();
        }
    }
}
